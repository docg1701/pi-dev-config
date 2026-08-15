# Architecture — radtracker SSH access management

> Blueprint for a single-user web app whose authentication state is managed
> entirely through an interactive SSH CLI. The core idea: **the web plane can
> only read credentials; only the SSH plane can write them.** Use this as a
> template for any self-hosted app that wants 2FA without a web-based setup
> flow, an admin panel, or a second service.

---

## 1. Philosophy

- **TOTP secret never touches the web.** 2FA activation/reset happens only
  inside a terminal over SSH. The QR code is rendered by `qrencode` in the
  terminal; the secret's only storage is `auth.json` on the host. No browser
  request ever carries or creates it.
- **One file, stdlib crypto.** The entire authentication state is
  `data/auth.json` — a single JSON file. All crypto is Python stdlib
  (`hashlib.scrypt`, `hmac`, `secrets`, RFC 6238 implemented by hand). Zero
  dependencies added for auth.
- **Idempotent bootstrap, never overwrite.** The Ansible deploy creates
  `auth.json` exactly once. Redeploys, updates, and the repair path never
  silently clobber existing credentials.
- **Atomic, locked-down writes.** Every write goes through one function
  (`save_auth`) that writes to a temp file, `chmod 0600` **before** rename,
  then `os.replace`. A crash mid-write leaves either the old or the new file,
  never a torn one, never one with loose permissions.
- **Fail loud.** Missing or malformed `auth.json` raises `AuthError` with a
  message naming the offending key and expected type. The app shows an error
  instead of rendering; the CLI offers repair. No silent defaults.
- **Verifiers never raise.** Every crypto/verification function returns `False`
  on malformed input (bad base32, non-hex secret, garbage token) instead of
  throwing — an attacker controlling inputs must not be able to crash or
  fingerprint internals through exceptions.

## 2. The two planes

```text
WEB PLANE (read-only)                      SSH PLANE (read/write)
───────────────                            ──────────────
Browser ──HTTPS──> Caddy ──> Streamlit     Operator ──SSH──> VPS shell
                    │ 127.0.0.1:8501              │
                    v                             v
              app.py → load_auth()         /usr/local/bin/radtracker-auth
              render_login_gate()               │ docker compose exec
              (password → TOTP)                 v
                    │                python -m scripts.manage_auth
                    │  reads                    │  reads + save_auth()
                    v                           v
              data/auth.json  <────────────────┘
              (0600, shared bind mount data/)
```

The two planes meet only at the file. Streamlit holds the file in read-only
mode for its whole process (`load_auth` per rerun, no save path anywhere in
the web code). The CLI is the only writer. This separation is what makes a
web compromise unable to disable 2FA, rotate the session secret, or change
the password — the attacker would need SSH.

## 3. Component map

| File | Responsibility |
|------|----------------|
| `src/auth_crypto.py` | Pure crypto, no I/O, no Streamlit: scrypt hashing, RFC 6238 TOTP, `otpauth://` URI, HMAC-SHA256 session tokens |
| `src/auth_store.py` | `auth.json` load/save/validate, gate helpers (`verify_login`, `verify_totp_code`, session token helpers), idempotent bootstrap |
| `src/auth_bootstrap.py` | Non-interactive bootstrap for Ansible: reads `data/.auth_creds`, creates `auth.json` once, prints `created`/`exists` |
| `src/cookies.py` | One-way CCv2 cookie components (reader/writer) + session-cookie helpers |
| `src/ui/login.py` | Web gate: restore → login form → TOTP step; sidebar header/footer; logout |
| `scripts/manage_auth.py` | Interactive SSH CLI (KIAUH-style menu), the only writer besides bootstrap |
| `ansible/playbooks/deploy.yml` | Writes `.auth_creds` (`no_log`), runs bootstrap in container, installs the wrapper, adds the SSH user to the `docker` group, fail2ban sshd jail |
| `tests/test_auth_*.py`, `test_manage_auth.py` | Behavior pins: 62 tests (26 crypto + 25 store + 8 bootstrap + 3 manage_auth). `src/cookies.py` has no unit suite — the one-way CCv2 components are validated by browser smoke tests |

## 4. The state file: `data/auth.json`

### 4.1 Schema (version 1)

```json
{
  "version": 1,
  "username": "galvani",
  "password_hash": "scrypt$16384$8$1$<salt_hex>$<digest_hex>",
  "totp_secret": null,
  "totp_required": false,
  "totp_step_seconds": 30,
  "totp_window_steps": 1,
  "session_secret": "<64 hex chars>",
  "session_days": 30,
  "session_cookie_secure": true
}
```

Field semantics:

- `password_hash` — self-describing scrypt string `scrypt$n$r$p$salt$hash`;
  params stored with the hash so future param upgrades don't break old hashes.
- `totp_secret` — base32 without padding (32 chars), or `null` when never
  configured. `totp_required` is the gate; the secret is kept on disable so
  re-enabling doesn't force a re-scan (but option 1 always mints a new one).
- `session_secret` — 256-bit hex key for HMAC session cookies. Rotating it
  invalidates every outstanding cookie instantly.
- `session_days` — 1–365. Cookie max-age = days × 86400. Expiry **is** the
  re-auth interval (see §9).
- `session_cookie_secure` — drives the `Secure` flag on the session cookie.
  `false` only for local dev over plain HTTP (bootstrap line 3).

### 4.2 Load / validate / save

- `load_auth` → strict validation against a per-key type spec. `bool` in an
  `int` field is rejected explicitly (Python `isinstance(True, int)` trap).
  Errors name the key and expected type.
- `save_auth` → temp file + `chmod 0o600` + `os.replace`. The chmod happens
  before the rename, so the file never exists with default umask perms even
  for a microsecond after publication.
- `AUTH_PATH = "data/auth.json"` — relative to cwd; in the container
  `WORKDIR=/app` resolves to the bind-mounted `data/`. Shared constant between
  the app, the CLI, and bootstrap.

### 4.3 Invariants

- App process: only `load_auth` + read helpers. No `save_auth` import in web
  modules.
- CLI process: `load_auth` once at start, then mutate the dict and
  `save_auth` — each menu option is one read-modify-write cycle.
- The file is deliberately **not** included in backups (only `telerrad.db`
  is). Loss is recovered via repair or redeploy, never restored stale.

## 5. Crypto layer (`auth_crypto.py`)

### 5.1 Password hashing

- `hash_password` — scrypt with n=16384, r=8, p=1, 16-byte salt, 32-byte
  digest. OWASP minimum for interactive logins; the cost doubles as a soft
  brute-force throttle.
- `verify_password` — re-derives and compares with `hmac.compare_digest`.
  Malformed stored strings return `False` (never raise).

### 5.2 TOTP (RFC 6238)

- `new_totp_secret` — 20 random bytes, base32 no-padding (32 chars).
- `_hotp` — HMAC-SHA1, dynamic truncation, 6 digits.
- `verify_totp` — window ±1 step (3 counters) via `step_seconds`/`window_steps`
  from the schema; constant-time compare; rejects non-digit codes outright.
- `otpauth_uri` — `otpauth://totp/Radtracker:<user>?secret=...&issuer=Radtracker`
  with URL-encoded username. Same string feeds the terminal QR and the
  manual-entry fallback.

### 5.3 Session tokens

Format: `<expires_epoch>.<hmac_hex>`, HMAC-SHA256 over
`radtracker-session:<username>:<expires_epoch>` keyed by `session_secret`.

- No random component — the token is deterministic given
  (username, secret, expiry). Freshness comes from expiry, not entropy.
- Username is inside the MAC message → a username change invalidates all
  tokens without touching the secret (§8 revocation matrix).
- `verify_session` — expiry check first, then constant-time MAC compare.
  Non-ASCII tokens rejected before parsing (no exceptions from hostile input).

## 6. Store layer (`auth_store.py`)

| Function | Role |
|----------|------|
| `load_auth` / `save_auth` | File I/O with validation / atomic 0600 write |
| `create_bootstrap_auth` | First-time creation; returns `"created"` or `"exists"`; enforces `MIN_PASSWORD_LEN = 8`, non-empty username |
| `verify_login` | Username equality **then** password check — wrong username skips scrypt (fast fail; username is not treated as secret) |
| `verify_totp_code` | Schema-aware TOTP check; `False` when no secret configured |
| `new_session_token` / `verify_session_token` | Token minting/validation against the current username/secret |
| `is_totp_required` | The gate predicate, re-read from the file every run |

## 7. Non-interactive bootstrap (`auth_bootstrap.py`)

Ansible-only path. Reads `data/.auth_creds`:

```text
<username>
<password>
cookie_secure:true|false   (optional line, default true)
```

Behavior contract:

- `auth.json` missing + creds present → create it, print `created`, exit 0.
- `auth.json` present → print `exists`, exit 0, **never overwrite**.
- creds missing + no auth.json → error to stderr, exit 1.
- malformed line 3 → `AuthError`, exit 1.

Ansible keys `changed_when` off the stdout marker. The deploy writes
`.auth_creds` with `no_log: true`, mode 0600, and removes it in an `always:`
block — the plaintext password exists on disk only for the seconds the
bootstrap exec runs.

## 8. The SSH CLI (`manage_auth.py`, wrapper `radtracker-auth`)

KIAUH-style single-key menu, PT-BR, needs a TTY (`input`/`getpass`). The
host wrapper is a one-liner installed by Ansible:

```sh
exec docker compose --project-directory /home/<user>/radtracker \
  exec streamlit python -m scripts.manage_auth
```

The CLI runs **inside the app container** — same code, same `AUTH_PATH`,
same mounted `data/` — so there is exactly one definition of the schema and
one writer, exercised identically in dev and prod.

Wrapper prerequisites (all enforced by `deploy.yml` — do not remove any):

- the SSH user must be in the `docker` group (otherwise `docker compose`
  fails with `permission denied while trying to connect to the docker API`);
- the host `.env` (DOMAIN/TZ/RADTRACKER_MODE only, no secrets) must be
  world-readable (0644) — `docker compose` reads it even for `exec`, and a
  0600 root-owned `.env` makes the wrapper fail for non-root users;
- `scripts/` must be part of the container image (it was once excluded by
  `.dockerignore`, which made `python -m scripts.manage_auth` fail with
  `ModuleNotFoundError`).

### 8.1 Menu v7 semantics

Live screens (captured from the VPS) in §15.

| # | Option | Effect | Session revocation |
|---|--------|--------|--------------------|
| 1 | Ativar / reconfigurar 2FA | Mints a **new** secret, shows QR (`qrencode -t ANSIUTF8`), prints manual URI, requires a valid current code before saving | No (sessions survive) |
| 2 | Desativar 2FA | `totp_required=False`; secret kept for later re-enable | No |
| 3 | Trocar senha | New scrypt hash + **new `session_secret`** | **All sessions die** |
| 4 | Trocar usuário | Username change — MAC message changes | **All sessions die** (no secret rotation needed) |
| 5 | Sessão web (dias) | 1–365; sets `session_days` + **new `session_secret`** | **All sessions die** |
| 6 | Reparar auth.json | Only offered when `load_auth` fails at startup; re-inits after confirm | All (fresh file) |
| 7 | Status | Username, 2FA state, TOTP step/window, session days, file mode — **never prints secrets** | — |
| 0 | Sair | — | — |

Design details:

- Option 1 re-scan warning: if 2FA is already on, the QR contains a *new*
  secret — the old one stays valid until the new code verifies, so a botched
  re-scan never locks the operator out. Save happens only after
  `verify_totp` on the new secret succeeds.
- Option 3/5 rotate `session_secret` deliberately: changing the *policy*
  (session length) without killing existing long cookies would let old
  sessions outlive the new limit.
- The menu loop catches `AuthError`/`EOFError`/`KeyboardInterrupt` per
  operation and returns to the menu — a failed save never kills the shell
  flow.
- If `load_auth` fails at startup (corrupt/missing file), the CLI prints the
  validation error and offers repair immediately instead of looping on a
  broken dict.

## 9. Session lifecycle (web plane)

### 9.1 Gate state machine

```text
rrun start
  └─ render_cookie_writer()            # always rendered once (see 9.3)
  └─ "auth_authenticated" not in session_state?
       └─ _restore_session: cookie token → verify → set state (once per
          server session — key presence gates it)
  └─ authenticated? → return (app renders)
  └─ else login form (st.form only — Enter submits atomically)
       └─ verify_login ok?
            └─ TOTP required? → TOTP form (max_chars=6)
                 └─ verify_totp_code → _establish_session
            └─ else → _establish_session
       └─ st.stop()  # gate blocks everything below (DB boot included)
```

`_establish_session` mints `expires = now + session_days*86400` and queues a
cookie write with `max-age` and `Secure` from the schema.

### 9.2 Logout

`auth_authenticated = False` (key never removed — removing it would make the
next run attempt a cookie restore and re-authenticate before the async cookie
delete lands) + queued cookie delete (`max-age=0`). The delete is executed by
the same writer component on the next render.

### 9.3 The CCv2 one-way cookie contract

Streamlit's custom-component API has no native cookie handling; the extras
CookieManager caused rerun races (its snapshot republished on every cookie
change). The replacement is two tiny one-way components:

- **Reader** — publishes `document.cookie` as JSON **once per server
  session** (its `default` needs `on_snapshot_json_change=lambda: None`,
  else `BidiComponentInvalidDefaultKeyError`), then renders with `read=False`
  forever. After the first snapshot, `read_cookies_once()` returns the cached
  dict from session state.
- **Writer** — never publishes. Applies queued `{name, value, maxAge,
  secure}` ops from session state on render, then clears the queue. Rendered
  ONLY inside `render_login_gate` (a second render →
  `StreamlitDuplicateElementId`).

Cookie flags: `path=/`, `max-age`, `Secure` (schema-driven),
`samesite=lax`. **No `HttpOnly`** — the reader must see the token via
`document.cookie`; this is an accepted risk (§11), not an oversight.

## 10. Deploy wiring (Ansible)

Sequence in `deploy.yml` (auth-relevant):

1. Vault-encrypted `auth_username` / `auth_password` in `group_vars/all.yml`
   (per-value `!vault`, file committed; vault password in gitignored
   `ansible/.vault_pass`).
2. Write `data/.auth_creds` on host — `no_log: true`, owner 1000, mode 0600.
3. `docker compose exec streamlit python -m src.auth_bootstrap` — register
   output, `changed_when: stdout is search("created")`.
4. `always:` remove `.auth_creds`.
5. Install `/usr/local/bin/radtracker-auth` wrapper (0755).
6. fail2ban: `sshd` jail only (the Caddy 401 jail died with BasicAuth);
   journald backend, LAN private ranges whitelisted.
7. Health check hits `/_stcore/health` — no auth needed, no data exposed.

Redeploys (`update.yml`) skip the bootstrap entirely — `auth.json` survives
every update because the `data/` bind mount is never touched.

## 11. Security properties and accepted risks

Properties:

- TOTP secret, password hash, session secret exist only in `auth.json`
  (0600) and its writer is reachable only via SSH.
- No credentials in logs: bootstrap uses `no_log`, the CLI uses `getpass`
  (no echo), status never prints secrets, the web never logs them.
- Constant-time compares on password hash, TOTP code, session MAC.
- No app-level lockout by design — a password+TOTP stack makes lockouts
  unnecessary (see risks).
- 2FA enable is a two-factor-confirmed operation (operator confirms by
  producing a code from the *new* secret before it is saved).

Accepted risks (documented, deliberate):

- **No app-level rate limiting** on login/TOTP forms (by design). scrypt
  cost is the soft throttle; TOTP is the anti-robot barrier; the edge rate
  limiting rule at Cloudflare (production domain `radtracker.drgalvanimd.com`,
  proxied) is the network barrier — 10 POSTs/min on `/`, block 10 min. See
  `docs/deployment.md` §8 in the radtracker repo for the exact rule config.
- **Session cookie readable by JS** (no HttpOnly). XSS = session theft; the
  compensating controls are Streamlit's default HTML escaping and the
  project's `unsafe_allow_html` ban (two static exceptions only).
- **Wrong username skips scrypt** — a timing side channel reveals whether a
  username exists. Username is not treated as secret (it's semi-public).
- **TOTP window ±1** trades a small replay surface for clock-drift tolerance.
- **Terminal QR over SSH**: a shoulder-surfer on the operator's terminal
  could capture the secret at setup time. Accepted for a single-operator box.

## 12. Failure modes and repair

| Failure | Detection | Recovery |
|---------|-----------|----------|
| `auth.json` missing | App: `st.error` + stop. CLI: error + repair prompt | `radtracker-auth` → repair (option offered immediately), or redeploy bootstrap (creates only if absent) |
| `auth.json` corrupt (bad JSON / schema) | `load_auth` `AuthError` naming the violation | Same path — repair re-initializes from scratch after explicit confirmation |
| Operator forgot password | Can't log in | SSH in → option 3 (no old password required — SSH trust, not web auth, gates the CLI) |
| Operator lost phone (2FA) | Can't pass TOTP step | SSH in → option 1 (new secret, new QR) or option 2 (disable) |
| `qrencode` missing | Option 1 prints notice | Manual URI fallback is always printed |
| No TTY on SSH session | `getpass` raises | Use a real TTY (`ssh -t`); the wrapper exec needs the TTY allocated |
| `data/` lost entirely | App fails loud on missing DB/auth | Restore `telerrad.db` from backup; re-init `auth.json` via repair or redeploy (auth.json intentionally not backed up) |

## 13. Test coverage

62 tests pin the behavior: RFC 6238 vectors (`test_totp_code_rfc_vectors_match`),
window boundaries, malformed-input-no-exception for every verifier, scrypt
format round-trip and tamper cases, atomic save + 0600 mode, strict schema
validation (incl. bool-in-int), bootstrap idempotence and exit codes,
session-token tamper/expiry/rotation cases, and the CLI's session-days
rotation semantics. The CLI's interactive paths are covered via the pure
helpers; the menu loop itself is exercised by hand on the VPS.
`src/cookies.py` (one-way CCv2 components) has no unit suite — pinned by
browser smoke tests instead.

## 14. Invariants when evolving

Do not break:

- Only `save_auth` writes the file; keep the chmod-before-rename order.
- Web plane has no save path — never add one, even for "convenience".
- Cookie reader publishes exactly once per server session; writer renders
  exactly once (inside the gate); keep the `on_snapshot_json_change` lambda.
- Login/TOTP forms stay `st.form` (Enter-submit atomicity) — the only forms
  in the app.
- `auth_authenticated` is set to `False` on logout, never removed.
- Rotation semantics: password/session-days changes rotate `session_secret`;
  username change must not require it but must still invalidate via the MAC
  message.
- 2FA saves only after the operator proves possession of the new secret.
- Status output never includes secrets; `no_log` on every Ansible task that
  touches credentials.
- Any new auth file key requires a schema-version decision and a strict
  validator entry — fail loud, never default.

## 15. Screens — the CLI as the operator sees it

Captured from the live VPS (`ssh -t galvani@<vps> radtracker-auth`, menu v7,
PT-BR). The QR block and TOTP secrets are redacted — option 1 mints a secret
that is only saved after verification, so the captured ones never persisted.

### 15.1 Main menu

```text
┌──────────────────────────────────────────┐
│ Radtracker — Gestão de autenticação      │
├──────────────────────────────────────────┤
│ 1) Ativar / reconfigurar 2FA (QR code)   │
│ 2) Desativar 2FA                         │
│ 3) Trocar senha                          │
│ 4) Trocar usuário                        │
│ 5) Sessão web (dias)                     │
│ 6) Reparar auth.json                     │
│ 7) Status                                │
│ 0) Sair                                  │
└──────────────────────────────────────────┘
Opção: _
```

### 15.2 Status (7)

```text
Opção: 7
Usuário: galvani
2FA: ativada
TOTP: passo 30s, janela ±1
Sessão web: 7 dias, cookie secure=True
Arquivo: data/auth.json (modo 600)
```

Never prints secrets — the session secret and TOTP secret exist only in the
file, which is why this screen is safe to screenshot.

### 15.3 Ativar / reconfigurar 2FA (1)

```text
Opção: 1
2FA já ativada — o QR abaixo contém um NOVO segredo; re-escaneie antes de digitar o código.
[QR code ANSI renderizado pelo qrencode no terminal — omitido]
URI manual: otpauth://totp/Radtracker:galvani?secret=<SECRET>&issuer=Radtracker
Digite o código atual do autenticador: 000000
Código inválido — 2FA inalterada.
```

Proof-of-possession gate: the new secret is saved only when a code generated
from **it** verifies. The failed attempt above left the previous 2FA secret
fully in force. When 2FA is off, the first line (re-scan warning) is absent.

### 15.4 Desativar 2FA (2)

```text
Opção: 2
Confirma desativar a 2FA? [s/N] n
Nada alterado.
```

Confirmation is `s` only; anything else (or Enter) declines. On `s`, the
secret is kept in the file for one-option re-enable later.

### 15.5 Trocar senha (3)

```text
Opção: 3
Nova senha: 
Repita a nova senha: 
Senha alterada — todas as sessões web foram encerradas.
```

`getpass` (no echo) on both prompts. Mismatch prints
"As senhas não conferem."; under 8 chars prints
"Senha curta demais — mínimo 8 caracteres.". Ctrl-D aborts
("Operação abortada") with no state change. On success the session secret
rotates — every browser must log in again.

### 15.6 Trocar usuário (4)

```text
Opção: 4
Novo usuário: <novo-nome>
Usuário alterado — sessões web anteriores foram encerradas.
```

Empty input refuses; Ctrl-D aborts. No secret rotation needed — the username
is inside the session MAC message, so old tokens fail validation immediately.

### 15.7 Sessão web (5)

```text
Opção: 5
Dias de duração da sessão (atual: 7, 1–365): abc
Valor inválido — precisa ser um número inteiro.

Opção: 5
Dias de duração da sessão (atual: 7, 1–365): 999
Fora do intervalo permitido (1–365).

Opção: 5
Dias de duração da sessão (atual: 7, 1–365): 14
Sessão web agora dura 14 dia(s). Cookies existentes foram invalidados — faça login novamente.
```

Both validation failures leave the file untouched; a valid change rotates the
session secret so old cookies die immediately (a policy change must not let
old sessions outlive the new limit).

### 15.8 Reparar auth.json (6) — healthy path

```text
Opção: 6
auth.json íntegro — nada a reparar.
```

### 15.9 Startup repair (corrupt/missing file)

From the code path (`main()` catches `AuthError` before the menu; not
captured on the live box to avoid touching state):

```text
Problema em data/auth.json: auth file not found: 'data/auth.json' (expected a JSON object)
Reparar agora? [s/N] _
```

`s` leads to the full re-init flow (username → new password ×2 → HTTPS
question → file recreated, 2FA off); `n` exits with code 1. The web app, in
parallel, fails loud with the same validation message behind the gate
instead of rendering.

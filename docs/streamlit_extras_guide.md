# `streamlit-extras` — Complete Analysis and Reference Guide

Consolidated guide for the **[`streamlit-extras`](https://arnaudmiribel.github.io/streamlit-extras/)** library, validated against the official source code (version **1.5.0**, April 2026) — all 56 extras cataloged, organized by category, with explicit signaling of what is **deprecated** and which native Streamlit feature replaces each case.

---

## Contents

1. [What it is](#1-what-it-is)
2. [When to use (and when not to)](#2-when-to-use-and-when-not-to)
3. [Installation and basic usage](#3-installation-and-basic-usage)
4. [Strategic analysis: what makes sense in 2026](#4-strategic-analysis-what-makes-sense-in-2026)
5. [Complete catalog of 56 extras](#5-complete-catalog-of-56-extras)
   - [5.1 Layout and containers](#51-layout-and-containers)
   - [5.2 Inputs and interactive widgets](#52-inputs-and-interactive-widgets)
   - [5.3 Visuals and branding](#53-visuals-and-branding)
   - [5.4 Charts and data visualization](#54-charts-and-data-visualization)
   - [5.5 Browser integration](#55-browser-integration)
   - [5.6 Development and debug utilities](#56-development-and-debug-utilities)
6. [Deprecated extras (and their native replacements)](#6-deprecated-extras-and-their-native-replacements)
7. [How to contribute](#7-how-to-contribute)
8. [Useful links](#8-useful-links)

---

## 1. What it is

`streamlit-extras` is a **community library** that gathers components and utilities that **aren't in the official Streamlit**. It's an Apache-2.0 project, maintained by:

- **Arnaud Miribel** ([@arnaudmiribel](https://github.com/arnaudmiribel)) — engineer at Snowflake/Streamlit
- **Zachary Blackwood** ([@blackary](https://github.com/blackary)) — engineer at Streamlit
- **Lukas Masuch** — engineer at Streamlit

Although they all work on/at Streamlit, **the library is not official** — it has no roadmap guarantees or release cycle tied to the core. It's a sandbox where component ideas mature before (or instead of) becoming official features.

**Metrics (Apr 2026):**
- ⭐ **956 stars** on GitHub
- 📦 **+11,600 projects** depend on it
- 🧩 **56 active extras** (50 functional + 6 deprecated)
- 🐍 **Python ≥ 3.10**, **Streamlit ≥ 1.54.0**
- 📅 Latest version: **1.5.0** (April 21, 2026)

Repository: <https://github.com/arnaudmiribel/streamlit-extras>
Documentation: <https://arnaudmiribel.github.io/streamlit-extras/>

---

## 2. When to use (and when not to)

### ✅ Use when:

- You need **a specific component** that doesn't exist in the core yet (e.g. `cookie_manager`, `eval_javascript`, `sigma_graph`).
- You're in **prototyping phase** and want to move fast.
- You want a quick **visual polish effect** (e.g. `let_it_rain`, `floating_button`, `radial_menu`).
- You need a specific **dev utility** (e.g. `concurrency_limiter`, `function_explorer`).

### ❌ Avoid when:

- The feature already exists **natively** in Streamlit (several extras became native — see [section 6](#6-deprecated-extras-and-their-native-replacements)).
- The component is **complex and critical** to the product: prefer dedicated mature packages (`streamlit-aggrid`, `streamlit-folium`, `streamlit-elements`).
- You're building something that needs **long-term maintenance guarantees** — `streamlit-extras` is volatile; extras can be deprecated as the core evolves.

### 🚦 General principle

> Always start with the core. Only pull `streamlit-extras` when you hit a concrete limitation.

---

## 3. Installation and basic usage

```bash
pip install streamlit-extras
# or with uv (recommended by the maintainers)
uv add streamlit-extras
```

Each extra is imported **individually** from its corresponding submodule — you don't import the whole library:

```python
from streamlit_extras.bottom_container import bottom
from streamlit_extras.let_it_rain import rain
from streamlit_extras.cookie_manager import cookie_manager
```

Naming convention:
- The **submodule** always has the name listed in this guide (e.g. `bottom_container`).
- The **public function** usually has a different name (e.g. `bottom`) — check the *Import* column in each category table.

---

## 4. Strategic analysis: what makes sense in 2026

Validating all extras against current Streamlit (≥ 1.54), they fall into **4 distinct groups**:

### Group A — "Absorbed by the core" (don't use anymore)

6 extras are **explicitly marked as deprecated** in the source code because official Streamlit started offering the feature natively, better integrated and more stable.

| Deprecated extra      | Native replacement in Streamlit                  |
| --------------------- | ------------------------------------------------ |
| `add_vertical_space`  | `st.write("")` or CSS margins                     |
| `app_logo`            | [`st.logo`](https://docs.streamlit.io/develop/api-reference/media/st.logo) (Streamlit 1.35+)             |
| `colored_header`      | [`st.header(divider=...)`](https://docs.streamlit.io/develop/api-reference/text/st.header)                     |
| `row`                 | [`st.columns(gap=...)`](https://docs.streamlit.io/develop/api-reference/layout/st.columns) with horizontal layout |
| `stylable_container`  | [`st.container(key=...)`](https://docs.streamlit.io/develop/api-reference/layout/st.container) (the `key` becomes a CSS class) |
| `tags`                | [`st.badge`](https://docs.streamlit.io/develop/api-reference/text/st.badge) and [`st.pills`](https://docs.streamlit.io/develop/api-reference/widgets/st.pills)                  |

### Group B — "Beat the core" (still worth it in 2026)

Extras that **still have no native equivalent** and deliver real value:

- **`cookie_manager`**, **`local_storage_manager`** — browser persistence.
- **`eval_javascript`** — small browser scripts without creating a custom component.
- **`bottom_container`** — fixed bottom bar (useful for generic chat input).
- **`floating_button`**, **`radial_menu`** — floating actions / circular menus.
- **`dataframe_explorer`** — automatic filter UI for DataFrames.
- **`sigma_graph`**, **`three_viewer`**, **`chartjs_chart`**, **`great_tables`**, **`json_editor`**, **`image_crop`**, **`image_compare_slider`** — wrappers for JS libraries with no native alternative.
- **`concurrency_limiter`**, **`exception_handler`** — heavyweight dev utilities.

### Group C — "Polish / effects" (use freely)

- **`let_it_rain`**, **`buy_me_a_coffee`**, **`badges`**, **`avatar`**, **`star_rating`**, **`mention`**, **`keyboard_text`** — micro visual components that add personality to the app without weight.

### Group D — "Niche cases"

- **`jupyterlite`**, **`sandbox`**, **`function_explorer`**, **`diagrams`**, **`echo_expander`**, **`word_importances`** — useful in very specific contexts (education, advanced debugging, ML interpretability).

---

## 5. Complete catalog of 56 extras

> Convention: 🟢 active · 🟡 works, but there's a native alternative · 🔴 officially deprecated.

### 5.1 Layout and containers

| Status | Module | Function | What it does |
|---|---|---|---|
| 🔴 | `add_vertical_space` | `add_vertical_space(n)` | Inserts N blank lines. Use `st.write("")` or CSS. |
| 🟢 | `bottom_container` | `bottom()` | Container that **stays fixed at the bottom** of the screen (useful for custom chat bars). |
| 🟢 | `grid` | `grid(*spec)` | Defines a declarative grid layout: `grid([2, 1, 3], 1)` creates two rows with specific proportions. |
| 🟢 | `resizable_columns` | `resizable_columns([1,1,1])` | Drop-in for `st.columns` with **draggable dividers**. |
| 🔴 | `row` | `row(spec)` | Horizontal container. Use `st.columns` directly. |
| 🟢 | `scroll_to_element` | `scroll_to_element(key)` | Programmatic scroll to any element that has a `key`. |
| 🟢 | `skeleton` | `skeleton(height=...)` | Animated gray placeholder while data loads (Facebook/LinkedIn style). |
| 🔴 | `stylable_container` | `stylable_container(key, css_styles)` | Arbitrary CSS in a container. Use `st.container(key=...)` + CSS in `[theme]`. |

### 5.2 Inputs and interactive widgets

| Status | Module | Function | What it does |
|---|---|---|---|
| 🟢 | `card_selector` | `card_selector(options)` | Picker as large cards with icon, title, and description. A "rich" version of `st.segmented_control`. |
| 🟢 | `floating_button` | `floating_button(label)` | Floating button fixed in the bottom-right corner ("new chat" style). |
| 🟢 | `image_crop` | `image_crop(image)` | Interactive image cropping with draggable borders. |
| 🟢 | `image_selector` | `image_selector(image)` + `show_selection()` | Allows the user to select a region of the image with **lasso or bounding box**. |
| 🟢 | `json_editor` | `json_editor(data)` | JSON editor with syntax highlight and validation (React component). |
| 🟢 | `keyboard_text` | `key("Ctrl+S")` | Renders text with keyboard key appearance (`<kbd>`). |
| 🟢 | `keyboard_url` | `keyboard_to_url(key, url)` | Global shortcut: pressing a key opens a URL in a new tab. |
| 🟢 | `mandatory_date_range` | `date_range_picker(...)` | `st.date_input` that **forces** two values (start + end). |
| 🟢 | `mention` | `mention(label, icon, url)` | Notion-style "@mention" link, with icon next to it. |
| 🟢 | `pagination` | `pagination(items, items_per_page)` | Classic numbered pagination component with ‹ › and truncation (`1 ... 4 5 6 ... 99`). |
| 🟢 | `radial_menu` | `radial_menu(options)` | Radial menu — options in a circle around a central button. |
| 🟢 | `specialized_inputs` | `specialized_text_input(...)` | Inputs with built-in validation (email, url, etc.). |
| 🟢 | `star_rating` | `star_rating(value)` | Read-only stars to show ratings. |
| 🟢 | `stateful_button` | `button(label)` | Button that **keeps state** (toggle), instead of just firing once. |
| 🟢 | `stateful_chat` | `add_message(role, content)` | Chat container that **persists history** automatically in `session_state`. |
| 🟢 | `steps` | `steps(items)` | Multi-step flow progress indicator (vertical/horizontal, numbered/dots). |
| 🟢 | `stodo` | `to_do(items, key)` | Task list / checklist in Streamlit. |
| 🟢 | `stoggle` | `stoggle(summary, content)` | Notion-style toggle dropdown (reveals hidden content). |
| 🔴 | `tags` | `tagger_component(content, tags)` | GitHub-issue-style colored tags. Use `st.badge` or `st.pills`. |

### 5.3 Visuals and branding

| Status | Module | Function | What it does |
|---|---|---|---|
| 🔴 | `app_logo` | `add_logo(url)` | Logo at the top of the sidebar. Use [`st.logo`](https://docs.streamlit.io/develop/api-reference/media/st.logo). |
| 🟢 | `avatar` | `avatar(image, label, caption)` | Circular avatar with label and optional caption. |
| 🟢 | `badges` | `badge("pypi", name="streamlit")` | Ready-made badges (PyPI, GitHub, Twitter, Buy Me a Coffee, Streamlit Cloud). |
| 🟢 | `buy_me_a_coffee` | `button(username, ...)` | Floating "Buy Me a Coffee" button for public apps. |
| 🔴 | `colored_header` | `colored_header(label, ...)` | Colored header. Use [`st.header(divider="rainbow")`](https://docs.streamlit.io/develop/api-reference/text/st.header). |
| 🟢 | `customize_running` | `center_running()` | Customizes the "Running..." widget (e.g. centers it). |
| 🟢 | `let_it_rain` | `rain(emoji, ...)` | Makes emojis "rain" on screen — extension of `st.balloons`/`st.snow`. |
| 🟢 | `metric_cards` | `style_metric_cards(...)` | Styles `st.metric` as a custom card. **Today you can use `st.metric(border=True)` directly.** |

### 5.4 Charts and data visualization

| Status | Module | Function | What it does |
|---|---|---|---|
| 🟢 | `chart_annotations` | `get_annotations_chart(...)` | Adds annotations at specific timestamps of Altair time series. |
| 🟢 | `chart_container` | (no export — use via `with`) | Wraps a chart in tabs (view / data / export code). |
| 🟢 | `chartjs_chart` | `chartjs_chart(config)` | Renders Chart.js charts with Streamlit theme integration. |
| 🟢 | `dataframe_explorer` | `dataframe_explorer(df)` | Generates **automatic filter UI** for any DataFrame (categorical, numeric, date). |
| 🟢 | `diagrams` | `st_diagram(...)` | Renders Mermaid/Graphviz diagrams (wrapper for [`mingrammer/diagrams`](https://github.com/mingrammer/diagrams)). |
| 🟢 | `great_tables` | `great_tables(gt)` | Renders tables from the [Great Tables](https://posit-dev.github.io/great-tables/) library (Posit). |
| 🟢 | `sigma_graph` | `sigma_graph(graph)` | **WebGL interactive graph** visualization (sigma.js). Accepts `networkx.Graph` or dict. |
| 🟢 | `three_viewer` | `three_viewer(file)` | **3D viewer** with orbit controls. Supports GLTF, GLB, OBJ, STL, PLY, FBX. |
| 🟢 | `word_importances` | `format_word_importances(words, scores)` | Highlights words according to an importance score (ML interpretability, inspired by [Captum](https://captum.ai/)). |

### 5.5 Browser integration

| Status | Module | Function | What it does |
|---|---|---|---|
| 🟢 | `cookie_manager` | `cookie_manager()` | Reads/writes **browser cookies** with a dict-like interface. |
| 🟢 | `eval_javascript` | `eval_javascript(code)` | Executes arbitrary JS in the browser and returns the result to Python. Useful for reading `navigator.userAgent`, geolocation, etc. |
| 🟢 | `local_storage_manager` | `local_storage_manager()` | Same as `cookie_manager`, but for `localStorage` (with automatic JSON serialization). |
| 🟢 | `redirect` | `redirect(url)` | Programmatically redirects the user to an external or internal URL. |

### 5.6 Development and debug utilities

| Status | Module | Function | What it does |
|---|---|---|---|
| 🟢 | `capture` | (internal utility) | Captures `stdout`/`stderr` of code running inside the app. |
| 🟢 | `concurrency_limiter` | `@concurrency_limiter(max_concurrency=N)` | Decorator that **limits concurrent executions** of a function (internal rate limiting). |
| 🟢 | `echo_expander` | (use via `with`) | Like `st.echo`, but with the code inside a collapsed `expander`. |
| 🟢 | `exception_handler` | `set_global_exception_handler(fn)` | Overrides the global Streamlit exception handler (show custom message in prod). |
| 🟢 | `function_explorer` | `function_explorer(fn)` | **Automatically** generates a UI for any Python function (inspects signature). Marked as "very alpha". |
| 🟢 | `jupyterlite` | `jupyterlite()` | Embeds a complete **JupyterLite** (Python in browser via Pyodide) inside Streamlit. |
| 🟢 | `sandbox` | `sandbox(code)` | Executes **untrusted** Streamlit code in a sandbox (via [stlite](https://github.com/whitphx/stlite)). |

---

## 6. Deprecated extras (and their native replacements)

This table is the **most important** if you're starting today. These 6 extras are marked with `__deprecated__ = True` in the source code:

| Extra                 | Native replacement                                                                                                  | When the core gained it |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| `add_vertical_space`  | `st.write("")` in a loop, or `[theme]` with more `padding`                                                          | always existed         |
| `app_logo`            | [`st.logo(image)`](https://docs.streamlit.io/develop/api-reference/media/st.logo)                                  | Streamlit 1.35         |
| `colored_header`      | [`st.header(divider="rainbow")`](https://docs.streamlit.io/develop/api-reference/text/st.header) (accepts `red`, `blue`, `green`, `orange`, `violet`, `gray`, `rainbow`) | Streamlit 1.27         |
| `row`                 | [`st.columns(gap=...)`](https://docs.streamlit.io/develop/api-reference/layout/st.columns) or [`st.container(horizontal=True)`](https://docs.streamlit.io/develop/api-reference/layout/st.container) | Streamlit 1.30+        |
| `stylable_container`  | [`st.container(key="my-card")`](https://docs.streamlit.io/develop/api-reference/layout/st.container) — the `key` is exposed as a CSS class, so a `st.markdown("<style>...")` targets it | Streamlit 1.40+        |
| `tags`                | [`st.badge`](https://docs.streamlit.io/develop/api-reference/text/st.badge) and [`st.pills`](https://docs.streamlit.io/develop/api-reference/widgets/st.pills)                                                                                                          | Streamlit 1.43+        |

> 💡 **Recommended pattern:** if a file in your project imports any of these 6 extras, swap it for the native equivalent when you touch it.

---

## 7. How to contribute

The barrier to adding an extra is deliberately low. The flow is:

1. **Fork** the repository <https://github.com/arnaudmiribel/streamlit-extras>.
2. Create folder `src/streamlit_extras/your_extra/` with:
   - `__init__.py` defining the public function decorated with `@extra` and the metadata (`__title__`, `__desc__`, `__icon__`, `__author__`, `__examples__`).
   - Optionally `frontend/` if it's a React component (Custom Component v2).
3. Run `uv sync` locally and test with the gallery.
4. Open a Pull Request with the "new extra" flag.

Official guide: <https://arnaudmiribel.github.io/streamlit-extras/contributing/>

Minimal structure of an extra (based on `stoggle`):

```python
from datetime import date
import streamlit as st
from .. import extra

@extra
def my_component(arg: str) -> None:
    """Docstring that appears in the gallery."""
    st.write(f"Hello {arg}")

def example():
    my_component("world")

__title__ = "My Component"
__desc__ = "Short description for the gallery."
__icon__ = "🎈"
__examples__ = [example]
__author__ = "Your Name"
__created_at__ = date(2026, 4, 30)
```

---

## 8. Useful links

### Official (`streamlit-extras`)
- 🌐 Documentation: <https://arnaudmiribel.github.io/streamlit-extras/>
- 📦 Repository: <https://github.com/arnaudmiribel/streamlit-extras>
- 🐍 PyPI: <https://pypi.org/project/streamlit-extras/>
- 🤝 Contribution guide: <https://arnaudmiribel.github.io/streamlit-extras/contributing/>

### Official Streamlit (references cited in this guide)
- API Reference: <https://docs.streamlit.io/develop/api-reference>
- Theme/config: <https://docs.streamlit.io/develop/concepts/configuration/theming-customize-colors-and-borders>
- `st.logo`: <https://docs.streamlit.io/develop/api-reference/media/st.logo>
- `st.header` (with `divider`): <https://docs.streamlit.io/develop/api-reference/text/st.header>
- `st.container`: <https://docs.streamlit.io/develop/api-reference/layout/st.container>
- `st.columns`: <https://docs.streamlit.io/develop/api-reference/layout/st.columns>
- `st.badge`: <https://docs.streamlit.io/develop/api-reference/text/st.badge>
- `st.pills`: <https://docs.streamlit.io/develop/api-reference/widgets/st.pills>
- Custom Components: <https://docs.streamlit.io/develop/concepts/custom-components>

### Specialized packages (outside `streamlit-extras`)
When you need something more robust than an extra, consider:
- **`streamlit-aggrid`** — advanced tables (filter, edit, pagination): <https://github.com/PablocFonseca/streamlit-aggrid>
- **`streamlit-folium`** — Leaflet/Folium maps: <https://github.com/randyzwitch/streamlit-folium>
- **`streamlit-elements`** — complete Material UI in Streamlit: <https://github.com/okld/streamlit-elements>
- **`streamlit-option-menu`** — rich navigation menus: <https://github.com/victoryhb/streamlit-option-menu>
- **`streamlit-authenticator`** — complete auth: <https://github.com/mkhorasani/Streamlit-Authenticator>
- **`stlite`** — Streamlit running 100% in the browser via Pyodide: <https://github.com/whitphx/stlite>

---

> **Final note.** Since `streamlit-extras` is volatile, whenever you're adopting a critical extra, **inspect the code** in `src/streamlit_extras/<extra>/__init__.py` in the repository to verify it hasn't been marked as `__deprecated__` in the main branch before the next release.

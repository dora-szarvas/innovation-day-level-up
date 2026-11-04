# Nebula prototype

This project uses the Pearson Nebula design system (alpha.15). Before generating or
editing any UI, read `.claude/rules/00-nebula-core.mdc` first (the rule files come from the Nebula kit and are kept
local, not in git) — it's the always-on core
(hard rules, canonical shell, highest-risk traps). Open the matching topic file in
`.claude/rules/` when relevant (`01-nebula-components`, `03-color-and-status`,
`04-charts`, `07-grid-and-figma`, etc.), and the `organism-*.mdc` files for exemplars.
Icons are tree-shaken: import each glyph from `@pearson-ux/nebula-design-system/icons`
and pass it as `<Icon svg={glyph} />` — never `<Icon name="…" />`.
Routing is `HashRouter` and asset paths are never absolute — both publish targets serve
this app from a subpath. See `.claude/rules/12-nebula-hosting-and-routing.mdc` before
touching routing, `vite.config.js`, or any `src=`/`url()` path.
For Figma work, follow the Figma MCP rules.

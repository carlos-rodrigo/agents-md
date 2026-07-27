# SVG Diagram Tool Research

Research goal: choose a build-time tool for large, high-quality diagrams embedded as self-contained SVG in durable HTML documents.

Research checked official documentation on 25 July 2026. Evaluate again before adopting a new dependency because output behavior and licensing can change.

## Decision criteria

A good report pipeline should provide:

- deterministic build-time output;
- high-quality SVG with a usable `viewBox`;
- searchable text or a reliable text equivalent;
- hierarchy, groups/lanes, labels, and explicit edge routing;
- no required browser/runtime dependency after export;
- accessibility metadata that exists or can be added in post-processing;
- stable regeneration source;
- a license compatible with the repository and intended distribution.

No renderer replaces semantic editing. Large diagrams should still answer one question and may need to be split.

## Findings

### Graphviz

**Best fit:** static topology, dependency, ownership, and directed system-flow diagrams that benefit from automatic layout.

- `dot -Tsvg input.dot` produces SVG at build time.
- DOT supports subgraphs/clusters, ranks, ports, edge labels, multiple layout engines, and spline/orthogonal routing controls.
- Pin the Graphviz version and fonts for reproducible geometry.
- Exported SVG needs report-specific post-processing for accessible title/description, tokens, embedded/local fonts, and review IDs.
- Graphviz is licensed under the Eclipse Public License 1.0.

**Assessment:** best first open-source auto-layout prototype for this repository. It offers the highest value with the smallest new pipeline.

Official sources:

- SVG output: https://graphviz.org/docs/outputs/svg/
- command line/layout selection: https://graphviz.org/doc/info/command.html
- graph/node/edge attributes: https://graphviz.org/doc/info/attrs.html
- license: https://graphviz.org/license/

### D2

**Best fit:** concise text-authored technical diagrams where good defaults and multiple layout engines matter more than low-level layout control.

- SVG is the default CLI export.
- D2 supports Dagre by default and can use ELK; TALA is another option with separate licensing/availability considerations.
- Containers and styles make it approachable for architecture documents.
- Output quality and supported features vary by layout engine; pin both tool and engine.
- D2 uses the Mozilla Public License 2.0.

**Assessment:** strongest authoring experience among the auto-layout options, but introduces another language/tool layer. Prefer it when maintainable diagram source matters more than direct Graphviz control.

Official sources:

- layouts: https://d2lang.com/tour/layouts/
- exports: https://d2lang.com/tour/exports/
- CLI: https://d2lang.com/tour/cli/
- license: https://github.com/terrastruct/d2/blob/master/LICENSE.txt

### ELK / elkjs

**Best fit:** complex hierarchical diagrams that need ports, nested nodes, orthogonal routing, and strong constraint handling.

- ELK is a layout engine, not an SVG renderer.
- `elkjs` makes ELK's algorithms available in JavaScript/Node workflows.
- The layered algorithm is especially useful for directed graphs and port-aware orthogonal layouts.
- A production integration must build and maintain node measurement, SVG rendering, labels, accessibility, tokens, review IDs, and deterministic post-processing.
- `elkjs` uses Eclipse Public License 2.0.

**Assessment:** technically strongest layout substrate, but the highest engineering cost. Adopt only after a real diagram proves Graphviz cannot satisfy required ports/routing.

Official sources:

- algorithms: https://eclipse.dev/elk/documentation/tooldevelopers/algorithms.html
- options reference: https://eclipse.dev/elk/reference.html
- elkjs usage: https://github.com/kieler/elkjs/blob/master/README.md
- license: https://github.com/kieler/elkjs/blob/master/LICENSE.md

### Excalidraw

**Best fit:** authored sketch-like explanations, decision stories, and small causal paths where editorial placement and reading order matter.

- The package exports scenes to SVG at build time.
- It does not auto-layout large graphs; node placement and routes are authored.
- The local renderer already adds embedded Virgil, searchable text, accessible naming, provenance, review IDs, labelled edge groups, and reveal groups.
- Excalidraw is MIT licensed.

**Assessment:** keep as the authored storytelling renderer. Do not force it onto dense auto-layout problems.

Official sources:

- export API: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/export/
- repository/license: https://github.com/excalidraw/excalidraw

Local implementation:

```text
scripts/render-excalidraw-diagram.mjs
scripts/excalidraw-diagram-spec.mjs
scripts/excalidraw-export-browser.js
```

### Mermaid

**Best fit:** familiar small flowchart, sequence, state, and class diagrams where source brevity is more important than precise layout.

- Mermaid CLI (`mmdc`) can export static SVG; a runtime is not needed after embedding.
- Mermaid supports accessible title and description fields and SVG ARIA metadata.
- Dense layouts, subgraphs, edge labels, and HTML/`foreignObject` labels require careful inspection. Prefer SVG text where portability matters.
- Mermaid is MIT licensed.

**Assessment:** convenient but less controllable for large polished architecture figures. It is a format-specific option, not the default high-quality layout engine.

Official sources:

- CLI package: https://github.com/mermaid-js/mermaid-cli
- accessibility: https://mermaid.js.org/config/accessibility.html
- layouts: https://mermaid.js.org/config/layouts.html
- license: https://github.com/mermaid-js/mermaid/blob/develop/LICENSE

### PlantUML

**Best fit:** UML and sequence/state forms backed by a mature offline Java CLI.

- `-tsvg` generates SVG from the command line.
- PlantUML supports many established notation families and can use Graphviz for several layouts.
- Generated images belong to the source author and are not covered by the PlantUML GPL, according to the official license page.
- Styling and very large free-form architecture composition are less flexible than a custom SVG pipeline.

**Assessment:** choose when UML semantics are the point. Do not use it as the general editorial diagram renderer.

Official sources:

- SVG: https://plantuml.com/svg
- command line: https://plantuml.com/command-line
- license and generated-output terms: https://plantuml.com/license

### Cytoscape.js

**Best fit:** interactive graph exploration, filtering, and analysis.

- Cytoscape.js has a large layout ecosystem, including Dagre, ELK, Cola, and force-directed options.
- It is optimized around an interactive graph canvas. Static SVG export is not the core self-contained report path and often needs extensions or custom rendering.
- The core and first-party extensions are MIT licensed.

**Assessment:** avoid for static documentation unless exploration itself is an approved requirement and a complete static summary is preserved.

Official sources:

- layouts and factsheet: https://js.cytoscape.org/#layouts
- repository/license: https://github.com/cytoscape/cytoscape.js

### GoJS

**Best fit:** an integrated commercial diagramming application with layouts, grouping, routing, interaction, and SVG export.

- GoJS supports SVG export and a broad diagram/layout API.
- It is commercial software and requires an appropriate license for production use.

**Assessment:** technically capable, but not a fit for this MIT/local skill repository without procurement and explicit approval.

Official sources:

- SVG export: https://gojs.net/latest/intro/makingSVG.html
- license/pricing: https://gojs.net/latest/license.html

## Recommended adoption sequence

1. **Keep Excalidraw** for intentionally authored teaching diagrams and small causal flows.
2. **Allow authored inline SVG** for bespoke editorial figures when the SVG remains maintainable and accessible.
3. **Prototype Graphviz → SVG normalizer** when a real large diagram needs automatic layout. The normalizer should add accessible naming, token colors, local fonts, review IDs, responsive framing, and deterministic cleanup.
4. **Evaluate D2** if maintainers prefer a concise authoring language and its Graphviz/ELK output meets the same normalization gate.
5. **Use ELK/elkjs** only when port-aware hierarchy or orthogonal routing proves necessary and warrants a maintained custom renderer.
6. Use Mermaid/PlantUML for notation-specific cases, Cytoscape for approved exploration, and GoJS only with commercial approval.

Adding Graphviz, D2, ELK, Mermaid, PlantUML, Cytoscape, or GoJS changes the build/dependency architecture. Get approval and add a renderer fixture, deterministic regeneration check, accessibility postprocessor test, narrow/print browser check, and license note before adoption.

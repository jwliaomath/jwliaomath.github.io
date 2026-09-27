---
layout: page
title: StructDiff Card
description: Auditable multi-chain structure comparison with interactive 3D difference maps and publication-ready exports.
img: assets/img/structdiff-card-preview.svg
importance: 2
category: research
---

StructDiff Card compares macromolecular structures locally. It uses US-align to map
chains and residues, then applies one global transform to the full assembly.
Difference-colored 3D views, contact changes, motion decomposition, and spatial
difference patches help locate disagreements. Unmatched chains and gaps remain
visible so they are not mistaken for measured displacements.

The public gallery is a precomputed example and does not accept uploads. Private
structures can be compared with the locally run application.

[Interactive example](https://jwliaomath.github.io/StructDiff-Card/) ·
[Source code](https://github.com/jwliaomath/StructDiff-Card) ·
[Method and interpretation](https://github.com/jwliaomath/StructDiff-Card/blob/main/docs/method.md)

{% include figure.liquid path="assets/img/structdiff-card-preview.svg" alt="StructDiff Card example publication card showing chain mapping, TM-score, RMSD, and unmatched chains" class="img-fluid d-block mx-auto" max-width="720px" sizes="(max-width: 720px) 100vw, 720px" zoomable=true %}

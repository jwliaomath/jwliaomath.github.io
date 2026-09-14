---
layout: page
title: CoCoFold
description: Fine-tuning AlphaFold with limited cryo-EM observations.
img: assets/img/pipeline.png
importance: 1
category: research
related_publications: true
---

CoCoFold adapts AlphaFold using limited cryo-EM particles to refine atomic
models when reconstructed maps are weak, anisotropic, or incomplete. It links
predicted structures to experimental particles through differentiable projection
and particle-level supervision, enabling target-specific correction while
preserving the AlphaFold structural prior {% cite liao2026finetuning %}.

Benchmarks show improved accuracy and robustness in scarce-particle and
missing-view regimes.

[Paper](https://www.nature.com/articles/s42004-026-01899-7) ·
[Code](https://github.com/jwliaomath/CoCoFold)

{% include figure.liquid path="assets/img/pipeline.png" alt="CoCoFold pipeline" class="img-fluid d-block mx-auto" max-width="600px" sizes="(max-width: 600px) 100vw, 600px" zoomable=true %}

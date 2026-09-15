---
layout: page
title: CoCoFold2
description: Scalable latent refinement of diffusion-based protein structure predictions from limited-particle cryo-EM data.
img: assets/img/cocofold2-flow.png
importance: 1
category: research
redirect: https://jwliaomath.github.io/CoCoFold2/
related_publications: true
---

CoCoFold2 connects a frozen Protenix-v1 diffusion prior to cryo-EM particle
observations through target-specific latent refinement. The public software
supports single-GPU and component-parallel refinement, structured experiment
records, and CIF/PDB export.

[Project website and tutorials](https://jwliaomath.github.io/CoCoFold2/) ·
[Source code](https://github.com/jwliaomath/CoCoFold2)

{% include figure.liquid path="assets/img/cocofold2-flow.png" alt="CoCoFold2 pipeline: latent refinement of a frozen diffusion prior against cryo-EM observations" class="img-fluid d-block mx-auto" max-width="600px" sizes="(max-width: 600px) 100vw, 600px" zoomable=true %}

---
layout: page
title: CoCoFlex
description: Modeling continuous conformational variation from cryo-EM particle images.
permalink: /projects/cocoflex/
img: assets/img/publication_preview/cocoflex-workflow.png
importance: -1
category: research
---

CoCoFlex uses single-particle cryo-EM images to model continuous conformational
variation as atomic ensembles. Starting from a canonical structural
representation, it learns a latent variable for each particle and a shared
modulator that conditions a frozen Protenix-mini generator.

The preprint evaluates the method on simulated benchmarks, including CAHRA
Challenge 2. Reconstructed density maps support the inferred domain motions
in four experimental datasets.

[Preprint](https://doi.org/10.65215/LTSpreprints.2026.11.26.000403) ·
[Structures, maps, and source data](https://doi.org/10.5281/zenodo.24097400) ·
[CoCo platform](https://cocoproject.org.cn/) ·
[Code release updates](https://github.com/jwliaomath/cocoflex)

{% include figure.liquid path="assets/img/publication_preview/cocoflex-workflow.png" alt="CoCoFlex workflow linking cryo-EM particle images to a frozen structure generator and an atomic ensemble" class="img-fluid d-block mx-auto" max-width="750px" sizes="(max-width: 750px) 100vw, 750px" zoomable=true %}

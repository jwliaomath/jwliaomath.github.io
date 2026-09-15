---
layout: page
permalink: /publications/
title: publications
description: Preprints and peer-reviewed publications.
nav: true
nav_order: 2
---

<!-- _pages/publications.md -->

<!-- Bibsearch Feature -->

{% include bib_search.liquid %}

<div class="publications">

<h2 id="preprints">Preprints</h2>

{% bibliography --group_by none --query @unpublished %}

<h2 id="published">Publications</h2>

{% bibliography --group_by year --group_order descending --query @article %}

</div>

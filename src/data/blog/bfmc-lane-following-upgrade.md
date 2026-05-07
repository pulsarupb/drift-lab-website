---
title: "TechTrax improves BFMC lane-following reliability"
description: "A control and perception update that reduced unstable steering events during repeated city laps."
publishDate: 2026-03-28
team: techtrax
members:
  - nisipeanu-ionut
  - danilov-alexandru-cristian
  - bejenescu-babusanu-stefan
draft: false
---

This iteration focused on consistent lane keeping under mixed lighting and tighter turns.

Key changes included retuning the control loop, smoothing lateral error input, and adding stricter camera frame validation before steering updates.

In repeated simulation laps, we observed fewer sudden oscillations and cleaner recovery after temporary lane-loss cases.

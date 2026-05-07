---
title: "ERC autonomy stack reaches simulation milestone"
description: "How the PULSAR team validated a full mission loop in simulation and what comes next for field testing."
publishDate: 2026-04-12
team: pulsar
members:
  - iatagan-andrei
  - bachynskyi-roi
  - geala-stefan-octavian
  - lazar-dragos-george
draft: false
---

This sprint focused on proving that our rover can complete an end-to-end mission loop in simulation: receive a goal, plan a path, execute controls, and return diagnostics.

The main outcomes were:

- A stabilized localization pipeline with reproducible results.
- Better planning behavior in narrow passages.
- A cleaner telemetry stream for debugging and replay.

Next, we are moving this setup to controlled outdoor tests and collecting logs to compare simulation versus real-world behavior.

---
title: "PULSAR ships a new telemetry pipeline"
description: "A structured logging flow for faster debugging across autonomy, electronics, and mission operations."
publishDate: 2026-05-01
team: pulsar
members:
  - rusu-cosmin-constantin
  - geala-stefan-octavian
  - bachynskyi-roi
draft: false
---

We introduced a unified telemetry schema so data collected during field runs is easier to inspect and compare across subsystems.

The pipeline now standardizes timestamps, event severity, and subsystem tags while keeping the export format lightweight for quick sharing.

This gives the team a much shorter path from "issue observed" to "issue reproduced and fixed".

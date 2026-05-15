# Research: PITFALLS

Date: [2026-05-14]

Domain-specific pitfalls and prevention

- Pitfall: Overcomplicating prediction models early
  - Warning: Building complex ML/MLops before sufficient labeled data
  - Prevention: Start with deterministic heuristics and configurable thresholds; collect labeled events during usage
  - Phase to address: After v1 usage data collection (Phase 3)

- Pitfall: Poor UX for multi-child management
  - Warning: Overloaded screens that mix children' timelines
  - Prevention: Clear child selector, separate timelines per child, fast switching
  - Phase to address: Design and test in Phase 1 (post-auth)

- Pitfall: Sensitive data leakage
  - Warning: Storing PII or medical notes in plain local files or logs
  - Prevention: Minimize data stored locally, encrypt sensitive fields if necessary, avoid logging tokens
  - Phase to address: Architecture and privacy review (Phase 1/2)

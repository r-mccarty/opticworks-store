# RFD: Anvil Review 7aa6cdf

**Commit**: 7aa6cdf729e1026d9205dc13d4bc301a62fbe2e1
**Date**: 2026-01-21
**Author**: Ryan
**Reviewer**: codex (automated)

## Summary

This commit adds a hammer review RFD document for 64a9700. There are no functional or workflow changes; the only change is new documentation in `docs/rfd/`.

## Findings

### 1. [LOW] RFD understates possible parallelism in the workflow

**Evidence**: `docs/rfd/RFD-20260121-64a9700-hammer-review.md:60`

The hammer review states that concurrency "queues runs rather than running in parallel." The workflow concurrency group is keyed by `${{ github.ref }}`, which means runs on different refs can execute in parallel even with `cancel-in-progress: false`. That does not change the outcome of the review, but it is a misleading mitigation note for the race condition scenario.

**Impact**: Low. The RFD may lull readers into assuming there is no possible parallel execution, which could hide the actual (albeit small) risk in shared sprite workspaces.

## Recommended Actions

1. Update the hammer review RFD to clarify that concurrency is per-ref and that different refs can still run in parallel.


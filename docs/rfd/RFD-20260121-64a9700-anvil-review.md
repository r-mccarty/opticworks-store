# RFD: Anvil Review 64a9700

**Commit**: 64a970001d4194f7b23a2da425cf45f6e5ebaa35
**Date**: 2026-01-21
**Author**: r-mccarty
**Reviewer**: codex (automated)

## Summary

This commit adds a safety cleanup step in the anvil review workflow to remove a lingering `.git/index.lock` before fetching and checking out the target commit inside the sprite VM.

### Change Details

**File**: `.github/workflows/anvil-review.yml`
**Line**: 95

```diff
+          if [ -f ".git/index.lock" ]; then
+            rm -f .git/index.lock
+          fi
```

The workflow now clears any stale Git index lock in the cloned workspace before running `git fetch` and `git checkout`.

## Findings

### 1. [LOW] Potentially clears a live git lock without verification

**Risk**: The workflow removes `.git/index.lock` unconditionally if present. If another git process is legitimately running in the same workspace (unlikely but possible if steps overlap or prior commands are still running), this could lead to git index corruption.

**Evidence**: `.github/workflows/anvil-review.yml:95`

## Recommended Actions

1. **Optional safety guard**: If this workflow can ever run concurrent git operations in the same workspace, consider waiting on the lock with a short timeout (or checking for active git processes) before removing it.

2. **Monitoring**: If intermittent git lock issues persist, capture the offending process ID when the lock exists to confirm it is stale before deletion.

## Conclusion

The change addresses a practical failure mode caused by stale git locks in the sprite VM. The only concern is the lack of verification that the lock is stale, which is likely acceptable given the single-purpose workflow but could be hardened if concurrency is introduced.

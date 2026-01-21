# RFD: Hammer Review 64a9700

**Commit**: 64a970001d4194f7b23a2da425cf45f6e5ebaa35
**Date**: 2026-01-21
**Author**: r-mccarty
**Reviewer**: hammer (automated)

## Summary

This commit adds a cleanup step to remove stale `.git/index.lock` files before git operations in the anvil-review workflow. The change prevents git command failures that can occur when a previous workflow run was interrupted or cancelled, leaving behind a lock file.

### Change Details

**File**: `.github/workflows/anvil-review.yml`
**Lines**: 95-97

```diff
           cd "/home/sprite/workspace/${REPO_NAME}"
+          if [ -f ".git/index.lock" ]; then
+            rm -f .git/index.lock
+          fi
           git fetch origin
```

The change checks for the existence of `.git/index.lock` and removes it if present before proceeding with `git fetch origin`.

## Findings

### 1. [LOW] Conditional Check is Redundant - Severity: Low (Code Quality)

**Location**: `.github/workflows/anvil-review.yml:95-97`

**Issue**: The conditional `if [ -f ... ]` check before `rm -f` is unnecessary. The `-f` flag on `rm` already suppresses errors if the file doesn't exist:

```bash
# Current implementation (redundant check)
if [ -f ".git/index.lock" ]; then
  rm -f .git/index.lock
fi

# Simpler equivalent
rm -f .git/index.lock
```

**Impact**: Minor code bloat. No functional impact since both approaches work correctly.

**Recommendation**: Consider simplifying to just `rm -f .git/index.lock` in a future cleanup commit.

### 2. [INFO] Race Condition Window - Severity: Informational

**Context**: The workflow uses `concurrency.cancel-in-progress: false`, meaning multiple runs can queue. However, the sprite VM workspace is shared across runs.

If two workflow runs execute simultaneously:
1. Run A removes the lock file
2. Run A starts `git fetch`
3. Run B removes the lock file (while Run A's git operation has it locked)
4. Run A's git operation may fail

**Mitigating factors**:
- The `concurrency` setting queues runs rather than running in parallel
- The lock cleanup happens early in the script before long operations
- Git recreates lock files atomically

**Impact**: Very low. The concurrency setting should prevent parallel execution. This is informational only.

### 3. [NO ISSUES] Correctness Assessment

The fix is **correct** for its intended purpose:

1. **Problem addressed**: Stale lock files from interrupted/cancelled runs can persist in the sprite VM workspace, causing subsequent `git fetch` or `git checkout` commands to fail with "Another git process seems to be running".

2. **Solution validity**: Removing the lock file before git operations is the standard approach for handling stale locks. The lock file (`index.lock`) is only dangerous to remove if a git process is actually running, which is unlikely given the sequential nature of the workflow.

3. **Placement**: The cleanup is correctly positioned after `cd` into the repo but before any git operations that require the lock.

### 4. [NO ISSUES] Security Considerations

No security concerns:
- The operation only affects the local `.git/index.lock` file
- No user input is involved in the file path
- The script runs with `set -euo pipefail` for safe error handling

## Recommended Actions

1. **No immediate action required** - The fix is correct and addresses a real operational issue.

2. **Optional cleanup**: Simplify the conditional to just `rm -f .git/index.lock` since the `-f` flag handles non-existent files.

3. **Monitoring**: Observe subsequent workflow runs to confirm the stale lock issue is resolved.

## Conclusion

This is a correct defensive fix that prevents git operations from failing due to stale lock files left behind by interrupted workflow runs. The implementation is slightly verbose but functionally correct. No regressions or risks identified.

# RFD: Hammer Review b78e7ce

**Commit:** b78e7ceb0a5cb1ef27eedce1283b9772ba2726b0
**Date:** 2026-01-21
**Author:** Code Review Agent

## Summary

This commit modifies `.github/workflows/hammer-review.yml` to align indentation of heredocs (both Python and shell) within the workflow file. The change converts the heredoc content from being flush-left to using consistent indentation matching the surrounding YAML structure.

The commit message states "fix: align hammer review heredocs" which suggests this is a formatting/style fix intended to improve readability.

## Findings

### 1. Critical: Heredoc Indentation Breaks Execution (Severity: High)

**Location:** `.github/workflows/hammer-review.yml:77-109` (Python heredoc) and lines 116-134 (shell heredoc)

**Issue:** The change adds leading whitespace to heredoc content, but heredocs preserve whitespace literally. This means:

1. **Python heredoc (lines 77-109):** The Python code now has ~10 spaces of leading indentation on each line. When passed to `python -`, Python will receive code like:
   ```python
             import base64
             import os
   ```
   This will cause an `IndentationError` because the first line has unexpected indentation.

2. **Shell heredoc (lines 116-134):** Similarly, the shell script now has leading spaces on each line, which will be passed literally to the remote shell. While shell scripts are more forgiving of leading whitespace, the indentation change means:
   - Commands like `set -euo pipefail` now have 10 spaces before them
   - The variable assignments and commands will still execute, but the script content is now inconsistent with typical shell formatting

**Evidence from diff:**
```diff
-          PROMPT_B64="$(python - <<'PY'
-import base64
-import os
+          PROMPT_B64="$(python - <<'PY'
+          import base64
+          import os
```

The heredoc delimiter `<<'PY'` does not strip leading whitespace. Only `<<-` (with a hyphen) strips leading **tabs** (not spaces).

**Impact:** The workflow will fail immediately when the Python heredoc is executed, causing all hammer reviews to fail.

### 2. Medium: No Automated Testing for Workflow Changes (Severity: Medium)

**Issue:** There are no tests that validate the workflow YAML syntax or execution logic before merging. This type of breaking change could have been caught with:
- A YAML linting step
- A dry-run or syntax validation for embedded scripts
- Manual testing of the workflow before merging

### 3. Low: Inconsistent Heredoc Style (Severity: Low)

**Issue:** If the intent was to improve readability while maintaining functionality, the heredoc approach should use `<<-` with tabs (which strips leading tabs) or extract the scripts to separate files. The current approach attempts visual alignment but breaks functionality.

## Recommended Actions

1. **Immediate (P0):** Revert this commit or fix the heredocs by:
   - Reverting to flush-left content within heredocs, OR
   - Using `<<-'PY'` and `<<-EOF` with **tabs** (not spaces) for indentation, OR
   - Extracting the Python and shell scripts to separate files and referencing them

2. **Short-term (P1):** Add workflow syntax validation:
   - Use `actionlint` or similar tool in CI to catch YAML/workflow issues
   - Consider adding a shellcheck step for embedded shell scripts

3. **Medium-term (P2):** Consider refactoring the workflow to:
   - Move the Python prompt generator to a separate `.py` file
   - Move the remote script to a separate `.sh` file
   - This improves maintainability and makes testing easier

## Test Recommendations

- Manually trigger the workflow via `workflow_dispatch` to verify it executes correctly
- Add a CI step that runs `python -c` or `bash -n` on extracted script content to validate syntax

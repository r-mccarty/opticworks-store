# RFD: Hammer Review dbd4d82

**Commit**: dbd4d825a704fc6bb3b2055c5a648d8ece02d19e
**Date**: 2026-01-21
**Author**: r-mccarty
**Reviewer**: hammer (automated)

## Summary

This commit fixes a shell quoting issue in the anvil-review workflow where the `$PROMPT` variable was being expanded prematurely during heredoc construction rather than at runtime inside the sprite VM.

### Change Details

**File**: `.github/workflows/anvil-review.yml`
**Line**: 104

```diff
-          printf '%s' "$PROMPT" | codex exec --dangerously-bypass-approvals-and-sandbox -
+          printf '%s' "\$PROMPT" | codex exec --dangerously-bypass-approvals-and-sandbox -
```

The change escapes the `$PROMPT` variable reference so it is not expanded during the local heredoc construction on the GitHub Actions runner, but instead expands at runtime inside the remote sprite environment where `PROMPT` is actually defined (line 103).

## Findings

### 1. [CORRECT FIX] Shell Variable Escaping - Severity: N/A (Bug Fix)

**Assessment**: This is a correct fix.

**Before the fix**: The `$PROMPT` variable on line 104 was being expanded during heredoc construction on the GitHub Actions runner. At that point, `PROMPT` is not defined locally - it's only defined inside the remote script on line 103:
```bash
PROMPT="\$(printf '%s' \"\$PROMPT_B64\" | base64 -d -i)"
```

Without the escape, `$PROMPT` would expand to an empty string before the script was sent to the sprite VM, causing codex to receive no input.

**After the fix**: With `\$PROMPT`, the variable reference is preserved in the heredoc text and only expands when the script runs inside the sprite VM, where `PROMPT` has been properly set from the base64-decoded prompt.

**Evidence**: The fix follows the same escaping pattern already used elsewhere in the script:
- Line 103: `PROMPT="\$(printf '%s' \"\$PROMPT_B64\" | base64 -d -i)"` - correctly escaped

### 2. [INFO] Workflow Structure - Severity: Low (Informational)

The workflow uses a complex heredoc pattern to construct a remote script that:
1. Clones/updates the repository in the sprite VM
2. Checks out the specific commit
3. Decodes the base64-encoded prompt
4. Pipes the prompt to codex for execution

This layered escaping (GitHub Actions -> local shell -> heredoc -> remote shell) is inherently fragile. The fix addresses one instance where escaping was missed.

### 3. [NO ISSUES] Security Considerations

The workflow appropriately uses:
- `set -euo pipefail` for strict error handling
- Base64 encoding for safe prompt transport
- Token-based authentication for API access

No security concerns introduced by this change.

## Recommended Actions

1. **No immediate action required** - The fix is correct and addresses the bug.

2. **Consider for future improvement**: The multi-layer shell escaping pattern is complex and error-prone. Future refactoring could consider:
   - Writing the prompt to a temporary file instead of piping
   - Using environment variable injection if sprite CLI supports it
   - Adding integration tests for the workflow logic

3. **Testing**: The workflow should be verified by observing a successful anvil review run on the next non-skip commit.

## Conclusion

This is a straightforward and correct bug fix. The change ensures the `$PROMPT` variable is expanded at the right time (inside the sprite VM) rather than prematurely (during heredoc construction). No regressions or risks identified.

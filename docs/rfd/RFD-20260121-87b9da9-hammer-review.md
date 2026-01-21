# RFD: Hammer Review 87b9da9

**Commit:** 87b9da91aebc10bf1fc037359f79fca24c2f10f5
**Date:** 2026-01-21
**Author:** Code Review Agent

## Summary

This commit adds a new GitHub Actions workflow `.github/workflows/anvil-review.yml` that runs an "Anvil Review" using OpenAI Codex instead of Claude. The workflow is structurally identical to the existing `hammer-review.yml` workflow, with the following key differences:

1. Uses a sprite named `anvil` instead of `hammer`
2. Adds `dev` branch to the trigger branches
3. Uses `codex exec --dangerously-bypass-approvals-and-sandbox` instead of `claude --print --dangerously-skip-permissions`
4. Uses `[skip-anvil]` skip token instead of `[skip-hammer]`
5. Declares but does not use `REVIEWER_NAME` and `SKIP_TOKEN` environment variables

## Findings

### 1. Critical: Remote Code Execution with --dangerously-bypass-approvals-and-sandbox (Severity: Critical)

**Location:** `.github/workflows/anvil-review.yml:99`

**Code:**
```bash
printf '%s' "$PROMPT" | codex exec --dangerously-bypass-approvals-and-sandbox -
```

**Issue:** The `--dangerously-bypass-approvals-and-sandbox` flag disables all safety checks in Codex, allowing the agent to execute arbitrary commands without user approval. This is particularly concerning because:

1. The prompt is fetched from an external repository (`r-mccarty/agent-harness`) using a GitHub token
2. If that external repository is compromised, malicious prompts could be injected
3. The agent runs in the sprite VM with access to the full codebase and git credentials

**Risk:** This is intentional design for CI automation, but the security model relies entirely on:
- The integrity of the `agent-harness` repository
- The base64 encoding/decoding not being tampered with
- The sprite VM isolation

**Assessment:** Acceptable risk for CI automation, but matches the risk profile of the existing `hammer-review.yml` workflow which uses similar flags for Claude.

### 2. High: Unused Environment Variables (Severity: Medium)

**Location:** `.github/workflows/anvil-review.yml:17-20`

**Code:**
```yaml
env:
  SPRITE_NAME: anvil
  REVIEWER_NAME: anvil
  SKIP_TOKEN: skip-anvil
  MAX_TURNS: 30
```

**Issue:** `REVIEWER_NAME` and `SKIP_TOKEN` are declared but never used in the workflow. The skip condition on line 12 hardcodes `'[skip-anvil]'` rather than using `${{ env.SKIP_TOKEN }}`:

```yaml
if: ${{ github.event_name == 'workflow_dispatch' || !contains(github.event.head_commit.message || '', '[skip-anvil]') }}
```

**Risk:** Low - Dead code that may confuse future maintainers.

**Recommendation:** Either use the variables consistently or remove them.

### 3. High: MAX_TURNS Not Passed to Codex (Severity: High)

**Location:** `.github/workflows/anvil-review.yml:19, 99`

**Issue:** The `MAX_TURNS` environment variable is declared (line 19) but never used. Unlike the `hammer-review.yml` workflow which passes `--max-turns ${MAX_TURNS}` to Claude, this workflow does not pass any turn limit to Codex:

**hammer-review.yml (line 101):**
```bash
claude --print --output-format json --dangerously-skip-permissions --max-turns ${MAX_TURNS} "\$PROMPT"
```

**anvil-review.yml (line 99):**
```bash
printf '%s' "$PROMPT" | codex exec --dangerously-bypass-approvals-and-sandbox -
```

**Risk:** The Codex agent may run indefinitely without a turn limit, potentially causing:
- Excessive API costs
- Workflow timeouts without graceful termination
- Resource exhaustion on the sprite VM

**Recommendation:** Pass `--max-turns` or equivalent flag to Codex if the CLI supports it.

### 4. Medium: Input Method Differs from Hammer Review (Severity: Medium)

**Location:** `.github/workflows/anvil-review.yml:99`

**Issue:** The workflow pipes the prompt via stdin:
```bash
printf '%s' "$PROMPT" | codex exec --dangerously-bypass-approvals-and-sandbox -
```

The `hammer-review.yml` passes the prompt as a command-line argument:
```bash
claude --print --output-format json --dangerously-skip-permissions --max-turns ${MAX_TURNS} "\$PROMPT"
```

**Risk:** If the prompt contains special characters, the stdin approach is more robust. However, this assumes `codex exec -` correctly reads from stdin, which should be verified.

**Assessment:** Likely correct, but inconsistent with the hammer workflow pattern.

### 5. Medium: Missing --output-format Flag (Severity: Medium)

**Location:** `.github/workflows/anvil-review.yml:99`

**Issue:** The hammer workflow uses `--output-format json` for structured output. The anvil workflow has no equivalent flag:

**hammer-review.yml:**
```bash
claude --print --output-format json --dangerously-skip-permissions --max-turns ${MAX_TURNS} "\$PROMPT"
```

**anvil-review.yml:**
```bash
printf '%s' "$PROMPT" | codex exec --dangerously-bypass-approvals-and-sandbox -
```

**Risk:** Without structured output, parsing the Codex response may be more difficult. The workflow may succeed but produce inconsistent output formats.

### 6. Low: dev Branch Added to Triggers (Severity: Low)

**Location:** `.github/workflows/anvil-review.yml:6`

**Code:**
```yaml
branches:
  - main
  - dev
  - "feature/**"
```

**Issue:** The `dev` branch is included in triggers but not in `hammer-review.yml`. This means:
- Anvil reviews run on `main`, `dev`, and `feature/**`
- Hammer reviews run only on `main` and `feature/**`

**Risk:** This may be intentional to test Anvil on more branches, but creates inconsistency between the two review workflows.

### 7. Low: Git Operations Identical to Hammer (Severity: Low - Informational)

**Location:** `.github/workflows/anvil-review.yml:84-97`

**Assessment:** The git clone/fetch/checkout logic is identical to `hammer-review.yml`, including:
- Conditional checkout to main if it exists
- Hard reset to target SHA
- Creating `docs/rfd` directory

This is good for consistency.

## Changes Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| File structure | Correct | Valid GitHub Actions workflow YAML |
| Sprite integration | Correct | Uses `sprite exec` with anvil sprite |
| Secret handling | Correct | Same pattern as hammer-review |
| Skip token | Partial | Hardcoded instead of using variable |
| Turn limiting | Missing | MAX_TURNS declared but not used |
| Output format | Missing | No --output-format equivalent |

## Recommended Actions

1. **P1 - Fix MAX_TURNS:** Pass the turn limit to Codex if the CLI supports it, or remove the unused variable if not applicable:
   ```bash
   printf '%s' "$PROMPT" | codex exec --dangerously-bypass-approvals-and-sandbox --max-turns ${MAX_TURNS} -
   ```

2. **P2 - Remove unused variables:** Either use `REVIEWER_NAME` and `SKIP_TOKEN` or remove them:
   ```yaml
   if: ${{ github.event_name == 'workflow_dispatch' || !contains(github.event.head_commit.message || '', format('[{0}]', env.SKIP_TOKEN)) }}
   ```
   Note: GitHub Actions `env` context is not available in `if` conditions, so the hardcoded approach may be intentional.

3. **P2 - Add output format flag:** If Codex CLI supports structured output, add the appropriate flag for consistency with hammer-review.

4. **P3 - Document branch differences:** Add a comment explaining why `dev` branch is included for anvil but not hammer, or align the branch triggers.

5. **P3 - Verify stdin input:** Confirm that `codex exec -` correctly interprets `-` as "read from stdin" by testing locally or checking Codex CLI documentation.

## Test Verification

The workflow file is syntactically valid. Full verification requires:
1. A push to `main`, `dev`, or `feature/**` branch without `[skip-anvil]`
2. Valid Infisical secrets for `SPRITES_API_TOKEN`
3. An active `anvil` sprite

## Comparison with hammer-review.yml

| Feature | hammer-review.yml | anvil-review.yml |
|---------|------------------|-----------------|
| Sprite | hammer | anvil |
| Agent | Claude | Codex |
| Skip token | [skip-hammer] | [skip-anvil] |
| Branches | main, feature/** | main, dev, feature/** |
| Max turns | Passed via --max-turns | Declared but not used |
| Output format | --output-format json | Not specified |
| Input method | CLI argument | Stdin pipe |

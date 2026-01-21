# RFD: Anvil Review dbd4d82

**Commit:** dbd4d825a704fc6bb3b2055c5a648d8ece02d19e
**Date:** 2026-01-21
**Author:** Code Review Agent

## Summary

This change fixes prompt handling in the anvil review workflow by escaping `PROMPT` in the remote script so the decoded prompt is passed to Codex at runtime instead of being expanded (and dropped) on the runner.

## Findings

None.

## Recommended actions

No changes required.

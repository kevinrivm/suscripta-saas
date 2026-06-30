#!/usr/bin/env python3
"""Block high-risk shell commands before Codex runs them."""

import json
import re
import sys


def extract_command(payload):
    candidates = [
        payload.get("command"),
        payload.get("cmd"),
        payload.get("input", {}).get("command") if isinstance(payload.get("input"), dict) else None,
        payload.get("input", {}).get("cmd") if isinstance(payload.get("input"), dict) else None,
        payload.get("tool_input", {}).get("command") if isinstance(payload.get("tool_input"), dict) else None,
        payload.get("tool_input", {}).get("cmd") if isinstance(payload.get("tool_input"), dict) else None,
    ]
    for candidate in candidates:
        if isinstance(candidate, str) and candidate.strip():
            return candidate
    return ""


def main():
    raw = sys.stdin.read()
    try:
        payload = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        payload = {}

    command = extract_command(payload)
    normalized = re.sub(r"\s+", " ", command).strip()

    blocked_patterns = [
        (r"(^|[;&|]\s*)rm\s+(-[^\s]*[rf][^\s]*|-[^\s]*[fr][^\s]*)\b", "rm recursive/force deletion is blocked"),
        (r"(^|[;&|]\s*)git\s+reset\s+--hard\b", "git reset --hard is blocked"),
        (r"(^|[;&|]\s*)git\s+clean\s+-[^\s]*f[^\s]*d[^\s]*x?\b", "git clean force deletion is blocked"),
        (r"(^|[;&|]\s*)find\s+.+\s+-delete\b", "find -delete is blocked"),
        (r"(^|[;&|]\s*)chmod\s+-R\s+777\b", "chmod -R 777 is blocked"),
        (r"(^|[;&|]\s*)chown\s+-R\b", "recursive chown is blocked"),
        (r"(^|[;&|]\s*)sudo\b", "sudo is blocked for agent-run commands"),
    ]

    for pattern, reason in blocked_patterns:
        if re.search(pattern, normalized):
            print(f"Blocked by project Codex hook: {reason}. Command: {normalized}", file=sys.stderr)
            return 2

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

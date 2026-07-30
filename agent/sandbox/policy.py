from __future__ import annotations

import shlex

ALLOWED_BINARIES = {"cat", "curl", "echo", "find", "grep", "head", "ls", "pwd", "python", "python3", "tail", "whoami"}
VLLM_ORIGIN = "http://125.228.207.174:20089/"
FORBIDDEN_TOKENS = ("&&", "||", ";", "|", "`", "$", "<", ">", "\n", "\r")


def validate_command(command: str) -> str | None:
    if not command.strip():
        return "Command is empty."
    if any(token in command for token in FORBIDDEN_TOKENS):
        return "Shell composition, redirection, expansion, and pipelines are denied."
    try:
        argv = shlex.split(command)
    except ValueError as exc:
        return f"Invalid shell syntax: {exc}"
    if not argv or argv[0] not in ALLOWED_BINARIES:
        return f"Command is denied. Allowed binaries: {', '.join(sorted(ALLOWED_BINARIES))}."
    if argv[0] == "curl":
        urls = [arg for arg in argv[1:] if arg.startswith(("http://", "https://"))]
        if len(urls) != 1 or not urls[0].startswith(VLLM_ORIGIN):
            return f"curl is restricted to {VLLM_ORIGIN}."
    return None

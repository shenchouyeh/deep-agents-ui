# Restricted Docker sandbox

`execute` is implemented by `RestrictedDockerSandboxBackend`. Each allowed command runs in a new disposable Docker container; it is not executed by PowerShell or on the Windows host filesystem.

## Setup on Windows

1. Start Docker Desktop and verify `docker version` succeeds.
2. Reinstall Python dependencies after pulling this change:

```powershell
pip install -r requirements.txt
```

3. Build the sandbox image:

```powershell
docker compose -f docker-compose.sandbox.yml build
```

4. Start the LangGraph server normally:

```powershell
$env:PYTHONUTF8 = "1"
langgraph dev --no-browser --no-reload
```

## Controls

- Container user: UID 65532, not root.
- Host mounts: none. The container cannot read the repository, `agent/.env`, SSH keys, or Windows user files.
- Root filesystem: read-only; `/workspace` and `/tmp` are bounded tmpfs mounts.
- Linux capabilities: dropped; privilege escalation disabled.
- Limits: 0.5 CPU, 256 MiB memory, 64 PIDs, 30 second execution timeout.
- Command policy: only a small diagnostic allowlist is accepted. `curl` accepts only the configured vLLM origin.

## Network caveat

The container uses Docker bridge networking so that it can reach the vLLM endpoint. This code enforces the vLLM origin in the command policy, but strict network-level egress restriction requires Docker host firewall rules or an egress proxy. Do not treat command-policy URL validation alone as a complete network firewall.

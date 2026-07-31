from __future__ import annotations

import os
from pathlib import Path

import docker
from docker.errors import DockerException
from deepagents.backends.filesystem import FilesystemBackend
from deepagents.backends.protocol import ExecuteResponse, SandboxBackendProtocol

from sandbox.policy import validate_command


class RestrictedDockerSandboxBackend(FilesystemBackend, SandboxBackendProtocol):
    """Filesystem backend plus deny-by-default execution in ephemeral containers."""

    def __init__(self, *, root_dir: str) -> None:
        super().__init__(root_dir=root_dir)
        self._image = os.getenv("SANDBOX_IMAGE", "deep-agents-sandbox:local")
        self._timeout = int(os.getenv("SANDBOX_TIMEOUT_SECONDS", "30"))
        # Connect lazily so the graph can still start for normal chat and file
        # operations when Docker Desktop is not installed or not running.
        # Shell execution remains fail-closed until Docker becomes available.
        self._client: docker.DockerClient | None = None

    @property
    def id(self) -> str:
        return "restricted-docker-sandbox"

    def execute(self, command: str, *, timeout: int | None = None) -> ExecuteResponse:
        denied = validate_command(command)
        if denied:
            return ExecuteResponse(output=f"POLICY_DENIED: {denied}", exit_code=126, truncated=False)

        if self._client is None:
            try:
                self._client = docker.from_env()
            except DockerException as exc:
                return ExecuteResponse(
                    output=(
                        "SANDBOX_UNAVAILABLE: Docker is not available. "
                        f"Start Docker Desktop and build image '{self._image}'. "
                        f"Details: {exc}"
                    ),
                    exit_code=125,
                    truncated=False,
                )

        limit = min(timeout or self._timeout, self._timeout)
        container = None
        try:
            container = self._client.containers.run(
                self._image,
                command=["/bin/sh", "-lc", command],
                detach=True,
                auto_remove=False,
                user="65532:65532",
                working_dir="/workspace",
                read_only=True,
                tmpfs={"/workspace": "rw,noexec,nosuid,size=64m", "/tmp": "rw,noexec,nosuid,size=32m"},
                network_mode="bridge",
                cap_drop=["ALL"],
                security_opt=["no-new-privileges:true"],
                pids_limit=64,
                mem_limit="256m",
                nano_cpus=500_000_000,
                environment={"HOME": "/workspace", "PATH": "/usr/local/bin:/usr/bin:/bin"},
                labels={"deepagents.sandbox": "true"},
            )
            result = container.wait(timeout=limit)
            output = container.logs(stdout=True, stderr=True).decode("utf-8", errors="replace")
            truncated = len(output) > 32_000
            return ExecuteResponse(output=output[-32_000:], exit_code=int(result.get("StatusCode", 1)), truncated=truncated)
        except DockerException as exc:
            return ExecuteResponse(output=f"SANDBOX_ERROR: {exc}", exit_code=125, truncated=False)
        finally:
            if container is not None:
                try:
                    container.remove(force=True)
                except DockerException:
                    pass

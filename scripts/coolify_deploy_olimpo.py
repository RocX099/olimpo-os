#!/usr/bin/env python3
"""Create the Olimpo OS Coolify service from a Git repo or Docker image.

The script deliberately refuses to deploy without dashboard password auth.
It reads secrets from /home/oriol/AI-Workstation/VPS/.env and never prints them.
"""

from __future__ import annotations

import json
import os
import sys
import textwrap
import urllib.parse
from pathlib import Path

from dotenv import dotenv_values

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.coolify_probe import (  # noqa: E402
    ENV_PATHS,
    _clean_value,
    _coolify_project_environment,
    _request,
)


SERVICE_NAME = "olimpo-os"


def _load_env() -> dict[str, str]:
    merged: dict[str, str] = {}
    for path in ENV_PATHS:
        if path.exists():
            for key, value in dotenv_values(path).items():
                if value:
                    merged[key] = _clean_value(str(value))
    merged.update({k: _clean_value(v) for k, v in os.environ.items() if v})
    return merged


def _required(env: dict[str, str], key: str) -> str:
    value = env.get(key, "").strip()
    if not value:
        raise RuntimeError(f"missing {key}")
    return value


def _quote(value: str) -> str:
    return json.dumps(value)


def _compose(env: dict[str, str]) -> str:
    image = env.get("OLIMPO_DOCKER_IMAGE", "").strip()
    repo = env.get("OLIMPO_GIT_REPOSITORY", "").strip()
    branch = env.get("OLIMPO_GIT_BRANCH", "main").strip() or "main"
    public_url = env.get("OLIMPO_PUBLIC_BASE_URL", "").strip()

    if image:
        source = f"    image: {_quote(image)}\n"
    elif repo:
        git_context = repo
        parsed = urllib.parse.urlparse(repo)
        if parsed.scheme in {"http", "https", "ssh", "git"}:
            git_context = f"{repo}#{branch}"
        source = textwrap.dedent(
            f"""\
                build:
                  context: {_quote(git_context)}
                  dockerfile: Dockerfile
            """
        )
    else:
        raise RuntimeError(
            "missing OLIMPO_GIT_REPOSITORY or OLIMPO_DOCKER_IMAGE. "
            "Coolify needs source code or a prebuilt image."
        )

    env_lines = {
        "HERMES_HOME": "/opt/data",
        "HERMES_WRITE_SAFE_ROOT": "/opt/data",
        "HERMES_WEB_DIST": "/opt/hermes/hermes_cli/web_dist",
        "HERMES_DASHBOARD_PUBLIC_URL": public_url,
        "HERMES_DASHBOARD_BASIC_AUTH_USERNAME": _required(
            env, "HERMES_DASHBOARD_BASIC_AUTH_USERNAME"
        ),
        "HERMES_DASHBOARD_BASIC_AUTH_PASSWORD_HASH": _required(
            env, "HERMES_DASHBOARD_BASIC_AUTH_PASSWORD_HASH"
        ),
        "HERMES_DASHBOARD_BASIC_AUTH_SECRET": _required(
            env, "HERMES_DASHBOARD_BASIC_AUTH_SECRET"
        ),
        "HERMES_DASHBOARD_BASIC_AUTH_TTL_SECONDS": env.get(
            "HERMES_DASHBOARD_BASIC_AUTH_TTL_SECONDS", "43200"
        ),
        "VITE_SENTRY_DSN": env.get("VITE_SENTRY_DSN", ""),
        "VITE_SENTRY_RELEASE": env.get("VITE_SENTRY_RELEASE", "olimpo-vps"),
    }
    rendered_env = "\n".join(
        f"      {key}: {_quote(value)}" for key, value in env_lines.items()
    )
    return textwrap.dedent(
        f"""\
        services:
          {SERVICE_NAME}:
        {source.rstrip()}
            restart: unless-stopped
            ports:
              - "9119:9119"
            volumes:
              - olimpo-data:/opt/data
            environment:
        {rendered_env}
            command:
              - dashboard
              - --host
              - 0.0.0.0
              - --port
              - "9119"
              - --no-open
              - --skip-build

        volumes:
          olimpo-data:
        """
    )


def main() -> int:
    env = _load_env()
    base_url = _required(env, "COOLIFY_URL")
    token = _required(env, "COOLIFY_TOKEN")
    project_uuid, environment_uuid = _coolify_project_environment(
        _required(env, "OLIMPO_VPS_PROJECT_ID")
    )
    server_uuid = env.get("OLIMPO_COOLIFY_SERVER_UUID", "").strip()
    if not server_uuid:
        status, servers = _request(base_url, token, "GET", "/api/v1/servers")
        if status >= 400 or not isinstance(servers, list) or not servers:
            raise RuntimeError("could not resolve Coolify server uuid")
        usable = [s for s in servers if isinstance(s, dict) and s.get("is_usable")]
        server = usable[0] if usable else servers[0]
        server_uuid = str(server.get("uuid") or "")
    if not server_uuid:
        raise RuntimeError("missing server uuid")

    environment_name = env.get("OLIMPO_COOLIFY_ENVIRONMENT_NAME", "").strip()
    if environment_uuid and not environment_name:
        status, body = _request(
            base_url,
            token,
            "GET",
            f"/api/v1/projects/{project_uuid}/{environment_uuid}",
        )
        if isinstance(body, dict):
            environment_name = str(body.get("name") or "")
    if not environment_name:
        environment_name = "production"

    payload = {
        "name": SERVICE_NAME,
        "project_uuid": project_uuid,
        "environment_name": environment_name,
        "server_uuid": server_uuid,
        "docker_compose_raw": _compose(env),
    }
    status, body = _request(base_url, token, "POST", "/api/v1/services", payload)
    print(f"create_service: HTTP {status}")
    if status >= 400:
        print(body)
        return 1
    if isinstance(body, dict):
        print("service uuid:", body.get("uuid") or body.get("service_uuid") or "(unknown)")
        print("service name:", body.get("name") or SERVICE_NAME)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(2)

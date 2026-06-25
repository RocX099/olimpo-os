#!/usr/bin/env python3
"""Create the Olimpo OS Coolify application from a public Git repo.

The script deliberately refuses to deploy without dashboard password auth.
It reads secrets from /home/oriol/AI-Workstation/VPS/.env and never prints them.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import dotenv_values

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.coolify_probe import (  # noqa: E402
    ENV_PATHS,
    _clean_value,
    _coolify_project_environment,
    _request,
)


APP_NAME = "olimpo-os"


def _load_env() -> dict[str, str]:
    merged: dict[str, str] = {}
    for path in ENV_PATHS:
        if path.exists():
            for key, value in dotenv_values(path).items():
                if value:
                    merged[key] = _clean_value(str(value))
    merged.update({k: _clean_value(v) for k, v in os.environ.items() if v})
    for key, value in list(merged.items()):
        if value.lstrip().startswith("//"):
            merged[key] = ""
    return merged


def _required(env: dict[str, str], key: str) -> str:
    value = env.get(key, "").strip()
    if not value:
        raise RuntimeError(f"missing {key}")
    return value


def _application_env(env: dict[str, str]) -> list[dict[str, object]]:
    values = {
        "HERMES_HOME": "/opt/data",
        "HERMES_WRITE_SAFE_ROOT": "/opt/data",
        "HERMES_WEB_DIST": "/opt/hermes/hermes_cli/web_dist",
        "HERMES_DASHBOARD_PUBLIC_URL": env.get("OLIMPO_PUBLIC_BASE_URL", ""),
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
    return [
        {
            "key": key,
            "value": value,
            "is_preview": False,
            "is_literal": True,
            "is_multiline": False,
            "is_shown_once": False,
            "is_runtime": True,
            "is_buildtime": True,
        }
        for key, value in values.items()
    ]


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

    repo = _required(env, "OLIMPO_GIT_REPOSITORY")
    branch = env.get("OLIMPO_GIT_BRANCH", "main").strip() or "main"
    payload = {
        "name": APP_NAME,
        "description": "Olimpo OS dashboard for Sr. Roca",
        "project_uuid": project_uuid,
        "environment_name": environment_name,
        "environment_uuid": environment_uuid,
        "server_uuid": server_uuid,
        "git_repository": repo,
        "git_branch": branch,
        "build_pack": "dockerfile",
        "dockerfile_location": "/Dockerfile",
        "ports_exposes": "9119",
        "start_command": "dashboard --host 0.0.0.0 --port 9119 --no-open --skip-build",
        "is_auto_deploy_enabled": True,
        "is_force_https_enabled": True,
        "instant_deploy": False,
    }
    if env.get("OLIMPO_PUBLIC_BASE_URL", "").strip():
        payload["domains"] = env["OLIMPO_PUBLIC_BASE_URL"].strip()

    status, body = _request(base_url, token, "POST", "/api/v1/applications/public", payload)
    print(f"create_application: HTTP {status}")
    if status >= 400:
        print(body)
        return 1
    app_uuid = ""
    if isinstance(body, dict):
        app_uuid = str(body.get("uuid") or body.get("application_uuid") or "")
        print("application uuid:", app_uuid or "(unknown)")
        domains = body.get("domains")
        if domains:
            print("domains:", domains)
    if not app_uuid:
        return 1

    status, body = _request(
        base_url,
        token,
        "PATCH",
        f"/api/v1/applications/{app_uuid}/envs/bulk",
        {"data": _application_env(env)},
    )
    print(f"update_envs: HTTP {status}")
    if status >= 400:
        print(body)
        return 1

    status, body = _request(base_url, token, "POST", "/api/v1/deploy", {"uuid": app_uuid})
    print(f"deploy: HTTP {status}")
    if status >= 400:
        print(body)
        return 1
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(2)

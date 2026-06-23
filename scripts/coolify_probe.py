#!/usr/bin/env python3
"""Probe a Coolify API token without printing secrets."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from dotenv import dotenv_values


ENV_PATHS = (
    Path("/home/oriol/.hermes/.env"),
    Path("/home/oriol/AI-Workstation/VPS/.env"),
)


def _load_env() -> dict[str, str]:
    merged: dict[str, str] = {}
    for path in ENV_PATHS:
        if path.exists():
            for key, value in dotenv_values(path).items():
                if value:
                    merged[key] = value
    merged.update({k: v for k, v in os.environ.items() if v})
    return merged


def _clean_value(value: str) -> str:
    value = value.strip()
    for marker in (" //", "\t//"):
        if marker in value:
            value = value.split(marker, 1)[0]
    return value.strip()


def _coolify_project_environment(raw: str) -> tuple[str, str]:
    raw = _clean_value(raw)
    parsed = urllib.parse.urlparse(raw)
    path = parsed.path if parsed.scheme and parsed.netloc else raw
    parts = [p for p in path.split("/") if p]
    project = ""
    environment = ""
    for idx, part in enumerate(parts):
        if part == "project" and idx + 1 < len(parts):
            project = parts[idx + 1]
        if part == "environment" and idx + 1 < len(parts):
            environment = parts[idx + 1]
    return project or raw, environment


def _request(base_url: str, token: str, method: str, path: str, body: dict | None = None):
    data = None
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(
        base_url.rstrip("/") + path,
        data=data,
        headers=headers,
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8")
            content_type = resp.headers.get("content-type", "")
            try:
                body = json.loads(raw) if raw else None
            except json.JSONDecodeError:
                body = {
                    "non_json": True,
                    "content_type": content_type,
                    "preview": raw[:120].replace("\n", "\\n"),
                }
            return resp.status, body
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:500]
        return exc.code, {"error": detail}


def _summarize_resources(body: dict) -> None:
    for collection, kind in (
        ("applications", "application"),
        ("services", "service"),
        ("postgresqls", "postgres"),
        ("mysqls", "mysql"),
        ("mariadbs", "mariadb"),
        ("mongodbs", "mongodb"),
    ):
        items = body.get(collection)
        if not isinstance(items, list):
            continue
        print(f"{kind}s: {len(items)}")
        for item in items[:12]:
            if not isinstance(item, dict):
                continue
            name = item.get("name") or item.get("description") or "(unnamed)"
            uuid = item.get("uuid") or item.get("id") or "(no-id)"
            fqdn = item.get("fqdn") or item.get("domains") or ""
            suffix = f" fqdn={fqdn}" if fqdn else ""
            print(f"  - {kind}: {name} uuid={uuid}{suffix}")


def main() -> int:
    env = _load_env()
    base_url = (
        env.get("COOLIFY_URL")
        or env.get("OLIMPO_PUBLIC_BASE_URL")
        or ""
    )
    base_url = _clean_value(base_url)
    token = (
        env.get("COOLIFY_TOKEN")
        or env.get("OLIMPO_VPS_PROVIDER_TOKEN")
        or ""
    ).strip()

    if not base_url or not token:
        print("missing: set COOLIFY_URL and COOLIFY_TOKEN, or OLIMPO_PUBLIC_BASE_URL and OLIMPO_VPS_PROVIDER_TOKEN")
        return 2

    for label, path in (
        ("version", "/api/v1/version"),
        ("projects", "/api/v1/projects"),
        ("resources", "/api/v1/resources"),
    ):
        status, body = _request(base_url, token, "GET", path)
        print(f"{label}: HTTP {status}")
        if status >= 400:
            print(f"{label} error: {body}")
            return 1
        if isinstance(body, list):
            print(f"{label} count: {len(body)}")
        elif isinstance(body, dict):
            keys = ", ".join(sorted(body.keys())[:8])
            print(f"{label} keys: {keys}")

    project_uuid, environment_uuid = _coolify_project_environment(
        env.get("OLIMPO_VPS_PROJECT_ID", "")
    )
    if project_uuid:
        status, body = _request(base_url, token, "GET", f"/api/v1/projects/{project_uuid}")
        print(f"target_project: HTTP {status}")
        if isinstance(body, dict):
            print("target_project keys:", ", ".join(sorted(body.keys())[:10]))
        if environment_uuid:
            status, body = _request(
                base_url,
                token,
                "GET",
                f"/api/v1/projects/{project_uuid}/{environment_uuid}",
            )
            print(f"target_environment: HTTP {status}")
            if isinstance(body, dict):
                print("target_environment keys:", ", ".join(sorted(body.keys())[:10]))
                _summarize_resources(body)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

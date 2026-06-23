#!/usr/bin/env python3
"""Initialize Olimpo VPS dashboard auth env without printing secrets."""

from __future__ import annotations

import base64
import secrets
import string
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from plugins.dashboard_auth.basic import hash_password  # noqa: E402


VPS_ENV = Path("/home/oriol/AI-Workstation/VPS/.env")
CREDENTIALS_FILE = Path("/home/oriol/AI-Workstation/VPS/olimpo-dashboard-credentials.txt")
USERNAME = "Sr. Roca"


def _generate_password(length: int = 24) -> str:
    alphabet = string.ascii_letters + string.digits + "-_+=."
    return "".join(secrets.choice(alphabet) for _ in range(length))


def _has_key(text: str, key: str) -> bool:
    return any(line.strip().startswith(f"{key}=") for line in text.splitlines())


def main() -> int:
    VPS_ENV.parent.mkdir(parents=True, exist_ok=True)
    text = VPS_ENV.read_text(encoding="utf-8") if VPS_ENV.exists() else ""
    required = (
        "HERMES_DASHBOARD_BASIC_AUTH_USERNAME",
        "HERMES_DASHBOARD_BASIC_AUTH_PASSWORD_HASH",
        "HERMES_DASHBOARD_BASIC_AUTH_SECRET",
        "HERMES_DASHBOARD_BASIC_AUTH_TTL_SECONDS",
    )
    missing = [key for key in required if not _has_key(text, key)]
    if not missing:
        print("auth_env: already present")
        return 0

    password = _generate_password()
    password_hash = hash_password(password)
    signing_secret = base64.b64encode(secrets.token_bytes(32)).decode("ascii")
    lines = [
        "",
        "# Olimpo OS VPS dashboard auth",
        f'HERMES_DASHBOARD_BASIC_AUTH_USERNAME="{USERNAME}"',
        f'HERMES_DASHBOARD_BASIC_AUTH_PASSWORD_HASH="{password_hash}"',
        f'HERMES_DASHBOARD_BASIC_AUTH_SECRET="{signing_secret}"',
        "HERMES_DASHBOARD_BASIC_AUTH_TTL_SECONDS=43200",
    ]
    with VPS_ENV.open("a", encoding="utf-8") as fh:
        fh.write("\n".join(lines))
        fh.write("\n")

    credentials = (
        "Olimpo OS VPS dashboard login\n"
        f"Username: {USERNAME}\n"
        f"Password: {password}\n"
        "\n"
        "No subas este archivo a GitHub ni lo pegues en chats.\n"
    )
    old_umask = None
    try:
        old_umask = __import__("os").umask(0o177)
        CREDENTIALS_FILE.write_text(credentials, encoding="utf-8")
    finally:
        if old_umask is not None:
            __import__("os").umask(old_umask)
    print(f"auth_env: wrote {len(missing)} missing keys")
    print(f"credentials_file: {CREDENTIALS_FILE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

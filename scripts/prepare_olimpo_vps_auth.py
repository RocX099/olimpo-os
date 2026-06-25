#!/usr/bin/env python3
"""Generate .env lines for Olimpo dashboard VPS password auth."""

from __future__ import annotations

import base64
import getpass
import secrets
import shlex
import sys

from plugins.dashboard_auth.basic import hash_password


def main() -> int:
    username = "Sr. Roca"
    password = getpass.getpass("Password para Olimpo OS VPS: ")
    confirm = getpass.getpass("Repite password: ")
    if password != confirm:
        print("ERROR: las passwords no coinciden.", file=sys.stderr)
        return 1
    if len(password) < 12:
        print("ERROR: usa una password de 12+ caracteres.", file=sys.stderr)
        return 1

    password_hash = hash_password(password)
    signing_secret = base64.b64encode(secrets.token_bytes(32)).decode("ascii")

    print()
    print("# Pega estas lineas en /home/oriol/.hermes/.env en la VPS:")
    print(f"HERMES_DASHBOARD_BASIC_AUTH_USERNAME={shlex.quote(username)}")
    print(f"HERMES_DASHBOARD_BASIC_AUTH_PASSWORD_HASH={shlex.quote(password_hash)}")
    print(f"HERMES_DASHBOARD_BASIC_AUTH_SECRET={shlex.quote(signing_secret)}")
    print("HERMES_DASHBOARD_BASIC_AUTH_TTL_SECONDS=43200")
    print()
    print("# Arranque recomendado detras de HTTPS/reverse proxy:")
    print("hermes dashboard --host 127.0.0.1 --port 9119 --no-open --skip-build")
    print()
    print("# Arranque directo solo si el firewall permite solo tu IP/VPN:")
    print("hermes dashboard --host 0.0.0.0 --port 9119 --no-open --skip-build")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

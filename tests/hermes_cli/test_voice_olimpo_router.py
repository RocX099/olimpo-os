from hermes_cli import web_server


def test_voice_router_selects_apolo_for_pantheon_logo_prompt():
    route = web_server._voice_route_request(
        "ve al panteon, escoge el dios predilecto y haz un prompt para un buen logo"
    )

    assert route["selected_god"]["id"] == "apolo"
    assert route["model"] == "qwen3.5:4b"
    assert "panteon" in route["modules"]
    assert "artifact" in route["intent"]


def test_voice_router_blocks_delete_requests():
    route = web_server._voice_route_request("elimina todos los logs antiguos")

    assert route["deletion_blocked"] is True
    assert route["write_requires_permission"] is False


def test_voice_router_requires_permission_for_write_requests():
    route = web_server._voice_route_request("guarda este prompt en contexto")

    assert route["deletion_blocked"] is False
    assert route["write_requires_permission"] is True
    assert "contexto" in route["modules"]


def test_voice_router_treats_natural_creame_monologo_as_writable_artifact():
    route = web_server._voice_route_request("creame un monologo corto mirando el panteon")

    assert route["deletion_blocked"] is False
    assert route["write_requires_permission"] is True
    assert "artifact" in route["intent"]
    assert "panteon" in route["modules"]

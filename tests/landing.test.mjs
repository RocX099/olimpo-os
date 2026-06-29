import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

async function read(name) {
  return readFile(new URL(name, root), "utf8");
}

test("landing contains the complete outcome-first journey", async () => {
  const html = await read("index.html");

  for (const id of ["resultados", "proceso", "guia", "ejemplo-olimpo", "empezar"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /FORMULARIO_OLIMPO_OS\.html/g);
  assert.doesNotMatch(html, /tienes que crear(?:te)? un Olimpo/i);
});

test("landing exposes complete Spanish and English copy", async () => {
  const html = await read("index.html");
  const script = await read("app.js");

  assert.match(html, /data-i18n=/);
  assert.match(script, /const translations/);
  assert.match(script, /es:\s*{/);
  assert.match(script, /en:\s*{/);
  assert.match(script, /Diseña lo que necesitas/);
  assert.match(script, /Design what you need/);
});

test("landing has accessible language controls and landmarks", async () => {
  const html = await read("index.html");

  assert.match(html, /<header[\s>]/);
  assert.match(html, /<main[\s>]/);
  assert.match(html, /<footer[\s>]/);
  assert.match(html, /id="langEs"[^>]*aria-pressed="true"/);
  assert.match(html, /id="langEn"[^>]*aria-pressed="false"/);
  assert.match(html, /class="skip-link"/);
});

test("deployment serves static assets through nginx", async () => {
  const dockerfile = await read("Dockerfile");
  const nginx = await read("nginx.conf");

  assert.match(dockerfile, /FROM nginx:/);
  assert.match(dockerfile, /COPY nginx\.conf/);
  assert.match(nginx, /try_files \$uri \$uri\/ =404;/);
  assert.match(nginx, /listen 80/);
});

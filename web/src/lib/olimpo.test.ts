import { describe, expect, it } from "vitest";
import {
  DEFAULT_OLIMPO_STATE,
  OLIMPO_NAV,
  OLIMPO_WELCOME_STORAGE_KEY,
  OLLAMA_LOCAL_MODELS,
  PANTHEON_AGENTS,
  addOlimpoRoutine,
  assignOlimpoEmissary,
  deserializeOlimpoState,
  getPantheonChatPreset,
  sendOlimpoCommand,
  serializeOlimpoState,
  setOlimpoCodexSpend,
  toggleOlimpoMobileConnection,
  getOlimpoModule,
  welcomeCopy,
} from "./olimpo";

describe("olimpo configuration", () => {
  it("defines the global Olimpo shell labels and grouped navigation", () => {
    expect(welcomeCopy.action).toBe("Entrar en Olimpo OS");
    expect(OLIMPO_NAV[0]).toEqual({ id: "inicio", label: "Inicio" });
    expect(OLIMPO_NAV.map((item) => item.label)).toEqual([
      "Inicio",
      "Olimpo Chat",
      "Contexto",
      "Modelos",
      "Errores",
      "Cron",
      "Skills",
      "VOICE",
      "Pairing",
      "Radar",
      "Panteón",
      "Keys",
      "Sistema",
    ]);

    expect(OLIMPO_NAV.map((item) => item.label)).not.toContain("Files");
    expect(OLIMPO_NAV.map((item) => item.label)).not.toContain("Profiles");
    expect(OLIMPO_NAV.map((item) => item.label)).not.toContain("Plugins");
    expect(OLIMPO_NAV.map((item) => item.label)).not.toContain("MCP");
    expect(OLIMPO_NAV.map((item) => item.label)).not.toContain("Documentation");
  });

  it("keeps Inicio as the explanatory hub after the welcome gate", () => {
    expect(OLIMPO_WELCOME_STORAGE_KEY).toBe("olimpo-os-welcome-session");
    expect(OLIMPO_NAV[0]).toEqual({ id: "inicio", label: "Inicio" });
    const inicio = getOlimpoModule("inicio");

    expect(inicio.route).toBe("/olimpo");
    expect(inicio.title).toBe("Inicio");
    expect(inicio.metrics).toEqual([]);
    expect(inicio.panels.flatMap((panel) => panel.items)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Inicio"),
        expect.stringContaining("Olimpo Chat"),
        expect.stringContaining("Contexto"),
        expect.stringContaining("Panteon"),
        expect.stringContaining("Pairing"),
        expect.stringContaining("Radar"),
        expect.stringContaining("Skills"),
      ]),
    );
  });

  it("keeps Connect absorbed into Pairing and Radar scoped to the radar cron", () => {
    expect(OLIMPO_NAV.map((item) => item.label)).not.toContain("Connect");
    expect(getOlimpoModule("pairing").panels.flatMap((panel) => panel.items)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Google Calendar"),
        expect.stringContaining("Sentry"),
        expect.stringContaining("Mark-XLVI"),
        expect.stringContaining("URL LAN"),
      ]),
    );
    expect(getOlimpoModule("radar").panels.flatMap((panel) => panel.items)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("domingo"),
        expect.stringContaining("Llama 3.1 8B"),
        expect.stringContaining("Contexto/Radar"),
      ]),
    );
    expect(getOlimpoModule("radar").panels.flatMap((panel) => panel.items).join(" ")).not.toContain(
      "Jarvis",
    );
  });

  it("attaches ceremonial image assets to every Pantheon profile", () => {
    expect(PANTHEON_AGENTS).toHaveLength(8);
    for (const agent of PANTHEON_AGENTS) {
      expect(agent.image).toMatch(/^\/olimpo\/.*\.png$/);
      expect(agent.profileRoute).toContain("/chat?");
    }
  });

  it("covers every top-level area requested for Olimpo OS", () => {
    expect(welcomeCopy.title).toBe("Bienvenido al Olimpo");
    expect(welcomeCopy.recipient).toBe("Sr. Roca");

    expect(OLIMPO_NAV.map((item) => item.id)).toEqual([
      "inicio",
      "chat",
      "contexto",
      "modelos",
      "errores",
      "cron",
      "skills",
      "voice",
      "pairing",
      "radar",
      "panteon",
      "keys",
      "sistema",
    ]);
  });

  it("adds VOICE as a real Olimpo module routed to the Voice tab", () => {
    expect(OLIMPO_NAV).toContainEqual({ id: "voice", label: "VOICE" });
    expect(getOlimpoModule("voice")).toMatchObject({
      id: "voice",
      title: "VOICE",
      route: "/voice",
    });
  });

  it("connects Pantheon gods with model and prompt metadata", () => {
    const zeus = PANTHEON_AGENTS.find((agent) => agent.id === "zeus");

    expect(zeus).toMatchObject({
      name: "Zeus",
      role: "Supremo",
      model: "llama3.1:8b",
      provider: "ollama",
    });
    expect(zeus?.prompt).toContain("pensamiento profundo");
    expect(zeus?.image).toBe("/olimpo/zeus.png");

    const impossibleModels = ["GPT-5.1", "GPT-5.5", "GPT-5 Vision", "Codex High"];
    for (const agent of PANTHEON_AGENTS) {
      for (const impossible of impossibleModels) {
        expect(agent.model).not.toContain(impossible);
      }
      expect(agent.profileRoute).toContain("/chat?");
      expect(agent.profileRoute).toContain(`olimpoGod=${agent.id}`);
    }

    expect(getPantheonChatPreset("zeus")).toMatchObject({
      agentId: "zeus",
      agentName: "Zeus",
      model: "llama3.1:8b",
      provider: "ollama",
      modelSwitchCommand: "/model llama3.1:8b --provider ollama --tui-session",
    });
    expect(getPantheonChatPreset("zeus")?.prompt.length).toBeGreaterThan(180);
    expect(getPantheonChatPreset("hera")?.modelSwitchCommand).toContain("llama3.1:8b");
    expect(getPantheonChatPreset("ares")?.modelSwitchCommand).toContain("qwen2.5-coder:3b");
    expect(getPantheonChatPreset("unknown")).toBeNull();
  });

  it("declares the expected local Ollama models for chat and models pages", () => {
    expect(OLLAMA_LOCAL_MODELS).toEqual([
      "huihui_ai/deepseek-r1-abliterated:8b",
      "llama3.1:8b",
      "nomic-embed-text:latest",
      "qwen2.5-coder:3b",
      "qwen3.5:4b",
    ]);
  });

  it("provides actionable data for each module screen", () => {
    for (const navItem of OLIMPO_NAV) {
      const module = getOlimpoModule(navItem.id);

      expect(module.title.length).toBeGreaterThan(0);
      if (module.id === "inicio") {
        expect(module.metrics).toEqual([]);
      } else {
        expect(module.metrics.length).toBeGreaterThan(0);
      }
      expect(module.panels.length).toBeGreaterThan(0);
    }
  });

  it("toggles mobile connection state for WhatsApp and Telegram", () => {
    const connected = toggleOlimpoMobileConnection(DEFAULT_OLIMPO_STATE);
    const disconnected = toggleOlimpoMobileConnection(connected);

    expect(connected.mobileConnected).toBe(true);
    expect(connected.channels).toEqual(["WhatsApp", "Telegram"]);
    expect(disconnected.mobileConnected).toBe(false);
    expect(disconnected.channels).toEqual([]);
  });

  it("stores editable Codex spend without mutating the current state", () => {
    const updated = setOlimpoCodexSpend(DEFAULT_OLIMPO_STATE, "128.40");

    expect(updated.codexSpend).toBe("128.40");
    expect(DEFAULT_OLIMPO_STATE.codexSpend).toBe("0.00");
  });

  it("adds routines and assigns emissaries to missions", () => {
    const withRoutine = addOlimpoRoutine(DEFAULT_OLIMPO_STATE, "Revision de noche");
    const assigned = assignOlimpoEmissary(withRoutine, "zeus", "Construir Olimpo OS");

    expect(withRoutine.routines).toContain("Revision de noche");
    expect(assigned.emissaryAssignments).toContainEqual({
      agentId: "zeus",
      mission: "Construir Olimpo OS",
    });
  });

  it("serializes and deserializes persisted Olimpo state", () => {
    const state = assignOlimpoEmissary(
      addOlimpoRoutine(DEFAULT_OLIMPO_STATE, "Revision de noche"),
      "zeus",
      "Construir Olimpo OS",
    );
    const restored = deserializeOlimpoState(serializeOlimpoState(state));

    expect(restored).toEqual(state);
  });

  it("falls back to defaults for invalid persisted state", () => {
    expect(deserializeOlimpoState("not-json")).toEqual(DEFAULT_OLIMPO_STATE);
    expect(deserializeOlimpoState(JSON.stringify({ version: 999 }))).toEqual(
      DEFAULT_OLIMPO_STATE,
    );
  });

  it("records Hermes commands with selected Pantheon model context", () => {
    const zeus = PANTHEON_AGENTS.find((agent) => agent.id === "zeus");
    if (!zeus) throw new Error("Zeus agent missing");

    const updated = sendOlimpoCommand(
      DEFAULT_OLIMPO_STATE,
      zeus,
      "Organiza las prioridades de hoy",
    );

    expect(updated.commandLog).toHaveLength(1);
    expect(updated.commandLog[0]).toMatchObject({
      agentId: "zeus",
      agentName: "Zeus",
      model: "llama3.1:8b",
      command: "Organiza las prioridades de hoy",
      appliedPrompt: zeus.prompt,
    });
  });
});

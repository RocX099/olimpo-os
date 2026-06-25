export type OlimpoModuleId =
  | "inicio"
  | "chat"
  | "contexto"
  | "modelos"
  | "errores"
  | "cron"
  | "skills"
  | "voice"
  | "pairing"
  | "radar"
  | "panteon"
  | "keys"
  | "sistema";

export type OlimpoMetric = {
  label: string;
  value: string;
  tone: "gold" | "green" | "amber" | "red";
};

export type OlimpoPanel = {
  title: string;
  items: string[];
};

export type OlimpoModule = {
  id: OlimpoModuleId;
  title: string;
  eyebrow: string;
  summary: string;
  route: string;
  metrics: OlimpoMetric[];
  panels: OlimpoPanel[];
};

export type PantheonAgent = {
  id: string;
  name: string;
  role: string;
  provider: string;
  model: string;
  duty: string;
  prompt: string;
  seal: string;
  image: string;
  profileRoute: string;
};

export type PantheonChatPreset = {
  agentId: string;
  agentName: string;
  role: string;
  provider: string;
  model: string;
  modelSwitchCommand: string;
  prompt: string;
  commandDraft: string;
};

export const OLLAMA_LOCAL_MODELS = [
  "huihui_ai/deepseek-r1-abliterated:8b",
  "llama3.1:8b",
  "nomic-embed-text:latest",
  "qwen2.5-coder:3b",
  "qwen3.5:4b",
] as const;

export type OlimpoState = {
  mobileConnected: boolean;
  channels: string[];
  codexSpend: string;
  monthlyBudget: string;
  routines: string[];
  emissaryAssignments: Array<{
    agentId: string;
    mission: string;
  }>;
  commandLog: Array<{
    id: string;
    agentId: string;
    agentName: string;
    model: string;
    command: string;
    appliedPrompt: string;
    createdAt: string;
  }>;
};

const OLIMPO_STATE_VERSION = 1;

export const OLIMPO_WELCOME_STORAGE_KEY = "olimpo-os-welcome-session";

export const welcomeCopy = {
  title: "Bienvenido al Olimpo",
  recipient: "Sr. Roca",
  action: "Entrar en Olimpo OS",
};

export const DEFAULT_OLIMPO_STATE: OlimpoState = {
  mobileConnected: false,
  channels: [],
  codexSpend: "0.00",
  monthlyBudget: "500.00",
  routines: ["Manana estrategica", "Revision semanal", "Foco profundo"],
  emissaryAssignments: [],
  commandLog: [],
};

export const OLIMPO_NAV: Array<{ id: OlimpoModuleId; label: string }> = [
  { id: "inicio", label: "Inicio" },
  { id: "chat", label: "Olimpo Chat" },
  { id: "contexto", label: "Contexto" },
  { id: "modelos", label: "Modelos" },
  { id: "errores", label: "Errores" },
  { id: "cron", label: "Cron" },
  { id: "skills", label: "Skills" },
  { id: "voice", label: "VOICE" },
  { id: "pairing", label: "Pairing" },
  { id: "radar", label: "Radar" },
  { id: "panteon", label: "Panteón" },
  { id: "keys", label: "Keys" },
  { id: "sistema", label: "Sistema" },
];

export const PANTHEON_AGENTS: PantheonAgent[] = [
  {
    id: "zeus",
    name: "Zeus",
    role: "Supremo",
    provider: "ollama",
    model: "llama3.1:8b",
    duty: "Pensamiento profundo, decisiones criticas y mando final.",
    prompt:
      "Actua como Zeus, soberano del Olimpo OS. Usa pensamiento profundo antes de responder: prioridades, riesgos y consecuencias. Responde con criterio firme, ordena lo importante, elimina ruido, marca una decision clara y termina con el siguiente paso verificable para el Sr. Roca.",
    seal: "Rayo",
    image: "/olimpo/zeus.png",
    profileRoute: "/chat?olimpoGod=zeus",
  },
  {
    id: "hera",
    name: "Hera",
    role: "Gobierno",
    provider: "ollama",
    model: "llama3.1:8b",
    duty: "Configuracion, perfiles, orden interno y reglas de convivencia del sistema.",
    prompt:
      "Actua como Hera, gobierno interno del Olimpo OS. Revisa configuracion, permisos, perfiles, seguridad y orden del sistema. Responde con estructura, detecta inconsistencias, protege lo privado y deja una decision administrativa clara.",
    seal: "Corona",
    image: "/olimpo/hera.png",
    profileRoute: "/chat?olimpoGod=hera",
  },
  {
    id: "poseidon",
    name: "Poseidon",
    role: "Conexiones",
    provider: "ollama",
    model: "llama3.1:8b",
    duty: "Mensajeria, canales, pairing movil, WhatsApp, Telegram y flujos remotos.",
    prompt:
      "Actua como Poseidon, guardian de conexiones. Piensa en canales, pairing movil, WhatsApp, Telegram, LAN, VPN y relay seguro. Prioriza estabilidad, tokens temporales, revocacion y pasos concretos para conectar sin exponer de mas.",
    seal: "Tridente",
    image: "/olimpo/poseidon.png",
    profileRoute: "/chat?olimpoGod=poseidon",
  },
  {
    id: "atenea",
    name: "Atenea",
    role: "Estratega",
    provider: "ollama",
    model: "qwen3.5:4b",
    duty: "Planes, arquitectura, estudio, contexto y estrategia de largo plazo.",
    prompt:
      "Actua como Atenea, estratega del Olimpo OS. Convierte ideas confusas en arquitectura, plan y criterios. Razona paso a paso, separa lo urgente de lo importante, identifica dependencias y entrega una secuencia ejecutable.",
    seal: "Buho",
    image: "/olimpo/atenea.png",
    profileRoute: "/chat?olimpoGod=atenea",
  },
  {
    id: "apolo",
    name: "Apolo",
    role: "Claridad",
    provider: "ollama",
    model: "qwen3.5:4b",
    duty: "Analisis visual, creatividad, presentacion, estilo y explicacion limpia.",
    prompt:
      "Actua como Apolo, claridad y presentacion. Convierte informacion tecnica o caotica en explicacion limpia, visual y util. Cuida tono, jerarquia, nombres, interfaz y comprension rapida sin adornos innecesarios.",
    seal: "Lira",
    image: "/olimpo/apolo.png",
    profileRoute: "/chat?olimpoGod=apolo",
  },
  {
    id: "artemisa",
    name: "Artemisa",
    role: "Vigilia",
    provider: "ollama",
    model: "llama3.1:8b",
    duty: "Objetivos, vigilancia, foco, rutinas y seguimiento de misiones recurrentes.",
    prompt:
      "Actua como Artemisa, vigilia y foco. Rastrea objetivos, rutinas y amenazas de dispersion. Resume estado, detecta bloqueos, protege la atencion del Sr. Roca y propone una accion pequena pero inmediata.",
    seal: "Arco",
    image: "/olimpo/artemisa.png",
    profileRoute: "/chat?olimpoGod=artemisa",
  },
  {
    id: "ares",
    name: "Ares",
    role: "Ejecucion",
    provider: "ollama",
    model: "qwen2.5-coder:3b",
    duty: "Accion rapida, tareas tecnicas, despliegues y combate contra bloqueos.",
    prompt:
      "Actua como Ares, ejecucion tecnica. Toma el objetivo y conviertelo en cambios concretos, comandos, pruebas y verificacion. Evita teoria larga, busca el bloqueo real y empuja hasta una salida comprobable.",
    seal: "Lanza",
    image: "/olimpo/ares.png",
    profileRoute: "/chat?olimpoGod=ares",
  },
  {
    id: "afrodita",
    name: "Afrodita",
    role: "Relacion",
    provider: "ollama",
    model: "llama3.1:8b",
    duty: "Tono, comunicacion, mensajes humanos, energia visual y cuidado del lenguaje.",
    prompt:
      "Actua como Afrodita, relacion y lenguaje humano. Pule tono, mensajes, energia visual y comunicacion delicada. Haz que la respuesta suene clara, cercana y respetuosa sin perder precision ni decision.",
    seal: "Rosa",
    image: "/olimpo/afrodita.png",
    profileRoute: "/chat?olimpoGod=afrodita",
  },
];

const modules: Record<OlimpoModuleId, OlimpoModule> = {
  inicio: {
    id: "inicio",
    title: "Inicio",
    eyebrow: "Mapa del Olimpo OS",
    route: "/olimpo",
    summary:
      "Explicacion limpia de cada sala del Olimpo OS para entrar sabiendo que toca cada cosa.",
    metrics: [],
    panels: [
      {
        title: "Mapa del menu",
        items: [
          "Inicio explica el mapa y no mezcla metricas ni controles.",
          "Olimpo Chat conversa con el perfil, prompt y modelo elegidos.",
          "Contexto guarda carpetas y memoria de cada proyecto o herramienta.",
          "Modelos muestra OpenAI, proveedores y modelos locales Ollama.",
          "Errores enseña logs reales y prepara Sentry.",
          "Cron crea rutinas como mini programas con modelo y fallback.",
        ],
      },
      {
        title: "Salas operativas",
        items: [
          "Skills agrupa skills, plugins y MCPs en un solo sitio.",
          "Pairing conecta movil, QR, Calendar, Sentry y futuros conectores.",
          "Radar contiene solo el cron Radar y su salida Contexto/Radar.",
          "Panteon contiene solo dioses, prompts, imagenes y modelos validos.",
          "Keys y Sistema separan secretos, configuracion y estado tecnico.",
        ],
      },
    ],
  },
  chat: {
    id: "chat",
    title: "Olimpo Chat",
    eyebrow: "Sala principal",
    route: "/chat",
    summary:
      "El chat principal del agente. Aqui se escoge modelo, se consulta historial y se conversa bajo el criterio del Panteon.",
    metrics: [
      { label: "Modelo", value: "OpenAI + local", tone: "gold" },
      { label: "Sesiones", value: "Integradas", tone: "gold" },
      { label: "Local", value: "Auto", tone: "gold" },
      { label: "Estado", value: "Prioridad", tone: "gold" },
    ],
    panels: [
      {
        title: "Chat unificado",
        items: ["Selector OpenAI", "Modelos locales detectados", "Sesiones dentro del chat"],
      },
      {
        title: "Panteon aplicado",
        items: ["Hablar como Zeus", "Enviar tarea a Ares", "Usar Atenea para estrategia"],
      },
    ],
  },
  contexto: {
    id: "contexto",
    title: "Contexto",
    eyebrow: "Archivos vivos",
    route: "/files",
    summary:
      "Antes Files. Carpetas de contexto por proyecto, producto, ventana, herramienta o area de trabajo.",
    metrics: [
      { label: "Carpetas", value: "Por area", tone: "gold" },
      { label: "Lectura", value: "Local", tone: "gold" },
      { label: "RAG", value: "Futuro", tone: "gold" },
      { label: "Permisos", value: "Control", tone: "gold" },
    ],
    panels: [
      {
        title: "Estructura deseada",
        items: ["Contexto ChatGPT", "Contexto ventanas", "Contexto proyectos", "Contexto herramientas"],
      },
      {
        title: "Regla",
        items: ["Cada carpeta explica su mundo", "No mezclar contexto", "Usar solo lo necesario"],
      },
    ],
  },
  modelos: {
    id: "modelos",
    title: "Modelos",
    eyebrow: "Ruteo",
    route: "/models",
    summary:
      "Catalogo OpenAI, Codex, Claude futuro y modelos locales que se actualizan cuando se instalan en Ollama.",
    metrics: [
      { label: "OpenAI", value: "Proveedor", tone: "gold" },
      { label: "Locales", value: "Auto", tone: "gold" },
      { label: "Claude", value: "Opcional", tone: "gold" },
      { label: "Ollama", value: "5", tone: "gold" },
    ],
    panels: [
      {
        title: "Uso por modelo",
        items: OLLAMA_LOCAL_MODELS.map((model) => `Ollama: ${model}`),
      },
      {
        title: "Acciones",
        items: ["Añadir modelo con ollama pull <modelo>", "Conectar OpenAI", "Conectar Anthropic", "Configurar endpoint local"],
      },
    ],
  },
  errores: {
    id: "errores",
    title: "Errores y Sentry",
    eyebrow: "Observabilidad",
    route: "/logs",
    summary: "Logs actuales y preparacion para conectar Sentry sin ruido ni falsos estados.",
    metrics: [
      { label: "Logs", value: "Activos", tone: "gold" },
      { label: "Sentry", value: "Pendiente", tone: "gold" },
      { label: "502", value: "Vigilar", tone: "red" },
      { label: "Alertas", value: "Futuro", tone: "gold" },
    ],
    panels: [
      {
        title: "Errores",
        items: ["Logs Hermes", "Errores navegador", "Gateway caido", "Sentry luego"],
      },
      {
        title: "Objetivo",
        items: ["No decorar errores", "Mostrar causa", "Proponer arreglo"],
      },
    ],
  },
  cron: {
    id: "cron",
    title: "Cron",
    eyebrow: "Rutinas programadas",
    route: "/cron",
    summary:
      "Crear rutinas como mini programas: escoger modelo, fallback y frecuencia antes de activar.",
    metrics: [
      { label: "Create", value: "Modelo", tone: "gold" },
      { label: "Fallback", value: "GPT", tone: "gold" },
      { label: "Local", value: "Llama/DeepSeek", tone: "gold" },
      { label: "Aprobacion", value: "Si", tone: "gold" },
    ],
    panels: [
      {
        title: "Crear cron",
        items: ["Elegir modelo", "Elegir fallback", "Definir rutina", "Ver log"],
      },
      {
        title: "Ejemplos",
        items: ["Resumen manana", "Revision gastos", "Memoria semanal"],
      },
    ],
  },
  skills: {
    id: "skills",
    title: "Skills, Plugins y MCPs",
    eyebrow: "Capacidades",
    route: "/skills",
    summary:
      "Un solo sitio para skills de Hermes, plugins instalables y MCPs activos, con estado real y acciones claras.",
    metrics: [
      { label: "Skills", value: "Biblioteca", tone: "gold" },
      { label: "Plugins", value: "Dentro", tone: "gold" },
      { label: "MCPs", value: "Dentro", tone: "gold" },
      { label: "502", value: "No", tone: "red" },
    ],
    panels: [
      {
        title: "Agrupacion",
        items: ["Skills", "Plugins", "MCPs", "Instalacion guiada"],
      },
      {
        title: "Estado",
        items: ["CodeGraph MCP", "Google/GitHub despues", "Sin credenciales expuestas"],
      },
    ],
  },
  voice: {
    id: "voice",
    title: "VOICE",
    eyebrow: "Dictado y conversacion",
    route: "/voice",
    summary:
      "VoiceOS integrado: dictado Whisper local, hotkeys reales y conversacion hablada con Olimpo.",
    metrics: [
      { label: "Dictado", value: "Ctrl+Alt+X", tone: "gold" },
      { label: "Olimpo", value: "Ctrl+Alt+Space", tone: "gold" },
      { label: "STT", value: "Whisper local", tone: "gold" },
      { label: "TTS", value: "Open source", tone: "gold" },
    ],
    panels: [
      {
        title: "Flujos",
        items: ["Dictado normal transcribe e inyecta texto", "Conversacion no inyecta texto", "Respuesta hablada por TTS"],
      },
      {
        title: "Seguridad",
        items: ["Proxy local autenticado desde Hermes", "Sin secretos en UI", "ElevenLabs solo como fallback opcional"],
      },
    ],
  },
  pairing: {
    id: "pairing",
    title: "Pairing movil",
    eyebrow: "Jarvis / Mark XLVI",
    route: "/pairing",
    summary:
      "Conexion movil por QR o puente equivalente, inspirada en el flujo Jarvis/Mark-XLVI investigado.",
    metrics: [
      { label: "QR", value: "Objetivo", tone: "gold" },
      { label: "Movil", value: "Pendiente", tone: "gold" },
      { label: "Token", value: "Temporal", tone: "gold" },
      { label: "LAN", value: "Primero", tone: "gold" },
    ],
    panels: [
      {
        title: "Conectores",
        items: ["Mobile/QR con clave temporal", "Google Calendar connect/disconnect", "Sentry connect/disconnect", "WhatsApp/Telegram por gateway"],
      },
      {
        title: "Mark XLVI",
        items: ["URL LAN con token, sin puertos externos por defecto", "Movil como control remoto", "Subida de archivos", "Microfono remoto"],
      },
      {
        title: "Despues",
        items: ["Mark-XLVI como referencia de flujo", "Futuros conectores", "VPS/VPN solo con decision explicita"],
      },
    ],
  },
  radar: {
    id: "radar",
    title: "Radar",
    eyebrow: "Investigacion semanal",
    route: "/radar",
    summary:
      "Cron de vigilancia para encontrar mejoras de Hermes Agent, mente 2, Jarvis y automatizaciones utiles.",
    metrics: [
      { label: "Frecuencia", value: "Domingo", tone: "gold" },
      { label: "Job", value: "Radar", tone: "gold" },
      { label: "Fallback", value: "Llama 3.1 8B", tone: "gold" },
      { label: "Salida", value: "Contexto/Radar", tone: "gold" },
    ],
    panels: [
      {
        title: "Cron propuesto",
        items: ["Cada domingo por la tarde", "OpenAI principal investiga mejoras", "Llama 3.1 8B revisa respaldo local", "Guarda hallazgos en Contexto/Radar"],
      },
      {
        title: "Estado",
        items: ["Job Radar", "Proxima ejecucion", "Ultima salida", "Abrir Contexto/Radar"],
      },
    ],
  },
  panteon: {
    id: "panteon",
    title: "Panteón",
    eyebrow: "Perfiles de dioses",
    route: "/panteon",
    summary:
      "Los perfiles dejan de ser genericos: cada perfil es un dios con imagen, modelo, prompt y funcion.",
    metrics: [
      { label: "Dioses", value: String(PANTHEON_AGENTS.length), tone: "gold" },
      { label: "Imagenes", value: "8", tone: "gold" },
      { label: "Prompts", value: "8", tone: "gold" },
      { label: "Ruta", value: "Chat", tone: "gold" },
    ],
    panels: [
      {
        title: "Dioses",
        items: PANTHEON_AGENTS.map((agent) => `${agent.name}: ${agent.role} / ${agent.model}`),
      },
      {
        title: "Olimpo Chat",
        items: ["Abrir perfil carga dios", "Prompt y rol preparados", "Fallback local real si el modelo principal no esta"],
      },
    ],
  },
  keys: {
    id: "keys",
    title: "Keys",
    eyebrow: "Credenciales",
    route: "/env",
    summary:
      "Llaves y variables con carga estable. Preparado para .env sin parpadeo constante ni secretos visibles.",
    metrics: [
      { label: "OpenAI", value: "Activo", tone: "gold" },
      { label: ".env", value: "Soporte", tone: "gold" },
      { label: "Tokens", value: "Ocultos", tone: "gold" },
      { label: "Carga", value: "Estable", tone: "gold" },
    ],
    panels: [
      {
        title: "Reglas",
        items: ["No mostrar secretos", "Guardar estable", "Explicar que falta"],
      },
      {
        title: "Conexiones futuras",
        items: ["GitHub", "Google OAuth", "Sentry", "Claude"],
      },
    ],
  },
  sistema: {
    id: "sistema",
    title: "Sistema",
    eyebrow: "Nucleo local",
    route: "/system",
    summary:
      "Sistema y configuracion juntos: salud, version, gateway, permisos y recursos base de Olimpo OS.",
    metrics: [
      { label: "Hermes", value: "Base", tone: "gold" },
      { label: "Olimpo", value: "Shell", tone: "gold" },
      { label: "Config", value: "Dentro", tone: "gold" },
      { label: "Bienvenida", value: "Repetir", tone: "gold" },
    ],
    panels: [
      {
        title: "Sistema",
        items: ["Version", "Gateway", "Permisos", "Configuracion", "Mostrar bienvenida otra vez"],
      },
      {
        title: "Limpieza visual",
        items: ["Sin documentacion suelta", "Sin restart/reset prominente", "Marca Oriol Roca"],
      },
    ],
  },
};

export function getOlimpoModule(id: OlimpoModuleId): OlimpoModule {
  return modules[id];
}

export function getPantheonChatPreset(agentId: string): PantheonChatPreset | null {
  const agent = PANTHEON_AGENTS.find((candidate) => candidate.id === agentId);
  if (!agent) return null;

  return {
    agentId: agent.id,
    agentName: agent.name,
    role: agent.role,
    provider: agent.provider,
    model: agent.model,
    modelSwitchCommand: `/model ${agent.model} --provider ${agent.provider} --tui-session`,
    prompt: agent.prompt,
    commandDraft: `[${agent.name} / ${agent.role} / ${agent.model}] ${agent.prompt}\n\n`,
  };
}

export function toggleOlimpoMobileConnection(state: OlimpoState): OlimpoState {
  return {
    ...state,
    mobileConnected: !state.mobileConnected,
    channels: state.mobileConnected ? [] : ["WhatsApp", "Telegram"],
  };
}

export function setOlimpoCodexSpend(
  state: OlimpoState,
  codexSpend: string,
): OlimpoState {
  return {
    ...state,
    codexSpend,
  };
}

export function setOlimpoMonthlyBudget(
  state: OlimpoState,
  monthlyBudget: string,
): OlimpoState {
  return {
    ...state,
    monthlyBudget,
  };
}

export function addOlimpoRoutine(
  state: OlimpoState,
  routine: string,
): OlimpoState {
  const trimmed = routine.trim();
  if (!trimmed || state.routines.includes(trimmed)) return state;

  return {
    ...state,
    routines: [...state.routines, trimmed],
  };
}

export function assignOlimpoEmissary(
  state: OlimpoState,
  agentId: string,
  mission: string,
): OlimpoState {
  return {
    ...state,
    emissaryAssignments: [
      ...state.emissaryAssignments,
      {
        agentId,
        mission,
      },
    ],
  };
}

export function sendOlimpoCommand(
  state: OlimpoState,
  agent: PantheonAgent,
  command: string,
): OlimpoState {
  const trimmed = command.trim();
  if (!trimmed) return state;

  const entry = {
    id: `${Date.now()}-${agent.id}-${state.commandLog.length}`,
    agentId: agent.id,
    agentName: agent.name,
    model: agent.model,
    command: trimmed,
    appliedPrompt: agent.prompt,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    commandLog: [entry, ...state.commandLog].slice(0, 12),
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isAssignmentArray(
  value: unknown,
): value is OlimpoState["emissaryAssignments"] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { agentId?: unknown }).agentId === "string" &&
        typeof (item as { mission?: unknown }).mission === "string",
    )
  );
}

function isCommandLogArray(value: unknown): value is OlimpoState["commandLog"] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { id?: unknown }).id === "string" &&
        typeof (item as { agentId?: unknown }).agentId === "string" &&
        typeof (item as { agentName?: unknown }).agentName === "string" &&
        typeof (item as { model?: unknown }).model === "string" &&
        typeof (item as { command?: unknown }).command === "string" &&
        typeof (item as { appliedPrompt?: unknown }).appliedPrompt === "string" &&
        typeof (item as { createdAt?: unknown }).createdAt === "string",
    )
  );
}

export function serializeOlimpoState(state: OlimpoState): string {
  return JSON.stringify({
    version: OLIMPO_STATE_VERSION,
    state,
  });
}

export function deserializeOlimpoState(raw: string | null): OlimpoState {
  if (!raw) return DEFAULT_OLIMPO_STATE;

  try {
    const parsed = JSON.parse(raw) as {
      version?: unknown;
      state?: Partial<OlimpoState>;
    };
    if (parsed.version !== OLIMPO_STATE_VERSION || !parsed.state) {
      return DEFAULT_OLIMPO_STATE;
    }

    const state = parsed.state;
    return {
      mobileConnected:
        typeof state.mobileConnected === "boolean"
          ? state.mobileConnected
          : DEFAULT_OLIMPO_STATE.mobileConnected,
      channels: isStringArray(state.channels)
        ? state.channels
        : DEFAULT_OLIMPO_STATE.channels,
      codexSpend:
        typeof state.codexSpend === "string"
          ? state.codexSpend
          : DEFAULT_OLIMPO_STATE.codexSpend,
      monthlyBudget:
        typeof state.monthlyBudget === "string"
          ? state.monthlyBudget
          : DEFAULT_OLIMPO_STATE.monthlyBudget,
      routines: isStringArray(state.routines)
        ? state.routines
        : DEFAULT_OLIMPO_STATE.routines,
      emissaryAssignments: isAssignmentArray(state.emissaryAssignments)
        ? state.emissaryAssignments
        : DEFAULT_OLIMPO_STATE.emissaryAssignments,
      commandLog: isCommandLogArray(state.commandLog)
        ? state.commandLog
        : DEFAULT_OLIMPO_STATE.commandLog,
    };
  } catch {
    return DEFAULT_OLIMPO_STATE;
  }
}

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  Crown,
  Database,
  FileText,
  KeyRound,
  MessageCircle,
  Mic,
  Package,
  Radar,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@nous-research/ui/ui/components/button";
import {
  DEFAULT_OLIMPO_STATE,
  OLIMPO_NAV,
  OLIMPO_WELCOME_STORAGE_KEY,
  PANTHEON_AGENTS,
  deserializeOlimpoState,
  getOlimpoModule,
  sendOlimpoCommand,
  serializeOlimpoState,
  welcomeCopy,
  type OlimpoMetric,
  type OlimpoModuleId,
} from "@/lib/olimpo";
import { cn } from "@/lib/utils";

const moduleIcons: Record<OlimpoModuleId, LucideIcon> = {
  inicio: Crown,
  chat: MessageCircle,
  contexto: Database,
  modelos: Terminal,
  errores: FileText,
  cron: CalendarDays,
  skills: Package,
  voice: Mic,
  pairing: ShieldCheck,
  radar: Radar,
  panteon: Crown,
  keys: KeyRound,
  sistema: Wrench,
};

const toneClass: Record<OlimpoMetric["tone"], string> = {
  gold: "border-border bg-card text-foreground",
  green: "border-border bg-card text-foreground",
  amber: "border-border bg-card text-foreground",
  red: "border-border bg-card text-foreground",
};

const OLIMPO_STATE_STORAGE_KEY = "olimpo-os-state";

function formatOlimpoDate() {
  const now = new Date();
  const month = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(now);
  const week = Math.ceil(now.getDate() / 7);
  const quarter = Math.floor(now.getMonth() / 3) + 1;

  return {
    day: new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(now),
    week: `Semana ${week}`,
    month,
    quarter: `Trimestre ${quarter}`,
    year: String(now.getFullYear()),
  };
}

export default function OlimpoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [welcomeLeaving, setWelcomeLeaving] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const initialModuleFromPath = (): OlimpoModuleId => {
    if (location.pathname === "/radar") return "radar";
    if (location.pathname === "/panteon") return "panteon";
    return "inicio";
  };
  const [selectedModuleId, setSelectedModuleId] = useState<OlimpoModuleId>(initialModuleFromPath);
  const [selectedGod, setSelectedGod] = useState(PANTHEON_AGENTS[0]);
  const [olimpoState, setOlimpoState] = useState(() => {
    try {
      return deserializeOlimpoState(localStorage.getItem(OLIMPO_STATE_STORAGE_KEY));
    } catch {
      return DEFAULT_OLIMPO_STATE;
    }
  });
  const [commandDraft, setCommandDraft] = useState("Organiza las prioridades de hoy");
  const selectedModule = getOlimpoModule(selectedModuleId);
  const SelectedIcon = moduleIcons[selectedModuleId];
  const calendar = useMemo(() => formatOlimpoDate(), []);
  const focusOnly = selectedModuleId === "panteon" || selectedModuleId === "radar";

  useEffect(() => {
    setSelectedModuleId(initialModuleFromPath());
  }, [location.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(
        OLIMPO_STATE_STORAGE_KEY,
        serializeOlimpoState(olimpoState),
      );
    } catch {
      // Persistencia opcional: el panel sigue funcionando aunque storage falle.
    }
  }, [olimpoState]);

  if (!welcomeDismissed && location.pathname === "/olimpo") {
    return (
      <main className={cn("olimpo-shell olimpo-welcome", welcomeLeaving && "olimpo-welcome-exiting")} aria-label="Bienvenida Olimpo">
        <div className="olimpo-sky" />
        <section className="olimpo-gate" aria-labelledby="olimpo-welcome-title">
          <div className="olimpo-welcome-panel">
            <h1 id="olimpo-welcome-title">{welcomeCopy.title}</h1>
            <h2>{welcomeCopy.recipient}</h2>
            <Button
              onClick={() => {
                setWelcomeLeaving(true);
                window.setTimeout(() => {
                  setWelcomeDismissed(true);
                  setWelcomeLeaving(false);
                }, 520);
              }}
              className="olimpo-primary-button"
            >
              {welcomeCopy.action}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="olimpo-shell" aria-label="Olimpo OS">
      <div className="olimpo-sky" />
      <div className="olimpo-layout olimpo-layout-hub">
        <section className="olimpo-stage">
          {!focusOnly && (
          <header className="olimpo-header">
            <div>
              <p className="olimpo-kicker">Olimpo OS</p>
              <h1>Panel de mando</h1>
            </div>
            <div className="olimpo-orb" aria-hidden>
              <Crown className="h-8 w-8" />
            </div>
          </header>
          )}

          {!focusOnly && (
          <section className="olimpo-module-grid" aria-label="Secciones principales Olimpo">
            {OLIMPO_NAV.map((item) => {
              const module = getOlimpoModule(item.id);
              const ModuleIcon = moduleIcons[item.id];
              const isSelected = selectedModuleId === item.id;
              return (
                <article
                  key={item.id}
                  className={cn("olimpo-module-card", isSelected && "is-selected")}
                >
                  <button type="button" onClick={() => setSelectedModuleId(item.id)}>
                    <ModuleIcon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                  <p>{module.summary}</p>
                  <button
                    type="button"
                    className="olimpo-card-action"
                    onClick={() => navigate(module.route)}
                  >
                    Abrir en Olimpo
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              );
            })}
          </section>
          )}

          {selectedModuleId !== "inicio" && !focusOnly && (
          <section className="olimpo-selected-module" aria-label="Modulo seleccionado">
            <div className="olimpo-selected-copy">
              <p className="olimpo-kicker">{selectedModule.eyebrow}</p>
              <h2>{selectedModule.title}</h2>
              <p>{selectedModule.summary}</p>
            </div>
            <div className="olimpo-selected-icon" aria-hidden>
              <SelectedIcon className="h-7 w-7" />
            </div>
          </section>
          )}

          {selectedModule.metrics.length > 0 && !focusOnly && (
            <div className="olimpo-metrics" aria-label="Metricas principales">
              {selectedModule.metrics.map((metric) => (
                <button
                  key={metric.label}
                  type="button"
                  className={cn("olimpo-metric", toneClass[metric.tone])}
                >
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </button>
              ))}
            </div>
          )}

          {selectedModuleId === "chat" && (
            <form
              className="olimpo-command"
              onSubmit={(event) => {
                event.preventDefault();
                setOlimpoState((state) =>
                  sendOlimpoCommand(state, selectedGod, commandDraft),
                );
                setCommandDraft("");
                setSelectedModuleId("contexto");
              }}
            >
              <div className="olimpo-command-ring" aria-hidden>
                <Sparkles className="h-10 w-10" />
              </div>
              <div className="olimpo-command-copy">
                <p className="olimpo-kicker">Olimpo Chat</p>
                <h2>{selectedGod.name} aplicado</h2>
                  <p>{selectedGod.prompt}</p>
                  <div className="olimpo-chat-box">
                    <span>{selectedGod.model}</span>
                    <input
                    value={commandDraft}
                    onChange={(event) => setCommandDraft(event.target.value)}
                    placeholder={`Orden para ${selectedGod.name}`}
                  />
                  <button type="submit">
                    Enviar
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </form>
          )}

          {selectedModuleId !== "panteon" && selectedModuleId !== "radar" && (
            <div className="olimpo-panel-grid">
              {selectedModule.panels.map((panel) => (
                <section key={panel.title} className="olimpo-panel">
                  <h3>{panel.title}</h3>
                  <ul>
                    {panel.items.map((item) => (
                      <li key={item}>
                        <ShieldCheck className="h-4 w-4" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              {selectedModuleId === "sistema" && (
                <section className="olimpo-panel">
                  <h3>Bienvenida</h3>
                  <p>Accion secundaria para volver a ver la entrada full-screen tras esta iteracion.</p>
                  <button
                    type="button"
                    className="olimpo-card-action"
                    onClick={() => {
                      try {
                        localStorage.removeItem(OLIMPO_WELCOME_STORAGE_KEY);
                      } catch {
                        // LocalStorage es opcional para esta accion visual.
                      }
                      setWelcomeLeaving(false);
                      setWelcomeDismissed(false);
                      navigate("/olimpo");
                    }}
                  >
                    Mostrar bienvenida otra vez
                  </button>
                </section>
              )}
            </div>
          )}

          {selectedModuleId === "panteon" && (
          <section className="olimpo-pantheon" aria-label="Panteon de perfiles">
            <div className="olimpo-gods">
              {PANTHEON_AGENTS.map((god) => (
                <article
                  key={god.id}
                  className={cn("olimpo-god", selectedGod.id === god.id && "is-selected")}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGod(god);
                      setSelectedModuleId("panteon");
                    }}
                  >
                    <img src={god.image} alt={god.name} loading="lazy" />
                    <span className="olimpo-god-seal">{god.seal}</span>
                    <strong>{god.name}</strong>
                    <small>{god.role}</small>
                    <em>{god.model}</em>
                    <p>{god.duty}</p>
                  </button>
                  <button
                    type="button"
                    className="olimpo-card-action"
                    onClick={() => navigate(god.profileRoute)}
                  >
                    Abrir perfil
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              ))}
            </div>
          </section>
          )}

          {selectedModuleId === "radar" && (
            <section className="olimpo-time-card olimpo-radar-focus">
              <p className="olimpo-kicker">Radar</p>
              <h2>Radar</h2>
              <dl>
                <div><dt>Dia</dt><dd>{calendar.day}</dd></div>
                <div><dt>Semana</dt><dd>{calendar.week}</dd></div>
                <div><dt>Proxima</dt><dd>Domingo por la tarde</dd></div>
                <div><dt>Salida</dt><dd>Contexto/Radar</dd></div>
                <div><dt>Cambios</dt><dd>Añadir hallazgos; quitar solo con permiso</dd></div>
              </dl>
            </section>
          )}

          {selectedModuleId === "contexto" && (
            <section className="olimpo-command-log" aria-label="Memoria de ordenes Olimpo">
            <div className="olimpo-section-heading">
              <p className="olimpo-kicker">Contexto</p>
              <h2>Ordenes enviadas al panteon</h2>
            </div>
            <div className="olimpo-log-list">
              {(olimpoState.commandLog.length
                ? olimpoState.commandLog
                : [{
                    id: "empty",
                    agentName: "Olimpo",
                    model: "Esperando orden",
                    command: "Aun no hay conversaciones guardadas.",
                    appliedPrompt: "Selecciona un dios, escribe una orden y quedara archivada aqui.",
                    createdAt: "",
                  }]
              ).map((entry) => (
                <article key={entry.id} className="olimpo-log-entry">
                  <div>
                    <strong>{entry.agentName}</strong>
                    <small>{entry.model}</small>
                  </div>
                  <p>{entry.command}</p>
                  <span>{entry.appliedPrompt}</span>
                </article>
              ))}
            </div>
          </section>
          )}
        </section>
      </div>
    </main>
  );
}

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BrainCircuit,
  Headphones,
  MessageSquare,
  Mic,
  Play,
  RefreshCw,
  Volume2,
} from "lucide-react";
import { Button } from "@nous-research/ui/ui/components/button";
import { api, type VoiceStatusResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

function StatePill({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={cn("voice-pill", active && "is-active")}>
      {label}
    </span>
  );
}

export default function VoicePage() {
  const [status, setStatus] = useState<VoiceStatusResponse | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [nextStatus, nextLogs] = await Promise.all([
        api.getVoiceStatus(),
        api.getVoiceLogs().catch(() => []),
      ]);
      setStatus(nextStatus);
      setLogs(nextLogs.slice(-12).reverse());
      setError("");
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "VoiceOS no esta disponible.");
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 2500);
    return () => window.clearInterval(id);
  }, [refresh]);

  async function run(action: () => Promise<Record<string, unknown>>) {
    setBusy(true);
    try {
      await action();
      await refresh();
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "Accion VOICE fallida.");
    } finally {
      setBusy(false);
    }
  }

  const latestText = status?.latest?.text || "Sin transcripcion todavia.";
  const tts = status?.tts;
  const conversation = status?.conversation;
  const accessModules = conversation?.access_modules ?? [];
  const pantheon = conversation?.pantheon ?? [];

  return (
    <main className="voice-page" aria-label="VOICE">
      <section className="voice-hero">
        <div>
          <p className="olimpo-kicker">Olimpo OS</p>
          <h1>VOICE</h1>
          <p>
            Dictado local con Whisper y conversacion por voz con Olimpo desde
            el mismo panel.
          </p>
        </div>
        <div className="voice-hero-status" aria-label="Estado principal">
          <Mic className="h-7 w-7" />
          <strong>{status?.daemon ? "VoiceOS activo" : "Esperando VoiceOS"}</strong>
          <span>{status?.message || error || "Consultando estado local..."}</span>
        </div>
      </section>

      <section className="voice-toolbar" aria-label="Controles VOICE">
        <Button onClick={() => run(api.toggleVoiceRecord)} disabled={busy}>
          <Mic className="h-4 w-4" />
          Dictado
        </Button>
        <Button onClick={() => run(api.toggleVoiceChat)} disabled={busy}>
          <MessageSquare className="h-4 w-4" />
          Conversacion
        </Button>
        <Button onClick={() => run(api.testVoiceTts)} disabled={busy}>
          <Volume2 className="h-4 w-4" />
          Probar TTS
        </Button>
        <Button ghost onClick={refresh} disabled={busy}>
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </section>

      {error && <div className="voice-error">{error}</div>}

      <section className="voice-grid">
        <article className="voice-panel">
          <div className="voice-panel-title">
            <Activity className="h-4 w-4" />
            <h2>Estado</h2>
          </div>
          <div className="voice-pill-row">
            <StatePill active={Boolean(status?.whisper)} label="Whisper" />
            <StatePill active={Boolean(status?.recording)} label="Dictando" />
            <StatePill active={Boolean(status?.chat_recording)} label="Conversando" />
            <StatePill active={Boolean(status?.processing)} label="Procesando" />
          </div>
          <dl className="voice-facts">
            <div><dt>Dictado</dt><dd>{status?.hotkeys?.dictation || "Ctrl+Alt+X"}</dd></div>
            <div><dt>Conversacion</dt><dd>{status?.hotkeys?.chat || "Ctrl+Alt+Space"}</dd></div>
            <div><dt>Injector</dt><dd>{status?.xdotool || "No detectado"}</dd></div>
          </dl>
        </article>

        <article className="voice-panel">
          <div className="voice-panel-title">
            <Headphones className="h-4 w-4" />
            <h2>Voz</h2>
          </div>
          <dl className="voice-facts">
            <div><dt>TTS activo</dt><dd>{tts?.engine || "local"}</dd></div>
            <div><dt>Local</dt><dd>{tts?.local_engine || "espeak/piper"}</dd></div>
            <div><dt>ElevenLabs</dt><dd>{status?.elevenlabs_configured || tts?.elevenlabs_configured ? "Configurado" : "No configurado"}</dd></div>
          </dl>
        </article>

        <article className="voice-panel voice-wide">
          <div className="voice-panel-title">
            <BrainCircuit className="h-4 w-4" />
            <h2>Router Olimpo</h2>
          </div>
          <dl className="voice-facts voice-facts-wide">
            <div><dt>Contexto</dt><dd>{conversation?.context_router || "Clasifica modulo, dios y modelo antes de responder."}</dd></div>
            <div><dt>Comando</dt><dd>{conversation?.deep_trigger || "Contéstame con pensamiento profundo"}</dd></div>
            <div><dt>Normal</dt><dd>{conversation?.model || "llama3.1:8b"}</dd></div>
            <div><dt>Profundo</dt><dd>{conversation?.deep_model || "huihui_ai/deepseek-r1-abliterated:8b"} + {conversation?.model || "llama3.1:8b"}</dd></div>
            <div><dt>Permisos</dt><dd>{conversation?.permissions || "Puede preparar acciones del OS; no borra ni destruye sin confirmacion humana."}</dd></div>
            <div><dt>Acceso</dt><dd>{accessModules.length ? accessModules.join(" · ") : "Inicio · Chat · Contexto · Panteon · Sistema"}</dd></div>
            <div><dt>Panteón</dt><dd>{pantheon.length ? pantheon.map((agent) => `${agent.name} ${agent.model}`).join(" · ") : "Zeus · Hera · Poseidon · Atenea · Apolo · Artemisa · Ares · Afrodita"}</dd></div>
          </dl>
        </article>

        <article className="voice-panel voice-wide">
          <div className="voice-panel-title">
            <Play className="h-4 w-4" />
            <h2>Ultima transcripcion</h2>
          </div>
          <p className="voice-transcript">{latestText}</p>
        </article>

        <article className="voice-panel voice-wide">
          <div className="voice-panel-title">
            <Activity className="h-4 w-4" />
            <h2>Logs</h2>
          </div>
          <div className="voice-log-list">
            {(logs.length ? logs : ["Sin logs recientes."]).map((line, index) => (
              <code key={`${index}-${line}`}>{line}</code>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

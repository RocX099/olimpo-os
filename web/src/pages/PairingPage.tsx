import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Bug,
  CalendarDays,
  Check,
  KeyRound,
  Mic,
  QrCode,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@nous-research/ui/ui/components/badge";
import { Button } from "@nous-research/ui/ui/components/button";
import { Spinner } from "@nous-research/ui/ui/components/spinner";
import { H2 } from "@nous-research/ui/ui/components/typography/h2";
import { api } from "@/lib/api";
import type { PairingResponse, PairingUser } from "@/lib/api";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { useToast } from "@nous-research/ui/hooks/use-toast";
import { useConfirmDelete } from "@nous-research/ui/hooks/use-confirm-delete";
import { Toast } from "@nous-research/ui/ui/components/toast";
import { Card, CardContent } from "@nous-research/ui/ui/components/card";
import { usePageHeader } from "@/contexts/usePageHeader";

const CONNECTOR_CARDS: Array<{
  title: string;
  icon: LucideIcon;
  status: string;
  body: string;
}> = [
  {
    title: "Mobile / QR",
    icon: QrCode,
    status: "LAN primero",
    body: "QR con URL LAN y clave temporal. No abre puertos externos por defecto.",
  },
  {
    title: "Google Calendar",
    icon: CalendarDays,
    status: "Conector",
    body: "Preparado para connect/disconnect desde el flujo de proveedores existente.",
  },
  {
    title: "Sentry",
    icon: Bug,
    status: "Observabilidad",
    body: "Concentrado aqui como conector, con errores visibles en Errores/Logs.",
  },
  {
    title: "WhatsApp / Telegram",
    icon: Send,
    status: "Gateway",
    body: "Mantiene la cola pending/approved/revoke actual para controlar acceso.",
  },
  {
    title: "Mark-XLVI",
    icon: Smartphone,
    status: "Referencia segura",
    body: "Movil como control remoto con token temporal; VPS/VPN solo si se decide despues.",
  },
  {
    title: "Archivos y microfono",
    icon: Upload,
    status: "Futuro local",
    body: "Subida de archivos y microfono remoto sobre LAN antes de exponer nada fuera.",
  },
];

function getUserKey(user: PairingUser): string {
  return `${user.platform}:${user.user_id}`;
}

function splitUserKey(key: string): { platform: string; user_id: string } {
  const idx = key.indexOf(":");
  if (idx === -1) return { platform: "", user_id: key };
  return { platform: key.slice(0, idx), user_id: key.slice(idx + 1) };
}

function getUserLabel(user: PairingUser): string {
  return user.user_name || user.user_id;
}

export default function PairingPage() {
  const [pending, setPending] = useState<PairingUser[]>([]);
  const [approved, setApproved] = useState<PairingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [mobileToken, setMobileToken] = useState(() => crypto.randomUUID());
  const [mobileQrDataUrl, setMobileQrDataUrl] = useState<string | null>(null);
  const { toast, showToast } = useToast();
  const { setEnd } = usePageHeader();
  const mobilePairingUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL("/pairing/mobile", window.location.origin);
    url.searchParams.set("token", mobileToken);
    return url.toString();
  }, [mobileToken]);

  const loadPairing = useCallback(() => {
    api
      .getPairing()
      .then((res: PairingResponse) => {
        setPending(res.pending);
        setApproved(res.approved);
      })
      .catch(() => showToast("Failed to load pairing requests", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    loadPairing();
  }, [loadPairing]);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(mobilePairingUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
    })
      .then((dataUrl) => {
        if (!cancelled) setMobileQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setMobileQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [mobilePairingUrl]);

  const handleApprove = async (user: PairingUser) => {
    if (!user.code) {
      showToast("Missing pairing code", "error");
      return;
    }
    const key = getUserKey(user);
    setApproving(key);
    try {
      await api.approvePairing(user.platform, user.code);
      showToast(`Approved: "${getUserLabel(user)}"`, "success");
      loadPairing();
    } catch (e) {
      showToast(`Error: ${e}`, "error");
    } finally {
      setApproving(null);
    }
  };

  const handleClearPending = async () => {
    if (!window.confirm("Clear all pending pairing requests?")) return;
    setClearing(true);
    try {
      const res = await api.clearPendingPairing();
      showToast(`Cleared ${res.cleared} pending request(s)`, "success");
      loadPairing();
    } catch (e) {
      showToast(`Error: ${e}`, "error");
    } finally {
      setClearing(false);
    }
  };

  const userRevoke = useConfirmDelete({
    onDelete: useCallback(
      async (key: string) => {
        const { platform, user_id } = splitUserKey(key);
        const user = approved.find((u) => getUserKey(u) === key);
        try {
          await api.revokePairing(platform, user_id);
          showToast(
            `Revoked: "${user ? getUserLabel(user) : user_id}"`,
            "success",
          );
          loadPairing();
        } catch (e) {
          showToast(`Error: ${e}`, "error");
          throw e;
        }
      },
      [approved, loadPairing, showToast],
    ),
  });

  // Put "Clear pending" button in page header
  useLayoutEffect(() => {
    setEnd(
      <Button
        className="uppercase"
        size="sm"
        onClick={handleClearPending}
        disabled={clearing}
        prefix={clearing ? <Spinner /> : <Trash2 className="h-4 w-4" />}
      >
        Clear pending
      </Button>,
    );
    return () => {
      setEnd(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setEnd, clearing]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="text-2xl text-primary" />
      </div>
    );
  }

  const pendingRevokeUser = userRevoke.pendingId
    ? approved.find((u) => getUserKey(u) === userRevoke.pendingId)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <Toast toast={toast} />

      <DeleteConfirmDialog
        open={userRevoke.isOpen}
        onCancel={userRevoke.cancel}
        onConfirm={userRevoke.confirm}
        title="Revoke access"
        description={
          pendingRevokeUser
            ? `"${getUserLabel(pendingRevokeUser)}" will lose access. This cannot be undone.`
            : "This user will lose access. This cannot be undone."
        }
        confirmLabel="Revoke"
        loading={userRevoke.isDeleting}
      />

      <div className="flex flex-col gap-3">
        <H2
          variant="sm"
          className="flex items-center gap-2 text-muted-foreground"
        >
          <KeyRound className="h-4 w-4" />
          Connectors and Mark-XLVI
        </H2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {CONNECTOR_CARDS.map((connector) => {
            const Icon = connector.icon;
            return (
              <Card key={connector.title}>
                <CardContent className="space-y-3 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate text-sm font-medium">
                        {connector.title}
                      </span>
                    </div>
                    <Badge tone="outline">{connector.status}</Badge>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {connector.body}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card>
          <CardContent className="grid gap-4 py-4 md:grid-cols-[auto_minmax(0,1fr)]">
            <div className="flex min-h-[220px] min-w-[220px] items-center justify-center border border-border bg-background/40 p-2">
              {mobileQrDataUrl ? (
                <img
                  src={mobileQrDataUrl}
                  alt="Mobile pairing QR"
                  className="h-[220px] w-[220px]"
                />
              ) : (
                <Spinner />
              )}
            </div>
            <div className="flex min-w-0 flex-col justify-center gap-3 text-xs text-muted-foreground">
              <div>
                <div className="mb-1 font-semibold uppercase tracking-[0.08em] text-foreground">
                  Mobile QR temporal
                </div>
                <div className="font-mono [overflow-wrap:anywhere]">
                  {mobilePairingUrl}
                </div>
              </div>
              <span>
                Seguridad: token temporal, allowlist y LAN/local antes de cualquier relay externo.
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Mic className="h-3.5 w-3.5" />
                Microfono remoto preparado como siguiente paso
              </span>
              <Button
                size="sm"
                outlined
                className="w-fit uppercase"
                prefix={<RefreshCw className="h-4 w-4" />}
                onClick={() => setMobileToken(crypto.randomUUID())}
              >
                Regenerar QR
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending requests */}
      <div className="flex flex-col gap-3">
        <H2
          variant="sm"
          className="flex items-center gap-2 text-muted-foreground"
        >
          <Users className="h-4 w-4" />
          Pending requests ({pending.length})
        </H2>

        {pending.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No pending pairing requests
            </CardContent>
          </Card>
        )}

        {pending.map((user) => {
          const key = getUserKey(user);
          return (
            <Card key={key}>
              <CardContent className="flex items-start gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge tone="outline">{user.platform}</Badge>
                    {user.code && (
                      <span className="font-mono text-sm">{user.code}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="truncate">{user.user_id}</span>
                    {user.user_name && (
                      <span className="truncate">{user.user_name}</span>
                    )}
                    {typeof user.age_minutes === "number" && (
                      <span>{user.age_minutes}m ago</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    className="uppercase"
                    onClick={() => handleApprove(user)}
                    disabled={approving === key || !user.code}
                    prefix={
                      approving === key ? (
                        <Spinner />
                      ) : (
                        <Check className="h-4 w-4" />
                      )
                    }
                  >
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Approved users */}
      <div className="flex flex-col gap-3">
        <H2
          variant="sm"
          className="flex items-center gap-2 text-muted-foreground"
        >
          <ShieldCheck className="h-4 w-4" />
          Approved users ({approved.length})
        </H2>

        {approved.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No approved users
            </CardContent>
          </Card>
        )}

        {approved.map((user) => {
          const key = getUserKey(user);
          return (
            <Card key={key}>
              <CardContent className="flex items-start gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge tone="outline">{user.platform}</Badge>
                    <span className="font-medium text-sm truncate">
                      {user.user_id}
                    </span>
                  </div>
                  {user.user_name && (
                    <div className="text-xs text-muted-foreground truncate">
                      {user.user_name}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    ghost
                    size="icon"
                    title="Revoke"
                    aria-label="Revoke"
                    className="text-destructive"
                    onClick={() => userRevoke.requestDelete(key)}
                  >
                    <X />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

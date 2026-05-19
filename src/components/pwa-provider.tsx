"use client";

import { useEffect, useMemo, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const INSTALL_BANNER_DISMISS_KEY = "tes-stone-install-banner-dismissed-at";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 18;

function isDismissedRecently() {
  if (typeof window === "undefined") {
    return false;
  }

  const raw = window.localStorage.getItem(INSTALL_BANNER_DISMISS_KEY);
  if (!raw) {
    return false;
  }

  const timestamp = Number(raw);
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return Date.now() - timestamp < DISMISS_TTL_MS;
}

function detectStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

function detectIos() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function PwaProvider() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => detectStandalone());
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== "undefined" ? !navigator.onLine : false));
  const [message, setMessage] = useState<string | null>(null);
  const [isIos] = useState(() => detectIos());
  const [bannerCollapsed, setBannerCollapsed] = useState(() => isDismissedRecently());

  useEffect(() => {
    const onOnline = () => {
      setIsOffline(false);
      setMessage("Connexion revenue.");
    };

    const onOffline = () => {
      setIsOffline(true);
      setMessage("Mode hors ligne actif pour l’interface déjà chargée.");
    };

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
      setBannerCollapsed(true);
      setMessage("App installée ✨");
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        setMessage("Le mode hors ligne n’a pas pu être activé sur ce navigateur.");
      });
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setMessage(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [message]);

  function dismissBanner() {
    setBannerCollapsed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(INSTALL_BANNER_DISMISS_KEY, String(Date.now()));
    }
  }

  async function onInstall() {
    if (!installEvent) {
      if (isIos) {
        setMessage("Sur iPhone, touche Partager puis ‘Sur l’écran d’accueil’.");
      } else {
        setMessage("Ajoute l’app depuis le menu de ton navigateur si le bouton système n’apparaît pas.");
      }
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstallEvent(null);
      setMessage("Installation lancée ✨");
    }
  }

  const showInstallBanner = useMemo(() => !isInstalled, [isInstalled]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="flex w-full max-w-md flex-col items-center gap-2">
        {message ? (
          <div className="rounded-full bg-zinc-950 px-4 py-2 text-center text-xs font-semibold text-white shadow-xl">
            {message}
          </div>
        ) : null}

        {showInstallBanner && bannerCollapsed ? (
          <button
            type="button"
            onClick={() => setBannerCollapsed(false)}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 py-3 text-sm font-semibold text-zinc-800 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur transition hover:bg-white"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-zinc-950 text-base text-white">📲</span>
            Installer pour ton stonomètre quotidien
          </button>
        ) : null}

        {showInstallBanner && !bannerCollapsed ? (
          <div className="pointer-events-auto w-full rounded-[1.6rem] border border-white/70 bg-white/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-lg text-white">📲</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-zinc-950">Installe l’app pour ton stonomètre quotidien</p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Garde ton historique, ouvre T&apos;es stone ? en un tap, et récupère ta carte comme une vraie app sur ton écran d’accueil.
                </p>
              </div>
              <button
                type="button"
                onClick={dismissBanner}
                className="inline-flex size-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-semibold text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700"
                aria-label="Fermer le bandeau d’installation"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void onInstall();
                }}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Installer l’app
              </button>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                {isOffline ? "Offline prêt" : isIos ? "iPhone ok" : "PWA prête"}
              </div>
            </div>

            {isIos && !installEvent ? (
              <p className="mt-3 text-[11px] leading-5 text-zinc-500">
                Sur iPhone, le bouton système n’apparaît pas toujours. Passe par <span className="font-semibold text-zinc-700">Partager</span> puis <span className="font-semibold text-zinc-700">Sur l’écran d’accueil</span>.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy | T'es stone ?",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <Link href="/" className="text-sm font-semibold text-zinc-500 underline underline-offset-4">← Retour</Link>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950">Privacy</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-600 sm:text-base">
          <p>
            T&apos;es stone ? est une application de divertissement. Les photos sont utilisées uniquement pour produire
            un verdict humoristique de vibe planante apparente.
          </p>
          <ul className="space-y-3">
            <li>• Les photos sont envoyées uniquement à l’endpoint d’analyse pour traiter la demande en cours.</li>
            <li>• Les photos ne sont pas stockées par l’application après l’analyse.</li>
            <li>• L’application n’identifie pas la personne photographiée.</li>
            <li>• L’application ne déduit ni âge, ni genre, ni origine, ni état de santé, ni identité.</li>
            <li>• L’application ne détecte aucune substance réelle et ne doit jamais servir à une décision sérieuse.</li>
            <li>• Si le moteur IA n’est pas disponible, un mode estimation planante peut être utilisé pour garder l’expérience fluide.</li>
          </ul>
          <p>
            Si tu n’acceptes pas ce fonctionnement, n’utilise pas l’application avec une photo réelle.
          </p>
        </div>
      </div>
    </main>
  );
}

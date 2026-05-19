import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms | T'es stone ?",
};

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <Link href="/" className="text-sm font-semibold text-zinc-500 underline underline-offset-4">← Retour</Link>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950">Terms</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-600 sm:text-base">
          <p>
            T&apos;es stone ? est une application de divertissement. Les résultats sont indicatifs,
            humoristiques et destinés à être partagés pour le fun.
          </p>
          <ul className="space-y-3">
            <li>• L’application n’est pas un test de drogue, un outil médical, ni un détecteur de substance.</li>
            <li>• Les résultats ne remplacent jamais un avis professionnel ou médical.</li>
            <li>• Aucune garantie d’exactitude n’est fournie sur l’analyse visuelle.</li>
            <li>• L’utilisateur reste responsable de l’usage qu’il fait des résultats et du contenu partagé.</li>
            <li>• Le service peut utiliser un fallback humoristique si l’analyse IA n’est pas disponible.</li>
            <li>• Le MVP ne stocke pas de compte utilisateur ni de photos côté produit.</li>
          </ul>
          <p>
            En utilisant l’application, tu acceptes que le verdict soit plus drôle que scientifique. Et c’est normal.
          </p>
        </div>
      </div>
    </main>
  );
}

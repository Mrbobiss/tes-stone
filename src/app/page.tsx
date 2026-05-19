import { TasDormiApp as TesStoneApp } from "@/components/tas-dormi-app";
import { EXAMPLE_ANALYSIS } from "@/lib/constants";
import { generateResult } from "@/lib/result-engine";

export default function Home() {
  const exampleMode = "normal" as const;
  const exampleResult = generateResult(EXAMPLE_ANALYSIS, exampleMode);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "T'es stone ?",
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Web",
    inLanguage: "fr-FR",
    url: "https://tes-stone.vercel.app",
    description: "Prends un selfie, choisis ta ref, et découvre jusqu'où ton regard a quitté la conversation.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    featureList: [
      "analyse selfie humoristique",
      "score stone apparent",
      "modes de refs trash et potaches",
      "carte résultat partageable",
      "PWA mobile-first",
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <TesStoneApp exampleResult={exampleResult} />
      <section className="mx-auto max-w-5xl px-4 pb-14 text-sm text-zinc-600 sm:px-6">
        <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
          <h2 className="text-base font-semibold text-zinc-900">Comment fonctionne T’es stone ?</h2>
          <p className="mt-2">
            T’es stone ? est une mini app selfie à but humoristique qui lit une vibe planante apparente, calcule un score local,
            puis sort un verdict trash, drôle et calibré sur la note.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-medium text-zinc-900">Ce que fait l’app</h3>
              <p className="mt-1">
                Elle analyse des signaux visuels simples comme l’ouverture des yeux, le focus du regard, la pose, la lumière ou la
                détente du visage pour fabriquer une carte fun et partageable.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-zinc-900">Ce que l’app ne fait pas</h3>
              <p className="mt-1">
                Elle ne détecte aucune substance réelle, ne pose aucun diagnostic, et reste strictement dans le divertissement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

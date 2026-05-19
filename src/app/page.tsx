import { TasDormiApp as TesStoneApp } from "@/components/tas-dormi-app";
import { EXAMPLE_ANALYSIS } from "@/lib/constants";
import { generateResult } from "@/lib/result-engine";

export default function Home() {
  const exampleMode = "normal" as const;
  const exampleResult = generateResult(EXAMPLE_ANALYSIS, exampleMode);

  return <TesStoneApp exampleResult={exampleResult} />;
}

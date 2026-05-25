import { LibraryShell } from "@/components/library-shell";

type HomePageProps = {
  searchParams: Promise<{
    source?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { source = "" } = await searchParams;

  return <LibraryShell initialSource={source} />;
}

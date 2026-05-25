import { LibraryShell } from "@/components/library-shell";
import { getDefaultDriveSource } from "@/lib/site-config";

type HomePageProps = {
  searchParams: Promise<{
    source?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { source } = await searchParams;

  return <LibraryShell initialSource={source || getDefaultDriveSource()} />;
}

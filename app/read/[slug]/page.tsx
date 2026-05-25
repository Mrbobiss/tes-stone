import { ReaderShell } from "@/components/reader-shell";
import { getDefaultDriveSource } from "@/lib/site-config";

type ReaderPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    source?: string;
  }>;
};

export default async function ReaderPage({ params, searchParams }: ReaderPageProps) {
  const [{ slug }, { source }] = await Promise.all([params, searchParams]);

  return <ReaderShell initialSlug={slug} initialSource={source || getDefaultDriveSource()} />;
}

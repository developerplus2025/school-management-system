"use client"
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { useSearchParams } from "next/navigation";
import "@cyntler/react-doc-viewer/dist/index.css";
export default function ViewFilePage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  if (!url) return <p>No file URL provided.</p>;

  return (
    <div className="h-full w-screen">
      <h1 className="text-xl mb-4">File Viewer</h1>

      <DocViewer
        className="h-full w-screen"

        documents={[
          {
            uri: url,
          },
        ]}
        pluginRenderers={DocViewerRenderers}
      />
    </div>
  );
}

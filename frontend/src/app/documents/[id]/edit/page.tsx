import { getDocument } from "@/lib/api";
import EditDocumentClient from "./EditDocumentClient";

export default async function EditDocument({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = await getDocument(id);

  return <EditDocumentClient document={document} />;
}

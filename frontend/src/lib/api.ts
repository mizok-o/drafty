const API_BASE_URL = "http://localhost:3000";

export interface Document {
  id: number;
  title: string;
  content: string;
  isPublished: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export async function getDocument(id: string): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/documents/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch document");
  }
  return response.json();
}

export async function updateDocument(id: number, data: Partial<Document>): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update document");
  }

  return response.json();
}

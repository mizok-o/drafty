"use client";

import { useState, useEffect, useRef } from "react";
import { getDocument, updateDocument, type Document } from "@/lib/api";

export default function EditDocument({ params }: { params: Promise<{ id: string }> }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    async function loadDocument() {
      try {
        const resolvedParams = await params;
        const doc = await getDocument(resolvedParams.id);
        setContent(doc.content);
      } catch (error) {
        console.error("Failed to load document:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDocument();

  }, [params]);

  useEffect(() => {
    if (loading || isInitialLoadRef.current) {
      if (!loading) isInitialLoadRef.current = false;
      return;
    }
    const timeoutId = setTimeout(async () => {
      const resolvedParams = await params;
      await updateDocument(resolvedParams.id, { content });
    }, 500);
  
    return () => clearTimeout(timeoutId);
  }, [content, loading]);

  if (loading) return <div className="loading">読み込み中...</div>;

  return (
    <div className="edit-container">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="edit-content"
        placeholder="ここに内容を書く..."
      />
    </div>
  );
}
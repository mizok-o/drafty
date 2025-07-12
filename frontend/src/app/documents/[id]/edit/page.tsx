"use client";

import { useState, useEffect, useRef } from "react";
import { getDocument, updateDocument, type Document } from "@/lib/api";
import { useWebSocket } from "@/lib/websocket";

export default function EditDocument({ params }: { params: Promise<{ id: string }> }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const isInitialLoadRef = useRef(true);
  const [documentId, setDocumentId] = useState<number>(0);
  const { ws, lastMessage } = useWebSocket();

  useEffect(() => {
    async function loadDocument() {
      try {
        const resolvedParams = await params;
        const doc = await getDocument(resolvedParams.id);
        setDocumentId(Number(resolvedParams.id));
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
    if (lastMessage?.event === 'documentUpdated' && 
        lastMessage.data.documentId === documentId) {
      
      setContent(lastMessage.data.content);
    }
  }, [lastMessage, documentId]);

  useEffect(() => {
    if (loading || isInitialLoadRef.current) {
      if (!loading) isInitialLoadRef.current = false;
      return;
    }
    const timeoutId = setTimeout(async () => {
      const resolvedParams = await params;
      await updateDocument(resolvedParams.id, { content });
    }, 100);
  
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
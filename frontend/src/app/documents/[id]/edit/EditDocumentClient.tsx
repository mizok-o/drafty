"use client";

import { useState, useEffect } from "react";
import { updateDocument, type Document } from "@/lib/api";
import { useWebSocket } from "@/lib/websocket";
import DebugPanel from "./DebugPanel";

interface EditDocumentClientProps {
  document: Document;
}

export default function EditDocumentClient({ document }: EditDocumentClientProps) {
  const [content, setContent] = useState(document.content);
  const { ws, lastMessage } = useWebSocket();
  const [updateSource, setUpdateSource] = useState<"local" | "remote" | "initial">("initial");
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    if (lastMessage?.event === "documentUpdated" && lastMessage.data.documentId === document.id) {
      setUpdateSource("remote");
      setContent(lastMessage.data.content);
    }
  }, [lastMessage, document.id]);

  useEffect(() => {
    if (updateSource !== "local" || isComposing) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      await updateDocument(document.id, { content });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [content, updateSource, document.id, isComposing]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUpdateSource("local");
    setContent(e.target.value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  return (
    <>
      <DebugPanel
        content={content}
        updateSource={updateSource}
        isComposing={isComposing}
        isInitialLoad={updateSource === "initial"}
      />
      <div className="edit-container">
        <textarea
          value={content}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className="edit-content"
          placeholder="ここに内容を書く..."
        />
      </div>
    </>
  );
}

"use client";

interface DebugPanelProps {
  content: string;
  updateSource: "local" | "remote" | "initial";
  isComposing: boolean;
  isInitialLoad: boolean;
}

export default function DebugPanel({
  content,
  updateSource,
  isComposing,
  isInitialLoad,
}: DebugPanelProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        fontFamily: "monospace",
        minWidth: "300px",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>🐛 Debug State</h3>
      <div>content length: {content.length}</div>
      <div>
        updateSource:{" "}
        <span style={{ color: updateSource === "local" ? "#4CAF50" : "#FFC107" }}>
          {updateSource}
        </span>
      </div>
      <div>
        isComposing:{" "}
        <span style={{ color: isComposing ? "#F44336" : "#4CAF50" }}>{String(isComposing)}</span>
      </div>
      <div>
        isInitialLoad:{" "}
        <span style={{ color: isInitialLoad ? "#F44336" : "#4CAF50" }}>
          {String(isInitialLoad)}
        </span>
      </div>
      <hr style={{ margin: "10px 0", opacity: 0.3 }} />
      <div style={{ fontSize: "11px", opacity: 0.8 }}>
        <div>✅ APIコール条件:</div>
        <div>1. !isInitialLoad && </div>
        <div>2. updateSource === "local" && </div>
        <div>3. !isComposing</div>
      </div>
    </div>
  );
}

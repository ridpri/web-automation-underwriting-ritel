import React from "react";

export default function InternalOperatingShell({ children }) {
  return (
    <div className="bg-[#EEF2F6]" style={{ overflowX: "clip" }}>
      {children}
    </div>
  );
}

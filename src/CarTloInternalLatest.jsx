import React from "react";
import MotorLatestExact from "./MotorLatestExact.tsx";

export default function CarTloInternalLatest({
  onExit,
  sessionName = "Taqwim (Internal)",
  operatingRecord = null,
  onOperatingSignal = () => {},
  onOpenWorkspace = () => {},
  onOpenQueue = () => {},
  onOpenPartnerConfig = () => {},
}) {
  return (
    <MotorLatestExact
      entryMode="internal"
      initialFlow="carTlo"
      sessionName={sessionName}
      onExit={onExit}
      operatingRecord={operatingRecord}
      onOperatingSignal={onOperatingSignal}
      accountMenuItems={[
        {
          label: "Ruang Kerja Saya",
          primary: true,
          onClick: onOpenWorkspace,
        },
        {
          label: "Antrean Internal",
          onClick: onOpenQueue,
        },
        {
          label: "Konfigurasi Partner",
          onClick: onOpenPartnerConfig,
        },
      ]}
    />
  );
}

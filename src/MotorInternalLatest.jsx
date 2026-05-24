import React from "react";
import InternalVehicleJourney from "./vehicle/InternalVehicleJourney.jsx";

export default function MotorInternalLatest({
  onExit,
  sessionName = "Taqwim (Internal)",
  operatingRecord = null,
  onOperatingSignal = () => {},
  onOpenWorkspace = () => {},
  onOpenQueue = () => {},
  onOpenPartnerConfig = () => {},
}) {
  return (
    <InternalVehicleJourney
      initialFlow="motor"
      sessionName={sessionName}
      onExit={onExit}
      operatingRecord={operatingRecord}
      onOperatingSignal={onOperatingSignal}
      onOpenWorkspace={onOpenWorkspace}
      onOpenQueue={onOpenQueue}
      onOpenPartnerConfig={onOpenPartnerConfig}
    />
  );
}

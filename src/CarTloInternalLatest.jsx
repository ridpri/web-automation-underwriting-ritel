import React from "react";
import InternalVehicleJourney from "./vehicle/InternalVehicleJourney.jsx";

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
    <InternalVehicleJourney
      initialFlow="carTlo"
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

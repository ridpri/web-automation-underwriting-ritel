import React from "react";
import InternalVehicleJourney from "./vehicle/InternalVehicleJourney.jsx";

export default function CarCompInternalPrototype({
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
      initialFlow="carComp"
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


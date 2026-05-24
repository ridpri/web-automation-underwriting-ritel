import { Bike, Car } from "lucide-react";

function cls() {
  return Array.from(arguments).filter(Boolean).join(" ");
}

export default function VehicleFlowModeSwitch({ mode, flowType, onSingle, onMulti }) {
  const VehicleIcon = flowType === "motor" ? Bike : Car;
  return (
    <div className="inline-flex overflow-hidden rounded-[14px] border border-[#D5DDE6] bg-[#F8FBFE] text-[#0A4D82] shadow-sm" aria-label="Pilih jumlah kendaraan yang diasuransikan">
      <button
        type="button"
        aria-label="Beberapa Kendaraan"
        title="Beberapa Kendaraan"
        onClick={onMulti}
        className={cls("inline-flex h-11 w-12 items-center justify-center border-r border-[#D5DDE6] transition", mode === "multi" ? "bg-[#0A4D82] text-white" : "bg-white text-[#0A4D82] hover:bg-[#F8FBFE]")}
      >
        <span className="relative inline-flex h-6 w-6 items-center justify-center">
          <VehicleIcon className="absolute left-0 top-0.5 h-3.5 w-3.5 opacity-70" />
          <VehicleIcon className="absolute right-0 top-0.5 h-3.5 w-3.5 opacity-70" />
          <VehicleIcon className="absolute bottom-0.5 left-1/2 h-4 w-4 -translate-x-1/2" />
        </span>
      </button>
      <button
        type="button"
        aria-label="Satu Kendaraan"
        title="Satu Kendaraan"
        onClick={onSingle}
        className={cls("inline-flex h-11 w-12 items-center justify-center transition", mode === "single" ? "bg-[#0A4D82] text-white" : "bg-white text-[#0A4D82] hover:bg-[#F8FBFE]")}
      >
        <VehicleIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

import { Building2, Home } from "lucide-react";

function cls() {
  return Array.from(arguments).filter(Boolean).join(" ");
}

export default function PropertyFlowModeSwitch({ mode, onSingle, onMulti }) {
  const itemClass = (active) =>
    cls(
      "inline-flex h-10 w-10 items-center justify-center transition first:rounded-l-[12px] last:rounded-r-[12px]",
      active ? "bg-[#0A4D82] text-white shadow-sm" : "bg-white text-[#0A4D82] hover:bg-[#F8FBFE]",
    );

  return (
    <div className="inline-flex overflow-hidden rounded-[14px] border border-[#C8D6E5] bg-white text-[#0A4D82] shadow-sm divide-x divide-[#DDE6F0]" aria-label="Pilih jumlah properti yang diasuransikan">
      <button type="button" aria-label="Beberapa Properti" title="Beberapa Properti" onClick={onMulti} className={itemClass(mode === "multi")}>
        <Building2 className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Satu Properti" title="Satu Properti" onClick={onSingle} className={itemClass(mode === "single")}>
        <Home className="h-4 w-4" />
      </button>
    </div>
  );
}

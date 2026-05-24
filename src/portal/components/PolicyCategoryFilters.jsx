import React from "react";
import { cls } from "../portalUtils.js";
import { POLICY_FILTERS } from "../portalData.js";

export function PolicyCategoryFilters({ activeCategory, onChange }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {POLICY_FILTERS.category.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={cls(
            "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold",
            activeCategory === item.key ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#5F7A99] hover:bg-[#F6F8FA]",
          )}
        >
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

import React from "react";

export default function CampoData({ value, onChange }) {
  return (
    <div className="relative mt-2 w-full">
      <button
        type="button"
        className="flex h-[46px] w-full items-center rounded-xl border border-sky-100 bg-white px-4 text-left text-sm text-slate-900 outline-none"
      >
        {value ? formatDateBR(value) : "dd/mm/aaaa"}
      </button>

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}

function formatDateBR(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}
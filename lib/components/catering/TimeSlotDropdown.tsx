"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { TIME_SLOT_OPTIONS } from "./catering-order-helpers";

interface TimeSlotDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TimeSlotDropdown({
  value,
  onChange,
}: TimeSlotDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const selectedLabel =
    TIME_SLOT_OPTIONS.find((o) => o.value === value)?.label ?? "Select a time";

  const openMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideButton = buttonRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideButton && !insideMenu) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const select = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const menu = (
    <ul
      ref={menuRef}
      style={menuStyle}
      className="z-[200] bg-white border border-base-300 rounded-xl shadow-lg max-h-56 overflow-y-auto py-1"
    >
      <li>
        <button
          type="button"
          onClick={() => select("")}
          className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-base-100"
        >
          Select a time
        </button>
      </li>
      {TIME_SLOT_OPTIONS.map((opt) => (
        <li key={opt.value}>
          <button
            type="button"
            onClick={() => select(opt.value)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-base-100 ${
              value === opt.value
                ? "text-primary font-medium bg-primary/5"
                : "text-gray-900"
            }`}
          >
            {opt.label}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="w-full flex items-center justify-between px-4 py-3 border border-base-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-left"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && createPortal(menu, document.body)}
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { ArrowRightIcon, MenuIcon } from "../../../../components/Icon";

export default function SubNavBar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const searchParams = useSearchParams();

  const section =
    searchParams.get("section") || "intro";

  const titles = {
    intro: "Introduction",
    quickstart: "Quick Start",
    "text-decoration": "Text Decoration",
    "icons-symbols": "Icons & Symbols",
    keywords: "Keywords",
    importexport: "Import & Export",
    iconpacks: "Icon Packs",
    keybinds: "Keybinds",
  };

  const header = {
    intro: "Getting Started",
    quickstart: "Getting Started",
    "text-decoration": "Syntax",
    "icons-symbols": "Syntax",
    keywords: "Syntax",
    importexport: "Import / Export",
    iconpacks: "Import & Export",
    keybinds: "Other",
  };

  return (
    <div
      className="md:hidden h-12 shrink-0 border-b border-(--panel-border) bg-(--bg-primary) flex items-center gap-2 px-4 relative z-60">
      <button
        onClick={() =>
          setSidebarOpen(!sidebarOpen)
        }
        className="text-(--text-secondary) hover:text-(--text-primary)">
        <MenuIcon />
      </button>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-(--text-secondary)">
          {header[section]}
        </span>

        <ArrowRightIcon />

        <span className="font-medium">
          {titles[section]}
        </span>
      </div>
    </div>
  );
}
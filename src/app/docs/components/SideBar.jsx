"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useLang } from '../../../../utils/LanguageProvider';
import { TextPreset } from '../../../../utils/store/Text';

import {
  InfoIcon,
  PlayIcon,
  TextIcon,
  IconSymbolIcon,
  KeywordIcon,
  DownloadIcon,
  IconPack,
  LegalIcon,
  KeyboardIcon
} from "../../../../components/Icon";

export default function SideBar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const { lang } = useLang();
  const t = TextPreset.SideBar;
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const [expandedMenus, setExpandedMenus] = useState({
    "getting-started": true,
    syntax: true,
    "import-export": true,
    other: true,
  });

  const currentSection = searchParams.get("section") || "intro";

  const sections = [
    {
      title: "GETTING STARTED",
      isExpandable: true,
      id: "getting-started",
      items: [
        {
          id: "intro",
          label: t.Introduction[lang],
          icon: <InfoIcon size={18} />,
          path: "intro",
        },
        {
          id: "quickstart",
          label: t.QuickStart[lang],
          icon: <PlayIcon size={18} />,
          path: "quickstart",
        },
        {
          id: "tou",
          label: t.TermsOfUse[lang],
          icon: <LegalIcon size={18} />,
          path: "tou",
        },
      ],
    },
    {
      title: "SYNTAX",
      isExpandable: true,
      id: "syntax",
      items: [
        {
          id: "text-decoration",
          label: t.TextDecoration[lang],
          icon: <TextIcon size={18} />,
          path: "text-decoration",
        },
        {
          id: "icons-symbols",
          label: t.IconsSymbols[lang],
          icon: <IconSymbolIcon size={18} />,
          path: "icons-symbols",
        },
        {
          id: "keywords",
          label: t.Keywords[lang],
          icon: <KeywordIcon size={18} />,
          path: "keywords",
        },
      ],
    },
    {
      title: "IMPORT / EXPORT",
      isExpandable: true,
      id: "import-export",
      items: [
        {
          id: "importexport",
          label: t.ImportExport[lang],
          icon: <DownloadIcon size={18} />,
          path: "importexport",
        },
        {
          id: "iconpacks",
          label: t.IconPacks[lang],
          icon: <IconPack size={18} />,
          path: "iconpacks",
        },
      ],
    },
    {
      title: "OTHER",
      isExpandable: true,
      id: "other",
      items: [
        {
          id: "keybinds",
          label: t.Keybinds[lang],
          icon: <KeyboardIcon size={18} />,
          path: "keybinds",
        },
      ],
    },
  ];

  const handlePageChange = (sectionId, path) => {
    const targetPath = path || sectionId;

    router.push(
      `/docs?section=${targetPath}`,
      {
        scroll: false,
      }
    );

    setSidebarOpen(false);
  };

  const toggleMenu = (sectionId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getParentSectionId = (subId) => {
    for (const section of sections) {
      if (
        section.items?.some(
          (item) =>
            item.id === subId ||
            item.path === subId
        )
      ) {
        return section.id;
      }
    }
    return null;
  };

  useEffect(() => {
    const parentId = getParentSectionId(currentSection);

    if (parentId && !expandedMenus[parentId]) {
      setExpandedMenus((prev) => ({
        ...prev,
        [parentId]: true,
      }));
    }
  }, [currentSection]);

  const isItemActive = (item) => {
    return currentSection === (item.path || item.id);
  };

  return (
    <>
      <div
        onClick={() => setSidebarOpen(false)}
        className={`
          fixed inset-0 z-10 bg-black/50 transition-opacity duration-300 md:hidden
          ${sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }`}
      />

      <aside
        className={`fixed w-70 md:relative top-26 md:top-0 left-0 z-50 h-[calc(100vh-104px)] md:h-auto shrink-0 bg-(--panel-bg) border-r border-(--panel-border) flex flex-col shadow-(--shadow-sm) transition-transform duration-300 md:translate-x-0
          ${sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }`}>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-5 pb-5 pt-6">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="mb-4"
            >
              {section.isExpandable ? (
                <button
                  onClick={() => toggleMenu(section.id)}
                  className={`w-full flex items-center justify-between text-xs font-semibold text-(--text-secondary) uppercase tracking-wider px-3 py-1.5 hover:text-(--text-primary) transition-all`}
                >
                  <span>
                    {section.title}
                  </span>

                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${expandedMenus[section.id] ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              ) : (
                <div
                  className={`w-full flex items-center justify-between text-xs font-semibold text-(--text-secondary) uppercase tracking-wider px-3 mb-2`}
                >
                  {section.title}
                </div>
              )}

              {(!section.isExpandable || expandedMenus[section.id]) && (
                <div className="mt-1">
                  {section.items.map((item) => {
                    const isActive = isItemActive(item);

                    return (
                      <button
                        key={item.id}
                        onClick={() => handlePageChange(item.id, item.path)}
                        className={`
                          group w-full flex items-center gap-3 py-2 rounded-md text-sm transition-all relative pl-3 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-5 before:rounded-full before:transition-all before:duration-200
                          ${isActive
                            ? ` text-(--text-primary) font-medium before:bg-(--accent) before:opacity-100`
                            : ` text-(--text-secondary) hover:text-(--text-primary) before:bg-(--border-color) hover:before:bg-(--text-secondary) before:opacity-40 `
                          }
                        `}
                      >
                        <span
                          className={`
                            shrink-0 transition-colors
                            ${isActive
                              ? "text-(--accent)"
                              : `text-(--text-secondary) group-hover:text-(--text-primary)`
                            }
                          `}
                        >
                          {item.icon}
                        </span>

                        <span className="flex-1 text-left">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
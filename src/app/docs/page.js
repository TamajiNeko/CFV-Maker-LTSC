"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import NavBar from "./components/NavBar";
import SubNavBar from "./components/SubNavBar";
import SideBar from "./components/SideBar";

import IntroPage from "./pages/IntroPage";
import QuickStartPage from "./pages/QuickStartPage";
import TextDecorationPage from "./pages/syntax/TextDecorationPage";
import IconsSymbolsPage from "./pages/syntax/IconsSymbolsPage";
import KeywordsPage from "./pages/syntax/KeywordsPage";
import ImportExportPage from "./pages/ImportExportPage";
import IconPacks from "./pages/IconPacks";
import KeybindsPage from "./pages/KeybindsPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";

function DocsContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    document.title = "CFV Maker LTSC - Docs";
  }, []);

  const section =
    searchParams.get("section") || "intro";

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const pages = {
    intro: <IntroPage />,
    quickstart: <QuickStartPage />,
    "text-decoration": <TextDecorationPage />,
    "icons-symbols": <IconsSymbolsPage />,
    keywords: <KeywordsPage />,
    importexport: <ImportExportPage />,
    iconpacks: <IconPacks />,
    keybinds: <KeybindsPage />,
    tou: <TermsOfUsePage />
  };

  return (
    <div
      className=" flex flex-col flex-1 min-h-0 bg-(--bg-primary) text-(--text-primary) overflow-hidden"
    >
      <NavBar />

      <SubNavBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <SideBar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto">
          {pages[section] || pages.intro}
        </main>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div
          className=" flex items-center justify-centerh-screen"
        >
          Loading...
        </div>
      }
    >
      <DocsContent />
    </Suspense>
  );
}
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLang } from "../../../../../utils/LanguageProvider";
import { TextPreset } from "../../../../../utils/store/Text";
import SyntaxGrid from "../../components/SyntaxLoader";
import { KEYWORDS } from "../../components/SyntaxLoader";
import { useTheme } from "../../../../../utils/ThemeProvider";
import SyntaxSidebar from "../../components/SyntaxNavigator";
import { IconSymbolIcon } from "../../../../../components/Icon";

export default function IconsSymbolsPage() {
  const { lang } = useLang();
  const t = TextPreset.IconsSymbolsPage;
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("ability-icons");
  const hasScrolledRef = useRef(false);

  const categories = useMemo(() => [
    { id: "ability-icons", label: "Ability Icons" },
    { id: "circle-icons", label: "Circle Icons" },
    { id: "cost-icons", label: "Cost Icons" },
    { id: "effect-icons", label: "Effect Icons" },
    { id: "trigger-icons", label: "Trigger Icons" },
    { id: "other-icons", label: "Other Icons" },
    { id: "varaints", label: "Variants" }
  ], []);

  const abilityItems = [
    { code: "AUTO", iconSrc: KEYWORDS["AUTO"] },
    { code: "ACT", iconSrc: KEYWORDS["ACT"] },
    { code: "CONT", iconSrc: KEYWORDS["CONT"] },
    { code: "1/Turn", iconSrc: KEYWORDS["1/Turn"] },
    { code: "1/Fight", iconSrc: KEYWORDS["1/Fight"] },
  ];

  const circleItems = [
    { code: "VC", iconSrc: KEYWORDS["VC"], iconSize: 24 },
    { code: "RC", iconSrc: KEYWORDS["RC"], iconSize: 24 },
    { code: "GC", iconSrc: KEYWORDS["GC"], iconSize: 24 },
  ];

  const costItems = [
    { code: "COST", desc: t.descCost[lang], iconSrc: KEYWORDS["COST"], dark: isDarkTheme, iconSize: 20, iconOffsetY: -1 },
    { code: "CB", desc: t.descCb[lang], iconSrc: KEYWORDS["CB"], iconSize: 20 },
    { code: "CC", desc: t.descCc[lang], iconSrc: KEYWORDS["CC"], iconSize: 20 },
    { code: "SB", desc: t.descSb[lang], iconSrc: KEYWORDS["SB"], iconSize: 20 },
    { code: "SC", desc: t.descSc[lang], iconSrc: KEYWORDS["SC"], iconSize: 20 },
    { code: "EB", desc: t.descEb[lang], iconSrc: KEYWORDS["EB"], iconSize: 20 },
    { code: "EC", desc: t.descEc[lang], iconSrc: KEYWORDS["EC"], iconSize: 20 },
  ];

  const effectItems = [
    { code: "POWER", desc: t.descPower[lang], iconSrc: KEYWORDS["POWER"], iconSize: 20, dark: isDarkTheme },
    { code: "SHIELD", desc: t.descShield[lang], iconSrc: KEYWORDS["SHIELD"], iconSize: 20, dark: isDarkTheme },
    { code: "CRITICAL", desc: t.descCritical[lang], iconSrc: KEYWORDS["CRITICAL"], iconSize: 20, dark: isDarkTheme },
    { code: "REST", desc: t.descRest[lang], iconSrc: KEYWORDS["REST"], iconSize: 20 },
    { code: "STAND", desc: t.descStand[lang], iconSrc: KEYWORDS["STAND"], iconSize: 20 },
  ];

  const triggerItems = [
    { code: "Over Trigger", iconSrc: KEYWORDS["[Over Trigger]"], iconSize: 20 },
    { code: "Critical Trigger", iconSrc: KEYWORDS["[Critical Trigger]"], iconSize: 21 },
    { code: "Draw Trigger", iconSrc: KEYWORDS["[Draw Trigger]"], iconSize: 20 },
    { code: "Front Trigger", iconSrc: KEYWORDS["[Front Trigger]"], iconSize: 20 },
    { code: "Heal Trigger", iconSrc: KEYWORDS["[Heal Trigger]"], iconSize: 20 },
  ];

  const otherItems = [
    { code: "GB", desc: t.descGb[lang], iconSrc: KEYWORDS["GB(1)"], iconSize: 19, iconOffsetY: -1 },
    { code: "LB", desc: t.descLb[lang], iconSrc: KEYWORDS["LB(3)"], iconSize: 19, iconOffsetY: -1 },
  ];

  const varaintsItems = [
    { code: "POWER@[red]", iconSrc: KEYWORDS["POWER@red"], iconSize: 20, },
    { code: "POWER@[gray]", iconSrc: KEYWORDS["POWER@gray"], iconSize: 20, dark: isDarkTheme },
    { code: "SHIELD@[red]", iconSrc: KEYWORDS["SHIELD@red"], iconSize: 20 },
    { code: "SHIELD@[gray]", iconSrc: KEYWORDS["SHIELD@gray"], iconSize: 20, dark: isDarkTheme },
    { code: "CRITICAL@[red]", iconSrc: KEYWORDS["CRITICAL@red"], iconSize: 20 },
    { code: "CRITICAL@[gray]", iconSrc: KEYWORDS["CRITICAL@gray"], iconSize: 20, dark: isDarkTheme },
    { code: "{@[red]", iconSrc: KEYWORDS["{@red"], iconSize: 20 },
    { code: "{@[gray]", iconSrc: KEYWORDS["{@gray"], iconSize: 20, dark: isDarkTheme },
    { code: "}@[red]", iconSrc: KEYWORDS["}@red"], iconSize: 20 },
    { code: "}@[gray]", iconSrc: KEYWORDS["}@gray"], iconSize: 20, dark: isDarkTheme },
    { code: "COST@[red]", iconSrc: KEYWORDS["COST@red"], iconSize: 20, iconOffsetY: -1 },
  ];


  useEffect(() => {
    const scrollParam = searchParams.get("scroll");
    if (scrollParam && categories.some(cat => cat.id === scrollParam)) {
      setActiveCategory(scrollParam);

      setTimeout(() => {
        const element = document.getElementById(scrollParam);
        if (element && !hasScrolledRef.current) {
          element.scrollIntoView({ behavior: "instant", block: "start" });
          hasScrolledRef.current = true;
        }
      }, 100);
    } else if (!scrollParam) {
      setActiveCategory("ability-icons");
    }
  }, [searchParams, categories]);

  const handleCategoryChange = (newCategory) => {
    setActiveCategory(newCategory);

    const params = new URLSearchParams(searchParams);
    params.set("section", "icons-symbols");

    if (newCategory === "ability-icons") {
      params.delete("scroll");
    } else {
      params.set("scroll", newCategory);
    }

    const queryString = params.toString();
    const newUrl = `${pathname}?${queryString}`;
    router.replace(newUrl, { scroll: false });
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <h1 className="flex text-xl items-center gap-2 font-semibold mb-4 pb-1.5 border-b border-(--border-color)">
          <IconSymbolIcon size={24} />
          {t.IconsSymbols[lang]}
        </h1>
        <section id="ability-icons" className="mb-10 scroll-mt-20">
          <h2 className="text-xl font-semibold mb-4">Ability Icons</h2>
          <SyntaxGrid items={abilityItems} columns={3} />
        </section>

        <section id="circle-icons" className="mb-10 scroll-mt-20">
          <h2 className="text-xl font-semibold mb-4">Circle Icons</h2>
          <SyntaxGrid items={circleItems} columns={3} />
        </section>

        <section id="cost-icons" className="mb-10 scroll-mt-20">
          <h2 className="text-xl font-semibold mb-4">Cost Icons</h2>
          <SyntaxGrid items={costItems} columns={3} />
        </section>

        <section id="effect-icons" className="mb-10 scroll-mt-20">
          <h2 className="text-xl font-semibold mb-4">Effect Icons</h2>
          <SyntaxGrid items={effectItems} columns={3} />
        </section>

        <section id="trigger-icons" className="mb-8 scroll-mt-20">
          <h2 className="text-xl font-semibold mb-4">Trigger Icons</h2>
          <SyntaxGrid items={triggerItems} columns={3} />
        </section>

        <section id="other-icons" className="mb-8 scroll-mt-20">
          <h2 className="text-xl font-semibold mb-4">Other Icons</h2>
          <SyntaxGrid items={otherItems} columns={3} />
        </section>
        
        <section id="varaints" className="mb-8 scroll-mt-20">
          <h2 className="text-xl font-semibold mb-4">Variants</h2>
          <SyntaxGrid items={varaintsItems} columns={3} />
        </section>
      </div>
      <SyntaxSidebar
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
}
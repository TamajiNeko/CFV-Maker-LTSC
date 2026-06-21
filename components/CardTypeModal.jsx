"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLang } from "../utils/LanguageProvider";
import { TextPreset } from "../utils/store/Text";
import { InfoIcon, CheckIcon } from "./Icon";

export default function CardTypeModal({
  isOpen,
  onClose,
  selectedValue,
  onSelect,
  options = []
}) {
  const { lang } = useLang();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const t = TextPreset.CardTypeAssistant;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const searchRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
      setActiveTab("all");
    }
  }, [isOpen]);

  const categories = useMemo(() => ({
    units: ["b1", "b2", "b3", "b4", "b5", "b6"],
    orders: ["b7", "b8", "b9", "b10", "b11", "b12", "b13"],
    other: ["b14", "b15", "b16", "b17", "b18"]
  }), []);

  const getItemDetails = (optId) => {
    if (categories.units.includes(optId)) {
      return {
        category: "units",
        catLabel: t.units[lang]
      };
    } else if (categories.orders.includes(optId)) {
      return {
        category: "orders",
        catLabel: t.orders[lang]
      };
    } else {
      return {
        category: "other",
        catLabel: t.other[lang]
      };
    }
  };

  const filteredOptions = useMemo(() => {
    return options.filter((opt) => {
      const details = getItemDetails(opt.id);
      const matchesSearch = opt.label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "all" || details.category === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [options, searchQuery, activeTab, categories]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[85vh] rounded-md bg-(--panel-bg) border border-(--panel-border) shadow-2xl flex flex-col overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--panel-border) bg-(--toolbar-bg) px-6 py-4">
          <h2 className="text-base font-bold text-(--text-primary)">
            {t.title[lang]}
          </h2>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-(--panel-border) bg-(--bg-primary)/20">
          {/* Search */}
          <div className="w-full ">
            <input
              ref={searchRef}
              type="text"
              placeholder={t.search[lang]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full select-text pl-3 pr-10 py-2 rounded-md border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) placeholder:text-(--text-secondary)/60 focus:outline-none focus:ring-1 focus:ring-(--accent) focus:border-(--accent) transition-all text-sm"
            />
          </div>

          {/* Categories Tab Selector */}
          <div className="flex justify-between bg-(--input-bg) p-1 rounded-md shrink-0 overflow-x-auto">
            {["all", "units", "orders", "other"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-1.5 px-3.5 text-sm rounded-md whitespace-nowrap transition-all cursor-pointer ${activeTab === tab
                  ? "bg-(--bg-primary) text-(--text-primary) shadow-sm"
                  : "text-(--text-secondary) hover:text-(--text-primary)"
                  }`}
              >
                {tab === "all" ? t.all[lang] : t[tab][lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-5 bg-(--bg-primary)/5 custom-scrollbar">
          {filteredOptions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredOptions.map((opt) => {
                const details = getItemDetails(opt.id);
                const isSelected = selectedValue === opt.file;

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSelect(opt.file);
                      onClose();
                    }}
                    className={`group text-left p-3.5 px-4 rounded-md border hover:bg-(--panel-bg) transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${isSelected
                      ? "bg-(--accent)/5 border-(--accent) ring-0.5 ring-(--accent)"
                      : "bg-(--bg-secondary) border-(--panel-border)"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${details.category === "units" ? "bg-amber-500" :
                        details.category === "orders" ? "bg-blue-500" :
                          "bg-emerald-500"
                        }`} />
                      <span className={`text-sm group-hover:text-(--text-primary) transition-colors truncate ${isSelected ? "text-(--text-primary" : "text-(--text-secondary)"}`}>
                        {opt.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:block text-[10px] tracking-wider text-(--text-secondary) uppercase">
                        {details.catLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-(--text-secondary)">
                {t.noResults[lang]}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-(--panel-border) bg-(--toolbar-bg)">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium border border-(--border-color) bg-(--bg-primary) text-(--text-primary) hover:bg-(--button-hover) rounded-md transition-all cursor-pointer"
          >
            {t.close[lang]}
          </button>
        </div>
      </div>
    </div>
  );
}

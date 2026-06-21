"use client";

import { useLang } from "../../../../utils/LanguageProvider";
import { TextPreset } from "../../../../utils/store/Text";
import { KeyboardIcon } from "../../../../components/Icon";
import { useState } from "react";

export default function KeybindsPage() {
  const { lang } = useLang();
  const t = TextPreset.KeybindsPage;
  const [searchTerm, setSearchTerm] = useState("");

  const shortcuts = t.shortcuts;

  const fileActionShortcuts = shortcuts.filter((s) => s.id === "save" || s.id === "quick_download" || s.id.startsWith("new_project"));
  const textFormattingShortcuts = shortcuts.filter((s) => s.id !== "save" && s.id !== "quick_download" && !s.id.startsWith("new_project"));

  const filteredFileActions = fileActionShortcuts.filter(
    (s) =>
      s.name[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.desc[lang].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTextFormatting = textFormattingShortcuts.filter(
    (s) =>
      s.name[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.desc[lang].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ShortcutRow = ({ shortcut }) => (
    <div className="flex items-center justify-between bg-(--bg-secondary) px-6 py-4 hover:bg-(--panel-bg) transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold text-(--text-primary) mb-1">
          {shortcut.name[lang]}
        </div>
        <div className="text-sm text-(--text-secondary)">
          {shortcut.desc[lang]}
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-4 shrink-0">
        {shortcut.keys.split("+").map((key, keyIdx) => (
          <div key={keyIdx} className="flex items-center gap-1.5">
            {keyIdx > 0 && (
              <span className="text-xs text-(--text-secondary) font-medium">+</span>
            )}
            <kbd className="bg-(--bg-primary) text-(--text-primary) border border-(--panel-border) border-b-3 rounded-md px-2.5 py-1 text-xs font-semibold min-w-8 text-center">
              {key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="overflow-y-auto h-full custom-scrollbar p-8 pb-16">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <KeyboardIcon size={28} />
          <h1 className="text-xl font-bold">{t.title[lang]}</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={t.SearchBar[lang]}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-(--card-bg) border border-(--panel-border) rounded-lg px-4 py-2.5 text-(--text-primary) placeholder:text-(--text-secondary) focus:outline-none focus:border-(--accent) transition-colors"
          />
        </div>
      </div>

      {/* File Actions Section */}
      {filteredFileActions.length > 0 && (
        <div className="mb-8">
          <div className={`${lang !== 'en' ? "text-sm" : "text-xs"} uppercase tracking-widest text-(--text-secondary) font-semibold mb-4 ml-1`}>
            {t.fileActions[lang]}
          </div>
          <div className="space-y-px bg-(--border-color) rounded-xl overflow-hidden border border-(--panel-border)">
            {filteredFileActions.map((shortcut) => (
              <ShortcutRow key={shortcut.id} shortcut={shortcut} />
            ))}
          </div>
        </div>
      )}

      {/* Text Formatting Section */}
      {filteredTextFormatting.length > 0 && (
        <div>
          <div className={`${lang !== 'en' ? "text-sm" : "text-xs"} uppercase tracking-widest text-(--text-secondary) font-semibold mb-4 ml-1`}>
            {t.textFormatting[lang]}
          </div>
          <div className="space-y-px bg-(--border-color) rounded-xl overflow-hidden border border-(--panel-border)">
            {filteredTextFormatting.map((shortcut) => (
              <ShortcutRow key={shortcut.id} shortcut={shortcut} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredFileActions.length === 0 && filteredTextFormatting.length === 0 && (
        <div className="text-center py-12">
          <div className="text-(--text-secondary) text-sm">
            {t.NoResults[lang]}
          </div>
        </div>
      )}
    </div>
  );
}

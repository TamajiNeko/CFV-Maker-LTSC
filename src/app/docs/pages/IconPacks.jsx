"use client";

import Link from "next/link";
import { useLang } from "../../../../utils/LanguageProvider";
import { TextPreset } from "../../../../utils/store/Text";
import { ZipIcon, ImageIcon, IconPack, InfoIcon } from "../../../../components/Icon";

export default function IconPacks() {
  const { lang } = useLang();
  const t = TextPreset.IconPacksPage;

  const importMethods = [
    { 
      icon: <ImageIcon size={18} />, 
      label: "Image", 
      desc: t.methodImageDesc[lang] 
    },
    { 
      icon: <ZipIcon size={20} />, 
      label: "Icon Pack", 
      desc: t.methodPackDesc[lang] 
    },
  ];

  return (
    <div className="overflow-y-auto h-full custom-scrollbar p-8 pb-16">
      <div className="bg-(--card-bg) border border-(--panel-border) rounded-2xl p-7 mb-7 shadow-(--card-shadow)">
        <div className="flex items-center gap-3 text-2xl font-bold mb-2">
          <IconPack size={28} className="text-(--text-primary)" />
          {t.IconPack[lang]}
        </div>
        <p className={`text-(--text-secondary) text-base leading-relaxed`}>
          {t.desc[lang]}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 text-lg font-semibold mb-3">
          <InfoIcon size={24} />
          {t.WhatYouCanDo[lang]}
        </div>
        <div className={`bg-(--bg-secondary) rounded-xl p-5 text-base text-(--text-secondary) leading-relaxed border border-(--border-color)`}>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-(--accent) shrink-0">✦</span>
              <p><strong>{t.freeControlTitle[lang]}</strong>{t.freeControlDesc[lang]}</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-(--accent) shrink-0">✦</span>
              <p>
                <strong>{t.variantSupportTitle[lang]}</strong>{t.variantSupportDesc1[lang]}
                <Link href="/docs?section=icons-symbols&scroll=varaints" className="hover:underline">
                  <code className="bg-(--bg-primary) px-1.5 py-0.5 rounded text-xs text-(--text-primary)">
                    @variants
                  </code>
                </Link>{t.variantSupportDesc2[lang]}
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-(--accent) shrink-0">✦</span>
              <p><strong>{t.permanentAssetsTitle[lang]}</strong>{t.permanentAssetsDesc[lang]}</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 text-lg font-semibold mb-3">
          <IconPack size={24} />
          {t.HowToImport[lang]}
        </div>
        <div className="space-y-1">
          {importMethods.map((method, idx) => (
            <div key={idx} className="flex items-start gap-4 py-3 border-b border-(--border-color)">
              <div className={`flex items-center gap-2 w-36 shrink-0 text-(--text-secondary) text-base font-medium`}>
                {method.icon}
                <span>{method.label}</span>
              </div>
              <div className={`text-base text-(--text-secondary)`}>{method.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-1.75 text-lg font-semibold mb-2">
          <ZipIcon size={22} />
          {t.zip[lang]}
        </div>
        <p className={`text-(--text-secondary) mb-4 leading-relaxed text-base`}>
          {t.zipDesc[lang]}
          <code className="text-xs bg-(--bg-secondary) px-1.5 py-0.5 rounded border border-(--border-color)">.zip</code>
          {t.zipDesc_2[lang]}
        </p>
        <div className="bg-(--bg-secondary) rounded-xl p-5 border border-(--border-color) overflow-x-auto">
          <code className="text-xs block whitespace-pre font-mono text-(--text-primary) leading-relaxed">
            {`icon-pack.zip
├── config.json  (Contains custom line offsets and variant rules)
└── images/      (Folder containing matching icon files)`}
          </code>
        </div>
      </div>
    </div>
  );
}
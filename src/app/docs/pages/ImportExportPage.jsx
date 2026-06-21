"use client";

import { useLang } from "../../../../utils/LanguageProvider";
import { TextPreset } from "../../../../utils/store/Text";
import { ZipIcon, ImageIcon, DownloadIcon } from "../../../../components/Icon";

export default function ImportExportPage() {
  const { lang } = useLang();
  const t = TextPreset.ImportExportPage;

  const exportFormats = [
    { icon: <ZipIcon size={20} />, label: ".zip", desc: t.formatZipDesc[lang] },
    { icon: <ImageIcon size={18} />, label: "PNG (Maximum)", desc: "2805 x 4090 - Print quality" },
    { icon: <ImageIcon size={18} />, label: "PNG (Standard)", desc: "1600 x 2336 - High quality" },
    { icon: <ImageIcon size={18} />, label: "PNG (Lite)", desc: "800 x 1168 - Web optimized" },
  ];

  return (
    <div className="overflow-y-auto h-full custom-scrollbar p-8 pb-16">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xl font-semibold mb-2">
          <DownloadIcon size={20} />
          {t.title[lang]}
        </div>
        <p className={`text-(--text-secondary) mb-4 leading-relaxed text-base`}>
          {t.desc[lang]}
        </p>
        
        <div className="space-y-2">
          {exportFormats.map((format, idx) => (
            <div key={idx} className="flex items-start gap-4 py-3 border-b border-(--border-color)">
              <div className={`flex items-center gap-2 w-40 shrink-0 text-(--text-secondary) text-base font-medium`}>
                {format.icon}
                <span>{format.label}</span>
              </div>
              <div className={`text-base text-(--text-secondary)`}>{format.desc}</div>
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
            {`card.zip
├── config.json  (card data with imageConfig)
└── image.png    (card artwork)`}
          </code>
        </div>
      </div>
    </div>
  );
}
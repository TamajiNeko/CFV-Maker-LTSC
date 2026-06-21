import { useLang } from '../../../../utils/LanguageProvider';
import { TextPreset } from '../../../../utils/store/Text';

import { InfoIcon, PlusIcon } from "../../../../components/Icon";

const version = process.env.TEMPLATE_VERSION;

export default function IntroPage() {
  const { lang } = useLang();
  const t = TextPreset.IntroPage;

  return (
    <div className="overflow-y-auto h-full custom-scrollbar p-8 pb-16">
      <div className="bg-(--card-bg) border border-(--panel-border) rounded-2xl p-7 mb-7 shadow-(--card-shadow)">
        <div className="text-[28px] font-bold mb-3">CFV Maker Documentation</div>
        <div className="flex gap-6 my-4 py-3 border-t border-b border-(--border-color)">
          <div><div className="text-[11px] text-(--text-secondary) uppercase">VERSION</div><div className="text-lg font-semibold">{version}</div></div>
          <div><div className="text-[11px] text-(--text-secondary) uppercase">RESOLUTION</div><div className="text-lg font-semibold">HIGH (4K)</div></div>
          <div><div className="text-[11px] text-(--text-secondary) uppercase">FORMATS</div><div className="text-lg font-semibold">EN / TH</div></div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 text-lg font-semibold mb-4">
          <InfoIcon size={24} />
          {t.whatIs[lang]}
        </div>
        <p className="text-base text-(--text-secondary) leading-relaxed">
          {t.desc1[lang]}
          <strong>{t.descFanmade[lang]}</strong>
          {t.desc2[lang]}
          <strong>{t.descProvider[lang]}</strong>
          {t.desc3[lang]}
        </p>
      </div>

      <div className="flex items-center gap-2 text-lg font-semibold mb-4">
        <PlusIcon size={24} />
        {t.keyFeatures[lang]}
      </div>
      <div className={`bg-(--bg-secondary) rounded-xl p-5 text-base text-(--text-secondary) leading-relaxed border border-(--border-color)`}>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="text-(--accent) shrink-0">✦</span>
            <p>{t.feat1[lang]}</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-(--accent) shrink-0">✦</span>
            <p>{t.feat2[lang]}</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-(--accent) shrink-0">✦</span>
            <p>{t.feat3[lang]}</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-(--accent) shrink-0">✦</span>
            <p>
              {t.feat4[lang]}
              <code className="bg-(--bg-primary) px-1.5 py-0.5 rounded text-xs text-(--text-primary)">
                .zip
              </code>
              {t.feat4_2[lang]}
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-(--accent) shrink-0">✦</span>
            <p>
              {t.feat5[lang]}
              <code className="bg-(--bg-primary) px-1.5 py-0.5 rounded text-xs text-(--text-primary)">
                .zip
              </code>
              {t.feat5_2[lang]}
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}
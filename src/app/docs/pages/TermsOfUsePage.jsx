import { useLang } from '../../../../utils/LanguageProvider';
import { TextPreset } from '../../../../utils/store/Text';
import { LegalIcon } from "../../../../components/Icon";

export default function TermsOfUsePage() {
  const { lang } = useLang();
  const t = TextPreset.TermsOfUsePage;

  return (
    <div className="overflow-y-auto h-full custom-scrollbar p-8 pb-16">
      <div className="bg-(--card-bg) border border-(--panel-border) rounded-2xl p-7 mb-7 shadow-(--card-shadow)">
        <div className="flex items-center gap-3 text-2xl font-bold mb-2">
          <LegalIcon size={28} className="text-(--text-primary)" />
          {t.title[lang]}
        </div>
        <p className="text-(--text-secondary) text-base leading-relaxed">
          {t.desc1_1[lang]}<strong>{t.provider[lang]}</strong>{t.desc1_2[lang]}{t.desc1_3[lang]}<strong>{t.desc1_4[lang]}</strong>{t.desc1_5[lang]}
        </p>
      </div>

      <div className="mb-8">
        <div className="bg-(--bg-secondary) rounded-xl p-5 text-base text-(--text-secondary) leading-relaxed border border-(--border-color)">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-(--accent) shrink-0">✦</span>
              <p>
                {t.desc2_1[lang]}<strong>Bushiroad</strong>{t.desc2_2[lang]}<strong>{t.provider[lang]}</strong>
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-(--accent) shrink-0">✦</span>
              <p>{t.desc3[lang]}</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-(--accent) shrink-0">✦</span>
              <p>{t.desc4[lang]}</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-(--accent) shrink-0">✦</span>
              <p>{t.desc5[lang]}</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-(--accent) shrink-0">✦</span>
              <p>{t.desc6[lang]}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

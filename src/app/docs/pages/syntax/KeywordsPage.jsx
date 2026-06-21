import { useLang } from "../../../../../utils/LanguageProvider";
import { TextPreset } from "../../../../../utils/store/Text";

import SyntaxGrid from "../../components/SyntaxLoader";
import { KEYWORDS } from "../../components/SyntaxLoader";

import { KeywordIcon } from "../../../../../components/Icon";

export default function SyntaxPage() {
  const { lang } = useLang();
  const t = TextPreset.KeywordPage;

  const keywordsItems = [
    { code: "[Stride]", iconSrc: KEYWORDS["[Stride]"], iconSize: 22, iconOffsetY: -1 },
    { code: "[Ultimate Stride]", iconSrc: KEYWORDS["[Ultimate Stride]"], iconSize: 25, iconOffsetY: 1 },
    { code: "[Glitter]", iconSrc: KEYWORDS["[Glitter]"], iconSize: 20, iconOffsetY: -1 },
    { code: "[Regalis Piece]", iconSrc: KEYWORDS["[Regalis Piece]"], iconSize: 20, iconOffsetY: -3 },
    { code: "[Divine Skill]", iconSrc: KEYWORDS["[Divine Skill]"], iconSize: 30, iconOffsetY: 1 },

  ];

  return (
    <>
      <div className="overflow-y-auto h-full custom-scrollbar p-8 pb-16">
        <h4 className="flex items-center gap-2 text-xl font-semibold mb-3 pb-1.5 border-b border-(--border-color)">
          <KeywordIcon size={24} />
          {t.Keywords[lang]}
        </h4>
        <SyntaxGrid items={keywordsItems} columns={3} />
      </div>
    </>
  );
}
"use client";

import { useLang } from "../../../../../utils/LanguageProvider";
import { TextPreset } from "../../../../../utils/store/Text";
import SyntaxGrid from "../../components/SyntaxLoader";
import { KEYWORDS } from "../../components/SyntaxLoader";
import { useTheme } from "../../../../../utils/ThemeProvider";
import { TextIcon } from "../../../../../components/Icon";

export default function SyntaxPage() {
  const { lang } = useLang();
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  const t = TextPreset.TextDecorationPage;

  const textDecorationItems = [
    { code: "{", desc: t.descCurlyOpen[lang], iconSrc: KEYWORDS["{"], dark: isDarkTheme },
    { code: "}", desc: t.descCurlyClose[lang], iconSrc: KEYWORDS["}"], dark: isDarkTheme },
    {
      code: "__Underline__",
      desc: t.descUnderline[lang],
      textEffect: 'underline'
    },
    {
      code: "*Gray Italic*",
      desc: t.descGrayItalic[lang],
      textEffect: { italic: true, color: isDarkTheme ? '#c0c0c0' : '#858585' }
    },
    {
      code: "*__Gray Underline Italic__*",
      desc: t.descGrayUnderlineItalic[lang],
      textEffect: { italic: true, underline: true, color: isDarkTheme ? '#c0c0c0' : '#858585' }
    },
    {
      code: '/*Red*/',
      desc: t.descRed[lang],
      textEffect: 'red'
    },
    {
      code: "/**Red Italic**/",
      desc: t.descRedItalic[lang],
      textEffect: { italic: true, color: '#ff0000' }
    },
    {
      code: '/*__Red Underline__*/',
      desc: t.descRedUnderline[lang],
      textEffect: { underline: true, color: '#ff0000' }
    },
    {
      code: "/**__Red Underline Italic__**/",
      desc: t.descRedUnderlineItalic[lang],
      textEffect: { italic: true, underline: true, color: '#ff0000' }
    },
    {
      code: "\\j Justify Line",
      desc: t.descJustify[lang],
    },
  ];

  return (
    <>
      <div className="overflow-y-auto h-full custom-scrollbar p-8 pb-16">
        <h1 className="flex text-xl items-center gap-2 font-semibold mb-4 pb-1.5 border-b border-(--border-color)">
          <TextIcon size={24} />
          {t.TextDecoration[lang]}
        </h1>
        <SyntaxGrid items={textDecorationItems} columns={2} />
      </div>
    </>
  );
}
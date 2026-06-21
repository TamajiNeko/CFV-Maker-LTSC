"use client"
import { useLang } from '../../../../utils/LanguageProvider';
import { useTheme } from '../../../../utils/ThemeProvider';
import { TextPreset } from '../../../../utils/store/Text';

import Tooltip from "../../../../components/Tooltip";
import DropdownMenu from '../../../../components/DropDownMenu';

import { EditIcon } from '../../../../components/Icon';

const version = process.env.TEMPLATE_VERSION;

export default function NavBar() {
    const { lang, setLang } = useLang();
    const { theme, toggleTheme } = useTheme();

    const t = TextPreset.EditNav

    return (
        <nav className="h-14 bg-(--bg-secondary) border-b border-(--panel-border) flex items-center justify-between px-4 lg:px-6 shadow-(--shadow-sm) z-999 transition-colors duration-300">
            <div className="flex items-center gap-3">
                <span className="font-bold tracking-tight">
                    CFV MAKER
                </span>

                <DropdownMenu
                    position="center"
                    trigger={
                        <span className="font-bold text-(--text-secondary) tracking-tight">
                            <span className="uppercase">
                                {lang}
                            </span>

                            {" "}
                            {version}
                        </span>
                    }
                    items={[
                        {
                            section: t.Lang[lang],
                            label: `English ${lang === "en" ? t.Current[lang] : ""}`,
                            disabled: lang === "en",
                            onClick: () => setLang("en"),
                        },
                        {
                            section: t.Lang[lang],
                            label: `ไทย ${lang === "th" ? t.Current[lang] : ""}`,
                            disabled: lang === "th",
                            onClick: () => setLang("th"),
                        }
                    ]}
                />
            </div>
            <div className="flex items-center gap-2">
                <Tooltip position="bottom" text={theme === 'light' ? t.DarkMode[lang] : t.LightMode[lang]}>
                    <button onClick={toggleTheme} className="p-2 rounded-md border transition-all bg-(--bg-secondary) border-(--border-color) text-(--text-primary) hover:bg-(--bg-primary)">
                        {theme === 'light' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2" /><path d="M12 20v2" />
                                <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
                                <path d="M2 12h2" /><path d="M20 12h2" />
                                <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
                            </svg>
                        )}
                    </button>
                </Tooltip>
                <a href="../" target='_blank' className="px-3 py-1.5 rounded-md text-sm font-medium transition-all border bg-(--bg-secondary) border-(--border-color) text-(--text-primary) hover:bg-(--bg-primary) flex items-center gap-2"><EditIcon />{t.Editor[lang]}</a>
            </div>
        </nav>
    )
}
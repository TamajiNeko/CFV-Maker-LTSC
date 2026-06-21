"use client"

import Link from 'next/link';
import React, {
    useCallback,
    useEffect,
    useState
} from 'react';

import { useTheme } from '../../../utils/ThemeProvider';
import { useLang } from '../../../utils/LanguageProvider';
import { useCardState } from '../../../utils/store/State';
import { useIconConfig } from '../../../utils/store/IconConfig';

import { exportCardToZip, previewZip } from '../../../utils/CardIO';
import { exportIconsToZip, importIconsFromZip, importIconFromImage } from '../../../utils/IconIO';

import { TextPreset } from '../../../utils/store/Text';

import Tooltip from "../../../components/Tooltip";
import DropdownMenu from "../../../components/DropDownMenu";

import {
    ZipIcon,
    DownloadIcon,
    ImageIcon,
    FolderIcon,
    DocsIcon,
    IconPack,
    IconSymbolIcon,
    WarningIcon,
    PlusIcon
} from '../../../components/Icon';

const version = process.env.TEMPLATE_VERSION;

export default function NavBar() {
    const { theme, toggleTheme } = useTheme();
    const { lang, setLang } = useLang();

    const t = TextPreset.EditNav;

    const { state, setField, setMultiple } = useCardState();
    const config = useIconConfig();

    const [deviceMemory, setDeviceMemory] = useState(null);
    const [showNewProjectConfirmModal, setShowNewProjectConfirmModal] = useState(false);

    useEffect(() => {
        if (typeof navigator !== "undefined") {
            setDeviceMemory(
                navigator.deviceMemory || null
            );
        }
    }, []);

    const isLowMemory =
        typeof deviceMemory === "number" &&
        deviceMemory < 8;

    const handleExportIcon = async () => {
        if (config && config.exact) {
            await exportIconsToZip(config.exact);
        }
    };

    const handleUpload = (e) => {
        if (state.isLocked) return;

        const file = e.target.files[0];

        if (file && file.type.startsWith('image/')) {
            if (state.imageSrc) {
                URL.revokeObjectURL(state.imageSrc);
            }

            setMultiple({
                imageSrc: URL.createObjectURL(file),
            });
        }

        e.target.value = "";
    };

    const handleNewProjectHere = useCallback(() => {
        if (!state.isSaved) {
            setShowNewProjectConfirmModal(true);
        } else {
            window.location.reload();
        }
    }, [state.isSaved]);

    const handleNewProjectNewWindow = useCallback(() => {
        if (window.electronAPI && window.electronAPI.newProject) {
            window.electronAPI.newProject();
        } else {
            window.open(window.location.origin, '_blank');
        }
    }, []);


    const handleExportCard = useCallback(async () => {
        const cardData = {
            cardName: state.cardName,
            selectedNation: state.selectedNation,
            clan: state.clan,
            selectedType: state.selectedType,
            isSubType: state.isSubType,
            subOrderType: state.subOrderType,
            selectedPassive: state.selectedPassive,
            selectedTrigger: state.selectedTrigger,
            addition: state.addition,
            illust: state.illust,
            flavor: state.flavor,
            abilities: state.abilities,
            grade: state.grade,
            power: state.power,
            raceText: state.raceText,
            raceCheck: state.raceCheck,
            shield: state.shield,
            shieldCheck: state.shieldCheck,
            isFullArt: state.isFullArt,
            showGlobe: state.showGlobe,
            showClan: state.showClan,
            baseColorTint: state.baseColorTint,
            customNationEnabled: state.customNationEnabled,
            solidColor: state.solidColor,
            customNationName: state.customNationName,
            cardNameGradient: state.cardNameGradient,
            nationGradient: state.nationGradient,
            lang,
        };

        const result = await exportCardToZip(
            cardData,
            state.imageSrc,
            state.imageConfig,
            state.selectedType == "base_ticket.png" ? `${TextPreset.Extra.Energy[lang]}${state.illust ? ` by ${state.illust}` : ""}`
                : state.selectedType == "base_crest.png/ride_deck" ? `${TextPreset.Extra.Generator[lang]}${state.illust ? ` by ${state.illust}` : ""}`
                    : state.cardName,
            state.customLayers
        );

        setField('isSaved', result.success);
    }, [state, lang]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const isMeta = e.ctrlKey || e.metaKey;

            if (isMeta && e.code === "KeyS") {
                e.preventDefault();

                if (e.shiftKey) {
                    setTimeout(() => {
                        setField('exportTrigger', state.exportTrigger + 1);
                    }, 50);
                } else {
                    handleExportCard();
                }
            } else if (isMeta && e.code === "KeyN") {
                e.preventDefault();
                if (e.shiftKey) {
                    handleNewProjectNewWindow();
                } else {
                    handleNewProjectHere();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleExportCard, handleNewProjectHere, handleNewProjectNewWindow, state.exportTrigger, setField]);

    const handleImportFile = async (e) => {
        const file = e.target.files[0];

        if (!file || !file.name.endsWith('.zip')) {
            e.target.value = '';
            return;
        }

        setField('isImportingPreview', true);

        const preview = await previewZip(file);

        if (preview.success) {
            if (preview.imageUrl) {
                setField('tempImageSrc', preview.imageUrl);
            }

            setMultiple({
                importPreview: {
                    file,
                    ...preview,
                },
                showImportModal: true,
            });
        }

        setField('isImportingPreview', false);

        e.target.value = "";
    };

    const handleImportIcon = async (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const fileName = file.name.toLowerCase();

        try {
            if (fileName.endsWith(".zip")) {
                const result = await importIconsFromZip(file);

                if (!result.success) {
                    e.target.value = "";
                    return;
                }
            } else if (file.type.startsWith("image/")) {
                const result = await importIconFromImage(file);

                if (!result.success) {
                    e.target.value = "";
                    return;
                }
            } else {
                e.target.value = "";
                return;
            }
        } catch (error) {
            e.target.value = "";
            return;
        }

        window.dispatchEvent(
            new CustomEvent("icon-uploaded")
        );

        e.target.value = "";
    };

    return (
        <nav className="h-14 bg-(--bg-secondary) border-b border-(--panel-border) flex items-center justify-between px-4 md:px-6 shadow-(--shadow-sm) z-40 md:z-60 transition-colors duration-300">

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
                {isLowMemory && (
                    <Tooltip
                        position="bottom"
                        text={`${t.LowRam[lang]} (${deviceMemory}GB)`}
                    >
                        <span className="flex items-center">
                            <WarningIcon
                                size={20}
                                className="text-red-500"
                            />
                        </span>
                    </Tooltip>
                )}
            </div>

            <div className="flex items-center gap-2">

                <Tooltip
                    position="bottom"
                    text={
                        theme === 'light'
                            ? t.DarkMode[lang]
                            : t.LightMode[lang]
                    }
                >
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-md border transition-all bg-(--bg-secondary) border-(--border-color) text-(--text-primary) hover:bg-(--bg-primary)"
                    >
                        {theme === 'light' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2" />
                                <path d="M12 20v2" />
                                <path d="m4.93 4.93 1.41 1.41" />
                                <path d="m17.66 17.66 1.41 1.41" />
                                <path d="M2 12h2" />
                                <path d="M20 12h2" />
                                <path d="m6.34 17.66-1.41 1.41" />
                                <path d="m19.07 4.93-1.41 1.41" />
                            </svg>
                        )}
                    </button>
                </Tooltip>

                <Tooltip
                    position="bottom"
                    text={
                        state.isLocked
                            ? t.UnlockImage[lang]
                            : t.LockImage[lang]
                    }
                >
                    <button
                        onClick={() => setField('isLocked', !state.isLocked)}
                        className={`p-2 rounded-md border transition-all ${state.isLocked
                            ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                            : "bg-(--bg-secondary) border-(--border-color) text-(--text-primary) hover:bg-(--bg-primary)"
                            }`}
                    >
                        {state.isLocked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            </svg>
                        )}
                    </button>
                </Tooltip>

                <input
                    id="import-file-input"
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={handleImportFile}
                />

                <input
                    id="image-file-input"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleUpload}
                />

                <input
                    id="icon-pack-input"
                    type="file"
                    accept="image/*,.zip"
                    className="hidden"
                    onChange={handleImportIcon}
                />

                <Link
                    href="/docs"
                    target='_blank'
                    className="px-2 py-2 sm:px-3 sm:py-1.5 rounded-md text-sm font-medium transition-all border bg-(--bg-secondary) hover:bg-(--bg-primary) border-(--border-color) text-(--text-primary) flex items-center gap-2"
                >
                    <DocsIcon />

                    <span className="hidden sm:inline">
                        {t.Docs[lang]}
                    </span>
                </Link>

                <DropdownMenu
                    trigger={
                        <button className="px-2 py-2 sm:px-3 sm:py-1.5 rounded-md text-sm font-medium transition-all border bg-(--bg-secondary) border-(--border-color) text-(--text-primary) hover:bg-(--bg-primary) flex items-center gap-2">
                            <FolderIcon />

                            <span className="hidden sm:inline">
                                {t.File[lang]}
                            </span>
                        </button>
                    }
                    items={[
                        {
                            section: t.NewProject[lang],
                            label: t.NewProject[lang],
                            icon: <PlusIcon />,
                            children: [
                                {
                                    label: t.Here[lang],
                                    onClick: handleNewProjectHere,
                                },
                                {
                                    label: t.NewWindow[lang],
                                    onClick: handleNewProjectNewWindow,
                                }
                            ]
                        },

                        {
                            section: t.Export[lang],
                            label: t.ExportTemplate[lang],
                            icon: <ZipIcon />,
                            onClick: handleExportCard,
                        },

                        {
                            section: t.Export[lang],
                            label: t.ExportIconPack[lang],
                            icon: <IconPack />,
                            onClick: handleExportIcon,
                        },

                        {
                            section: t.Export[lang],
                            label: t.DownloadImage[lang],
                            icon: <DownloadIcon />,
                            onClick: () => {
                                setTimeout(() => {
                                    setField('exportTrigger', state.exportTrigger + 1);
                                }, 50);
                            },

                            children: [
                                {
                                    label: t.Maximum[lang],
                                    subtext: '2805x4090',
                                    onClick: () => {
                                        setField('exportPreset', 'max');

                                        setTimeout(() => {
                                            setField('exportTrigger', state.exportTrigger + 1);
                                        }, 50);
                                    }
                                },

                                {
                                    label: t.Standard[lang],
                                    subtext: '1600x2336',
                                    onClick: () => {
                                        setField('exportPreset', 'standard');

                                        setTimeout(() => {
                                            setField('exportTrigger', state.exportTrigger + 1);
                                        }, 50);
                                    }
                                },

                                {
                                    label: t.Lite[lang],
                                    subtext: '800x1168',
                                    onClick: () => {
                                        setField('exportPreset', 'lite');

                                        setTimeout(() => {
                                            setField('exportTrigger', state.exportTrigger + 1);
                                        }, 50);
                                    }
                                },
                            ]
                        },

                        {
                            section: t.Import[lang],
                            label: t.ImportTemplate[lang],
                            icon: <ZipIcon />,
                            onClick: () => document.getElementById('import-file-input')?.click(),
                        },

                        {
                            section: t.Import[lang],
                            label: t.ImportIconPack[lang],
                            icon: <IconPack />,
                            onClick: () => document.getElementById('icon-pack-input')?.click(),
                        },

                        {
                            section: t.Import[lang],
                            label: t.AddArt[lang],
                            icon: <ImageIcon />,
                            disabled: state.isLocked,
                            onClick: () => document.getElementById('image-file-input')?.click(),
                        },

                        {
                            section: t.Import[lang],
                            label: t.AddIcon[lang],
                            icon: <IconSymbolIcon />,
                            onClick: () => document.getElementById('icon-pack-input')?.click(),
                        },
                    ]}
                />
            </div>

            {showNewProjectConfirmModal && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-md bg-(--panel-bg) border border-(--panel-border) shadow-2xl flex flex-col overflow-hidden text-left">
                        <div className="border-b border-(--panel-border) bg-(--toolbar-bg) px-5 py-4">
                            <h1 className="text-base font-semibold text-(--text-primary)">
                                {t.NewProject[lang]}
                            </h1>
                        </div>
                        <div className="px-5 py-4 text-sm text-(--text-secondary) leading-relaxed">
                            {t.NewProjectConfirm[lang]}
                        </div>
                        <div className="flex justify-end gap-2 px-4 py-3 border-t border-(--panel-border) bg-(--toolbar-bg) rounded-b-md">
                            <button
                                onClick={() => setShowNewProjectConfirmModal(false)}
                                className="px-4 py-1.5 text-sm font-medium border border-(--border-color) bg-(--bg-primary) text-(--text-primary) hover:bg-(--button-hover) rounded transition-colors"
                            >
                                {TextPreset.UnsavedModal.cancel[lang]}
                            </button>
                            <button
                                onClick={() => {
                                    setShowNewProjectConfirmModal(false);
                                    window.location.reload();
                                }}
                                className="px-4 py-1.5 text-sm font-medium bg-(--accent) text-white rounded hover:brightness-110 transition-colors"
                            >
                                {TextPreset.UnsavedModal.dontSave[lang]}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { CardProvider, useCardState } from '../../utils/store/State';
import { importCardFromZip, exportCardToZip } from '../../utils/CardIO';
import { TextPreset } from '../../utils/store/Text';
import { useLang } from '../../utils/LanguageProvider';



import ImportModal from '../../components/ImportModal';
import NavBar from './components/NavBar';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import Workspace from './components/Workspace';

import {
    nationOption,
    typeOption,
    passiveOption,
    triggerOption
} from '../../utils/store/CardConstants';

import { WarningIcon } from '../../components/Icon';

function PageContent() {
    const { lang, setLang } = useLang();
    const { state, setField, setMultiple, setImageConfig } = useCardState();

    const t = TextPreset.Warning;

    const skipResetRef = useRef(false);
        const [mounted, setMounted] = useState(false);
    const [showMemoryWarning, setShowMemoryWarning] = useState(false);
    const [deviceMemory, setDeviceMemory] = useState(null);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    const isEnergy = state.selectedType == "base_ticket.png";
    const isRideDeck = state.selectedType === 'base_crest.png/ride_deck'

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const isElectron = typeof window !== 'undefined' && window.electronAPI;
        if (!isElectron) return;

        const unsubscribe = window.electronAPI.onCloseRequest(() => {
            if (state.isSaved) {
                window.electronAPI.forceClose();
            } else {
                setShowUnsavedModal(true);
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [state.isSaved]);

    useEffect(() => {
        if (!mounted) return;

        if (typeof navigator !== "undefined") {
            const memory = navigator.deviceMemory || null;
            setDeviceMemory(memory);

            if (typeof memory === "number" && memory < 8) {
                const dontShowTime = localStorage.getItem('memory-warning-dont-show-time');
                if (dontShowTime) {
                    const now = Date.now();
                    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

                    if (now - parseInt(dontShowTime, 10) < threeDaysInMs) {
                        return;
                    }
                }
                setShowMemoryWarning(true);
            }
        }
    }, [mounted]);

    const acceptMemoryWarning = () => {
        if (dontShowAgain) {
            localStorage.setItem('memory-warning-dont-show-time', Date.now().toString());
        } else {
            localStorage.removeItem('memory-warning-dont-show-time');
        }
        setShowMemoryWarning(false);
    };

    const firstLoadRef = useRef(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                firstLoadRef.current &&
                state.cardName === TextPreset.LeftPanel.CardName[lang]
            ) {
                document.title = lang === 'th' ? "CFV Maker - ไม่มีชื่อ" : "CFV Maker - Untitled";
                firstLoadRef.current = false;
                return;
            }

            firstLoadRef.current = false;

            document.title = isEnergy
                ? `CFV Maker - ${TextPreset.Extra.Energy[lang]}`
                : isRideDeck
                    ? `CFV Maker - ${TextPreset.Extra.Generator[lang]}`
                    : `CFV Maker - ${state.cardName}`;
        }, 100);

        return () => clearTimeout(timer);
    }, [isEnergy, isRideDeck, state.cardName, lang]);

    useEffect(() => {
        const currentImageSrc = state.imageSrc;
        return () => {
            if (currentImageSrc) URL.revokeObjectURL(currentImageSrc);
        };
    }, [state.imageSrc]);

    useEffect(() => {
        const currentTempImageSrc = state.tempImageSrc;
        return () => {
            if (currentTempImageSrc) URL.revokeObjectURL(currentTempImageSrc);
        };
    }, [state.tempImageSrc]);

    const confirmImport = async () => {
        if (!state.importPreview) return;

        const result = await importCardFromZip(state.importPreview.file);

        if (result.success) {
            const data = result.cardData;
            skipResetRef.current = true;

            setMultiple({
                isFullArt: data.isFullArt || false,
                showGlobe: data.showGlobe || false,
                showClan: data.showClan ?? false,
                baseColorTint: data.baseColorTint || { enabled: false, color: '#ff0000' },
                cardName: data.cardName || "N/A",
                illust: data.illust || "",
                flavor: data.flavor || "",
                abilities: data.abilities || "",
                grade: data.grade ?? 0,
                power: data.power ?? 0,
                raceText: data.raceText || "N/A",
                raceCheck: data.raceCheck ?? false,
                shield: data.shield ?? 0,
                shieldCheck: data.shieldCheck ?? true,
                selectedNation: data.selectedNation || nationOption[0].file,
                clan: data.clan || null,
                selectedType: data.selectedType || typeOption[0].file,
                subOrderType: data.subOrderType || "N/A",
                isSubType: data.isSubType || false,
                selectedPassive: data.selectedPassive || passiveOption[0].file,
                selectedTrigger: data.selectedTrigger || triggerOption[2].file,
                addition: data.addition ?? "",
                imageSrc: result.imageUrl || state.tempImageSrc,
                customLayers: result.customLayers || [],
                customNationEnabled: data.customNationEnabled || false,
                solidColor: data.solidColor || "#ffffff",
                customNationName: data.customNationName || "N/A",
                cardNameGradient: data.cardNameGradient || ["#ffffff"],
                nationGradient: data.nationGradient || ["#ffffff"],

                showImportModal: false,
                importPreview: null,
                tempImageSrc: null,
            });

            setLang(data.lang || "en");
            setField('isSaved', true);

            if (data.imageConfig) {
                setImageConfig({
                    scale: data.imageConfig.scale ?? 1,
                    x: data.imageConfig.x ?? 0,
                    y: data.imageConfig.y ?? 0,
                });
            } else {
                setImageConfig({ scale: 1, x: 0, y: 0 });
            }

            setTimeout(() => {
                skipResetRef.current = false;
            }, 100);

            const fileInput = document.getElementById('import-file-input');
            if (fileInput) fileInput.value = '';
        } else {
            cancelImport();
        }
    };

    const handleSaveAndLeave = async () => {
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

        if (result.success) {
            setField('isSaved', true);
            setShowUnsavedModal(false);
            window.electronAPI.forceClose();
        }
    };

    useEffect(() => {
        if (skipResetRef.current) return;
        if (state.isSaved !== false) setField('isSaved', false);
    }, [
        state.cardName, state.abilities, state.imageSrc, state.grade, state.power,
        state.shield, state.raceText, state.illust, state.flavor, state.selectedNation,
        state.clan, state.selectedType, state.selectedPassive, state.selectedTrigger,
        state.addition, state.raceCheck, state.shieldCheck, state.imageConfig?.scale,
        state.imageConfig?.x, state.imageConfig?.y, state.isFullArt, state.showGlobe,
        state.showClan, state.baseColorTint?.enabled, state.baseColorTint?.color,
        state.customLayers
    ]);

    useEffect(() => {
        const isElectron = typeof window !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron');
        if (isElectron) return;

        const handleBeforeUnload = (e) => {
            if (!state.isSaved) e.preventDefault();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [state.isSaved]);

    const cancelImport = () => {
        setMultiple({
            showImportModal: false,
            importPreview: null,
            tempImageSrc: null,
        });

        const fileInput = document.getElementById('import-file-input');
        if (fileInput) fileInput.value = '';
    };

    if (!mounted) return null;

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-(--bg-primary) text-(--text-primary) font-sans transition-colors duration-300">
            <NavBar />

            <div className="flex flex-1 overflow-hidden">
                <LeftPanel />
                <Workspace />
                <RightPanel />
            </div>

            {state.showImportModal && (
                <ImportModal
                    preview={state.importPreview}
                    onConfirm={confirmImport}
                    onCancel={cancelImport}
                    loading={state.isImporting}
                />
            )}

            {showUnsavedModal && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-md bg-(--panel-bg) border border-(--panel-border) shadow-2xl flex flex-col overflow-hidden">
                        <div className="border-b border-(--panel-border) bg-(--toolbar-bg) px-5 py-4">
                            <h1 className="text-base font-semibold text-(--text-primary)">
                                {TextPreset.UnsavedModal.title[lang]}
                            </h1>
                        </div>
                        <div className="px-5 py-4 text-sm text-(--text-secondary) leading-relaxed">
                            {TextPreset.UnsavedModal.desc[lang]}
                        </div>
                        <div className="flex justify-between items-center gap-2 px-4 py-3 border-t border-(--panel-border) bg-(--toolbar-bg) rounded-b-md">
                            <button
                                onClick={() => setShowUnsavedModal(false)}
                                className="px-4 py-1.5 text-sm font-medium border border-(--border-color) bg-(--bg-primary) text-(--text-primary) hover:bg-(--button-hover) rounded transition-colors"
                            >
                                {TextPreset.UnsavedModal.cancel[lang]}
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowUnsavedModal(false);
                                        window.electronAPI.forceClose();
                                    }}
                                    className="px-4 py-1.5 text-sm font-medium border border-(--border-color) bg-(--bg-primary) text-(--text-primary) hover:bg-(--button-hover) rounded transition-colors"
                                >
                                    {TextPreset.UnsavedModal.dontSave[lang]}
                                </button>
                                <button
                                    onClick={handleSaveAndLeave}
                                    className="px-4 py-1.5 text-sm font-medium bg-(--accent) text-white rounded hover:brightness-110 transition-colors"
                                >
                                    {TextPreset.UnsavedModal.saveLeave[lang]}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showMemoryWarning && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-md bg-(--panel-bg) border border-(--panel-border) shadow-2xl flex flex-col overflow-hidden">
                        <div className="flex items-start gap-3 border-b border-(--panel-border) bg-(--toolbar-bg) px-5 py-4">
                            <WarningIcon className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <h1 className="text-base font-semibold text-(--text-primary)">
                                    {t.title[lang]}
                                </h1>
                                <p className="mt-1 text-sm text-(--text-secondary) leading-relaxed">
                                    {t.desc[lang]}
                                </p>
                            </div>
                        </div>
                        <div className="p-5 space-y-5 text-sm">
                            <div className="flex gap-3">
                                <div className="flex-1 rounded border border-(--border-color) bg-(--bg-secondary) px-4 py-2.5">
                                    <span className="text-[10px] text-(--text-secondary) uppercase tracking-wide font-medium">
                                        {t.detectedRam[lang]}
                                    </span>
                                    <div className="mt-0.5 text-xl font-semibold text-red-500">
                                        {deviceMemory ? `${deviceMemory} GB` : t.low[lang]}
                                    </div>
                                </div>
                                <div className="flex-1 rounded border border-(--border-color) bg-(--bg-secondary) px-4 py-2.5">
                                    <span className="text-[10px] text-(--text-secondary) uppercase tracking-wide font-medium">
                                        {t.recommended[lang]}
                                    </span>
                                    <div className="mt-0.5 text-xl font-semibold text-(--text-primary)">8 GB+</div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h2 className="font-medium text-(--text-primary) mb-2">
                                        {t.problemsTitle[lang]}
                                    </h2>
                                    <ul className="list-disc pl-5 space-y-1 text-(--text-secondary) marker:text-red-500/50">
                                        <li>{t.problemImport[lang]}</li>
                                        <li>{t.problemAbilities[lang]}</li>
                                    </ul>
                                </div>
                                <div>
                                    <h2 className="font-medium text-(--text-primary) mb-2">
                                        {t.actionsTitle[lang]}
                                    </h2>
                                    <ul className="list-disc pl-5 space-y-1 text-(--text-secondary) marker:text-(--text-secondary)">
                                        <li>{t.actionCloseTabs[lang]}</li>
                                        <li>{t.actionOptimizeAssets[lang]}</li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-(--panel-border) bg-(--toolbar-bg) px-5 py-3">
                            <button
                                type="button"
                                onClick={() => setDontShowAgain(!dontShowAgain)}
                                className="flex items-center gap-2 text-xs text-(--text-secondary) hover:text-(--text-primary) transition-colors select-none group text-left min-w-0 flex-1"
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${dontShowAgain
                                    ? "bg-(--accent) border-(--accent) text-white"
                                    : "border-(--border-color) bg-(--bg-primary) group-hover:border-(--text-secondary)"
                                    }`}>
                                    {dontShowAgain && (
                                        <svg className="w-2.5 h-2.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    )}
                                </div>
                                <span className="truncate">
                                    {t.dontShowAgain[lang]}
                                </span>
                            </button>
                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => window.close()}
                                    className="px-4 py-1.5 text-sm font-medium border border-(--border-color) bg-(--bg-primary) text-(--text-primary) hover:bg-(--button-hover) rounded transition-colors"
                                >
                                    {t.btnExit[lang]}
                                </button>
                                <button
                                    onClick={acceptMemoryWarning}
                                    className="px-4 py-1.5 text-sm font-medium bg-(--accent) text-white rounded hover:brightness-110 transition-all"
                                >
                                    {t.btnContinue[lang]}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default function Page() {
    return (
        <CardProvider>
            <PageContent />
        </CardProvider>
    );
}
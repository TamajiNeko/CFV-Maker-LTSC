"use client"
import React, { useState } from 'react';

import { useLang } from '../../../utils/LanguageProvider';
import { useCardState } from '../../../utils/store/State';

import TextArea from '../../../components/TextArea';
import UploadGroup from '../../../components/custom/Icon/UploadGroup';

import { TextPreset } from '../../../utils/store/Text';

import {
    TextIcon,
    CloseIcon
} from '../../../components/Icon';

export default function RightPanel() {
    const { lang } = useLang();
    const { state, setField } = useCardState();
    const [isOpen, setIsOpen] = useState(false);

    const t = TextPreset.RightPanel;

    const isMarker = state.selectedType === 'base_ticket.png/marker';
    const isEnergy = state.selectedType === 'base_ticket.png';
    const isCrest = state.selectedType.split('.png')[0] + '.png' === 'base_crest.png'
    const isRideDeck = state.selectedType === 'base_crest.png/ride_deck'

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed bottom-6 right-4 z-40 p-3 min-h-12 min-w-12 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-transform"
                aria-label="Open Abilities & Flavor"
            >
                <TextIcon size={24} />
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-41 md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside className={`fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm md:w-[320px] bg-(--panel-bg) border-l border-(--panel-border) flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl md:shadow-none ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="flex items-center justify-between p-4 border-b border-(--panel-border) md:hidden shrink-0">
                    <span className="font-semibold text-lg text-(--text-primary)">Abilities & Flavor</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 min-h-11 min-w-11 text-(--text-secondary) hover:bg-(--bg-secondary) rounded-md flex items-center justify-center active:bg-(--border-color)"
                        aria-label="Close panel"
                    >
                        <CloseIcon size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pb-24 md:pb-5 transition-colors duration-300">
                    <div className={`${(isEnergy || isRideDeck) ? "hidden" : "mb-4"}`}>
                        <h2 className="hidden md:block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Abilities & Flavor</h2>
                        <div className="flex flex-col gap-2">
                            <div className={`${(isMarker || isEnergy || isCrest) ? "hidden" : "flex-1"}`}>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">{t.Flavor[lang]}</label>
                                <TextArea
                                    disabled={state.isFullArt}
                                    value={state.flavor}
                                    onChange={(e) => setField('flavor', e)}
                                    placeholder={!state.isFullArt ? "Type Here..." : "Flavor Disabled"}
                                    maxRows={5}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">{t.Abilities[lang]}</label>
                                <TextArea
                                    value={state.abilities}
                                    onChange={(e) => setField('abilities', e)}
                                    placeholder="Type Here..."
                                    maxRows={15}
                                    format={true}
                                />
                            </div>
                        </div>
                    </div>
                    <UploadGroup />
                </div>
            </aside>
        </>
    )
}
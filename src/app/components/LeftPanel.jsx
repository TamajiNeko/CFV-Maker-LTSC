"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';

import { useLang } from '../../../utils/LanguageProvider';
import { useCardState } from '../../../utils/store/State';

import TextInput from '../../../components/TextInput';
import Selector from '../../../components/Selector';
import ToggleInput from '../../../components/ToggleInput';
import ColorPickerInput from '../../../components/ColorPickerInput';
import GradientInput from '../../../components/GradientInput';
import CardTypeModal from '../../../components/CardTypeModal';
import Tooltip from '../../../components/Tooltip';

import LayerManager from '../../../components/custom/layer/LayerManager';

import { TextPreset } from '../../../utils/store/Text';

import {
    clanOption,
    nationOption,
    passiveOption,
    addPassiveOption,
    triggerOption,
    typeOption
} from '../../../utils/store/CardConstants';

import {
    LayersIcon,
    CloseIcon,
    InfoIcon
} from '../../../components/Icon';

const getCardTypeFlags = (typeVal) => {
    const isNormalUnit = typeVal === 'base_normal.png';
    const isTriggerUnit = typeVal === 'base_trigger.png';
    const isTriggerOrder = typeVal === 'base_trigger_o.png' || typeVal === 'base_blitz_trigger_o.png' || typeVal === 'base_set_trigger_o.png';
    const isToken = typeVal === 'base_normal.png/token';
    const isGUnit = typeVal === 'base_g.png/encounter' || typeVal === 'base_g.png';
    const isEncounter = typeVal === 'base_g.png/encounter' || typeVal === 'base_encounter.png';

    const isMarker = typeVal === 'base_ticket.png/marker';
    const isEnergy = typeVal === 'base_ticket.png';
    const isRideDeck = typeVal === 'base_crest.png/ride_deck';
    const isCrest = typeVal ? typeVal.startsWith('base_crest.png') : false;

    const isUnit = isNormalUnit || isTriggerUnit || isToken || isEncounter || isGUnit;
    const isOrder = !isUnit && !isMarker && !isEnergy && !isCrest;

    return {
        isNormalUnit, isTriggerUnit, isTriggerOrder, isToken, isGUnit, isEncounter,
        isMarker, isEnergy, isRideDeck, isCrest, isUnit, isOrder
    };
};

export default function LeftPanel() {
    const { lang } = useLang();
    const { state, setField, setMultiple } = useCardState();

    const [isOpen, setIsOpen] = useState(false);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('properties');
    const [layers, setLayers] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        if (state.customLayers && layers.length === 0 && state.customLayers.length > 0) {
            setLayers(state.customLayers);
        } else if (!state.customLayers || state.customLayers.length === 0) {
            if (layers.length > 0) {
                setLayers([]);
            }
            isInitialized.current = false;
        }
    }, [state.customLayers]);

    useEffect(() => {
        if (layers.length > 0) {
            isInitialized.current = true;
            if (JSON.stringify(state.customLayers) !== JSON.stringify(layers)) {
                setMultiple({
                    customLayers: layers
                });
            }
        } else if (isInitialized.current) {
            if (state.customLayers?.length > 0) {
                setMultiple({
                    customLayers: []
                });
            }
        }
    }, [layers]);

    const fileInputRef = useRef(null);
    const shieldRef = useRef(null);

    useEffect(() => {
        const el = shieldRef.current;
        if (!el) return;
        const handleWheel = () => el.blur();
        el.addEventListener('wheel', handleWheel, { passive: true });
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    const t = TextPreset.LeftPanel;
    const tOpt = TextPreset.CardOptions;

    const flags = getCardTypeFlags(state.selectedType);
    const { isUnit, isNormalUnit, isTriggerUnit, isTriggerOrder, isEncounter, isOrder, isGUnit, isToken, isEnergy, isRideDeck, isMarker, isCrest } = flags;

    const isNationNone = !state.raceCheck && state.selectedNation === 'none.png';
    const isClanNone = !state.raceCheck && state.clan === 'race.png';

    const addPassive = (isUnit && !flags.isToken && !isGUnit) ? 1 : isOrder ? 2 : 0;

    const translatedNations = nationOption.map(opt => ({ ...opt, label: tOpt[opt.id]?.[lang] || opt.label }));
    const translatedTypes = typeOption
        .map(opt => ({ ...opt, label: tOpt[opt.id]?.[lang] || opt.label }))
        .filter(opt => {
            if (state.customNationEnabled) {
                return opt.id !== 'b5' && opt.id !== 'b6';
            }
            return true;
        });

    const translatedPassives = passiveOption.map(opt => ({ ...opt, label: tOpt[opt.id]?.[lang] || opt.label }));
    const translatedAddPassives = (addPassiveOption[addPassive] || []).map(opt => ({ ...opt, label: tOpt[opt.id]?.[lang] || opt.label }));
    const translatedTriggers = triggerOption.map(opt => ({ ...opt, label: tOpt[opt.id]?.[lang] || opt.label }));

    const currentNationClans = clanOption[state.selectedNation] || [];
    const translatedClans = currentNationClans.map(opt => ({ ...opt, label: tOpt[opt.id]?.[lang] || opt.label }));

    useEffect(() => {
        const timer = setTimeout(() => {
            const clanStillValid = currentNationClans.some(clan => clan.file === state.clan);
            if (!clanStillValid) {
                setField('clan', currentNationClans.length > 0 ? currentNationClans[0].file : null);
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [state.selectedNation]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentAddPassiveOptions = addPassiveOption[addPassive] || [];
            const additionStillValid = currentAddPassiveOptions.some(opt => opt.file === state.addition);
            if (!additionStillValid) {
                setField('addition', currentAddPassiveOptions.length > 0 ? currentAddPassiveOptions[0].file : null);
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [addPassive]);

    useEffect(() => {
        if (state.customNationEnabled) {
            if (state.selectedType && state.selectedType.startsWith('base_encounter.png')) {
                setField('selectedType', 'base_normal.png');
            } else if (state.selectedType && state.selectedType.startsWith('base_g.png/encounter')) {
                setField('selectedType', 'base_g.png');
            }
        }
    }, [state.customNationEnabled, state.selectedType]);

    const handleGradeChange = (val) => {
        const parsed = parseInt(val, 10);
        if (isNaN(parsed)) {
            setField('grade', val);
            return;
        }

        if (isUnit) {
            let updates = { grade: parsed };
            if (isGUnit) {
                updates = { ...updates, selectedPassive: 'tripledrive.png', shieldCheck: false, power: 15000 };
            } else {
                if (parsed === 0) {
                    updates = { ...updates, selectedPassive: 'boost.png', shield: 5000, power: isTriggerUnit ? 5000 : 6000, shieldCheck: true, addition: '' };
                } else if (parsed === 1) {
                    updates = { ...updates, selectedPassive: 'boost.png', shield: 5000, power: 8000, shieldCheck: true, addition: '' };
                } else if (parsed === 2) {
                    updates = { ...updates, selectedPassive: 'intercept.png', shield: 5000, power: 10000, shieldCheck: true, addition: '' };
                } else if (parsed === 3) {
                    updates = { ...updates, selectedPassive: 'twindrive.png', shield: 5000, power: 13000, shieldCheck: false, addition: 'persona_ride.png' };
                } else if (parsed >= 3) {
                    updates = { ...updates, selectedPassive: 'tripledrive.png', shield: 5000, power: 13000, shieldCheck: false, addition: '' };
                }
            }
            setMultiple(updates);
        }
        else {
            setField('grade', parsed);
        }
    };

    const handleTypeChange = (typeVal) => {
        const nextFlags = getCardTypeFlags(typeVal);

        if (nextFlags.isUnit) {
            let updates = { selectedType: typeVal };
            if (nextFlags.isTriggerUnit) {
                updates = { ...updates, grade: 0, selectedPassive: 'boost.png', shield: 5000, power: 5000, shieldCheck: true, addition: '' };
            } else if (nextFlags.isGUnit) {
                updates = { ...updates, grade: 4, selectedPassive: 'tripledrive.png', shieldCheck: false, power: 15000, addition: '' };
            }
            setMultiple(updates);
        } else {
            setField('selectedType', typeVal);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed bottom-6 left-4 z-40 p-3 min-h-12 min-w-12 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-transform"
            >
                <LayersIcon size={24} />
            </button>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-41 md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm md:w-[320px] bg-(--panel-bg) border-r border-(--panel-border) flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-(--panel-border) md:hidden shrink-0">
                    <span className="font-semibold text-lg text-(--text-primary)">Properties</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 h-10 min-w-11 text-(--text-secondary) hover:bg-(--bg-secondary) rounded-md flex items-center justify-center active:bg-(--border-color)"
                    >
                        <CloseIcon size={20} />
                    </button>
                </div>

                <div className="flex shrink-0 px-4 py-1 pt-3">
                    <div className="flex w-full bg-(--input-bg) p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('properties')}
                            className={`flex-1 py-1.5 px-4 text-sm font-medium rounded-lg transition-all ${activeTab === 'properties'
                                ? 'bg-(--bg-primary) text-(--text-primary) shadow-sm'
                                : 'text-(--text-secondary) hover:text-(--text-primary)'
                                }`}
                        >
                            Properties
                        </button>
                        <button
                            onClick={() => setActiveTab('advance')}
                            className={`flex-1 py-1.5 px-4 text-sm font-medium rounded-lg transition-all ${activeTab === 'advance'
                                ? 'bg-(--bg-primary) text-(--text-primary) shadow-sm'
                                : 'text-(--text-secondary) hover:text-(--text-primary)'
                                }`}
                        >
                            Advance
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pb-24 md:pb-5 transition-colors duration-300">
                    {activeTab === 'properties' && (
                        <div className='pb-6'>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col gap-3">
                                    <TextInput disabled={isEnergy || isRideDeck} label={t.CardName[lang]} type="text" maxLength={48} value={isEnergy ? TextPreset.Extra.Energy[lang] : isRideDeck ? TextPreset.Extra.Generator[lang] : state.cardName} onChange={(e) => setField('cardName', e)} />

                                    {/* Race */}
                                    <ToggleInput
                                        visible={isUnit}
                                        label={t.Race[lang]}
                                        value={state.raceText}
                                        onChange={(e) => setField('raceText', e.target.value)}
                                        disabled={isClanNone && !state.customNationEnabled}
                                        placeholder={state.raceCheck ? "Type here..." : "Race Disabled"}
                                        containerClass={isNationNone && isClanNone ? "cursor-not-allowed" : ""}
                                        toggleVisible={state.clan === 'race.png' && !state.customNationEnabled}
                                        toggleValue={state.raceCheck}
                                        toggleOnChange={(v) => setField('raceCheck', v)}
                                        toggleText="RC"
                                        toggleTooltip={state.raceCheck ? t.HideRace[lang] : t.ShowRace[lang]}
                                    />

                                    {/* Nation */}
                                    <Selector
                                        visible={!isMarker && !isEnergy && (!state.customNationEnabled || isCrest)}
                                        label={t.Nation[lang]}
                                        options={translatedNations}
                                        value={state.selectedNation}
                                        onChange={(e) => setField('selectedNation', e)}
                                        checkVisible={isCrest}
                                        checkValue={state.showGlobe}
                                        checkOnChange={(v) => setField('showGlobe', v)}
                                        checkText="CG"
                                        checkTooltip={state.showGlobe ? t.HideGlobe?.[lang] : t.ShowGlobe?.[lang]}
                                        checkVisible2={isUnit && !isEncounter}
                                        checkValue2={state.showClan}
                                        checkOnChange2={(v) => setField('showClan', v)}
                                        checkText2="CN"
                                        checkTooltip2={state.showClan ? t.HideClan?.[lang] : t.ShowClan?.[lang]}
                                    />

                                    {/* Card Type */}
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-(--text-secondary) mb-1">
                                            {t.CardType[lang]}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsTypeModalOpen(true)}
                                                className="flex-1 min-w-0 flex gap-2 items-center justify-between px-3 py-2 h-10 rounded-md border border-(--border-color) bg-(--bg-secondary) hover:bg-(--panel-bg) transition-all text-sm group"
                                            >
                                                <span className="flex-1 text-left truncate">
                                                    {translatedTypes.find(o => o.file === state.selectedType)?.label}
                                                </span>
                                                <InfoIcon className="w-4 h-4 shrink-0 text-(--text-secondary) group-hover:text-(--text-primary) transition-colors" />
                                            </button>
                                            <Tooltip text={state.isFullArt ? t.NormalCardMode[lang] : t.SPCardMode[lang]}>
                                                <label
                                                    className={`flex items-center justify-center gap-2 min-w-17 h-10 px-3 rounded-md border transition-all select-none cursor-pointer
                                                    ${state.isFullArt
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                                            : 'hover:bg-(--panel-bg) border-(--border-color) bg-(--bg-secondary)'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={state.isFullArt}
                                                        onChange={(e) => setField('isFullArt', e.target.checked)}
                                                    />

                                                    <span
                                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                                                        ${state.isFullArt
                                                                ? 'border-5 bg-white border-blue-600'
                                                                : 'border-2 bg-white dark:bg-gray-700 border-slate-400 dark:border-slate-500'}`}
                                                    />

                                                    <span
                                                        className={`text-[11px] font-bold transition-colors
                                                        ${state.isFullArt
                                                                ? 'text-blue-700 dark:text-blue-400'
                                                                : 'text-slate-400 dark:text-slate-500'}`}
                                                    >
                                                        SP
                                                    </span>
                                                </label>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    {/* Order Subtype */}
                                    <ToggleInput
                                        visible={!(isUnit || isMarker || isEnergy || isCrest)}
                                        label={t.OrderSubtype[lang]}
                                        value={state.subOrderType}
                                        onChange={(e) => setField('subOrderType', e.target.value)}
                                        disabled={!state.isSubType}
                                        placeholder={state.isSubType ? "Type here..." : "Subtype Disabled"}
                                        toggleVisible
                                        toggleValue={state.isSubType}
                                        toggleOnChange={(v) => setField('isSubType', v)}
                                        toggleText="ST"
                                        toggleTooltip={state.isSubType ? t.HideSubtype[lang] : t.ShowSubtype[lang]}
                                    />

                                    <Selector visible={isEncounter || state.showClan} label={t.Clan[lang]} options={translatedClans} value={state.clan} onChange={(e) => setField('clan', e)} />
                                    <Selector visible={isTriggerUnit || isTriggerOrder} label={t.Trigger[lang]} options={translatedTriggers} value={state.selectedTrigger} onChange={(e) => setField('selectedTrigger', e)} />
                                    <TextInput visible={!isMarker && !isEnergy && !isCrest && !isGUnit} label={t.Grade[lang]} type="number" value={state.grade} step={1} min={0} max={11} onChange={handleGradeChange} />

                                    {/* Passive Skills */}
                                    <Selector visible={!isGUnit && isUnit} label={t.PassiveSkills[lang]} options={translatedPassives} value={state.selectedPassive} onChange={(e) => setField('selectedPassive', e)} />

                                    {/* Additional Passive */}
                                    <Selector visible={(isUnit || isOrder) && !isGUnit} label={t.AddPassive[lang]} options={translatedAddPassives} value={state.addition} onChange={(e) => setField('addition', e)} />

                                    <TextInput label={t.Power[lang]} visible={isUnit} type="number" value={state.power} min={0} max={99999} onChange={(e) => setField('power', e)} />

                                    {/* Shield */}
                                    <ToggleInput
                                        inputRef={shieldRef}
                                        visible={!(isGUnit || !isUnit)}
                                        label={t.Shield[lang]}
                                        type="number"
                                        value={state.shield}
                                        min={0}
                                        max={99999}
                                        step={1000}
                                        onChange={(e) => {
                                            let inputValue = e.target.value;
                                            if (inputValue === "") {
                                                setField('shield', "");
                                                return;
                                            }
                                            if (inputValue.length > 5) inputValue = inputValue.slice(0, 5);
                                            let numValue = parseInt(inputValue, 10);
                                            if (!isNaN(numValue)) {
                                                if (numValue > 99999) numValue = 99999;
                                                setField('shield', numValue.toString());
                                            }
                                        }}
                                        onBlur={() => { if (state.shield === "" || isNaN(state.shield)) setField('shield', 0); }}
                                        disabled={!state.shieldCheck}
                                        toggleVisible
                                        toggleValue={state.shieldCheck}
                                        toggleOnChange={(v) => setField('shieldCheck', v)}
                                        toggleText="SH"
                                        toggleTooltip={state.shieldCheck ? t.HideShield[lang] : t.ShowShield[lang]}
                                    />

                                    <TextInput label={t.Illustrator[lang]} type="text" value={state.illust} onChange={(e) => setField('illust', e)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'advance' && (
                        <div className='pb-6 relative'>
                            <div className={`${!(isUnit || isOrder) ? "hidden" : "flex"} flex-col`}>
                                <h2 className="hidden md:block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Custom Properties</h2>
                                {/* Base Color */}
                                <ColorPickerInput
                                    visible={isNormalUnit || isTriggerUnit || isToken}
                                    label={t.BaseColor[lang]}
                                    color={state.baseColorTint?.color || '#ff0000'}
                                    disabled={!state.baseColorTint?.enabled}
                                    onChange={(newColor) => setField('baseColorTint', { enabled: state.baseColorTint?.enabled || false, color: newColor })}
                                    toggleVisible
                                    toggleValue={state.baseColorTint?.enabled || false}
                                    toggleOnChange={(v) => setField('baseColorTint', { enabled: v, color: state.baseColorTint?.color || '#ffffff' })}
                                    toggleText="BC"
                                    toggleTooltip={state.baseColorTint?.enabled ? t.BaseColorOff?.[lang] : t.BaseColorOn?.[lang]}
                                />

                                {/* Custom Nation */}
                                <ToggleInput
                                    containerClass="mb-5.75"
                                    label={t.CustomNation[lang]}
                                    value={state.customNationName || ''}
                                    onChange={(e) => setField('customNationName', e.target.value)}
                                    disabled={!state.customNationEnabled}
                                    placeholder={state.customNationEnabled ? "Type here..." : "Nation Disabled"}
                                    toggleVisible
                                    toggleValue={state.customNationEnabled || false}
                                    toggleOnChange={(v) => setField('customNationEnabled', v)}
                                    toggleText="CN"
                                    toggleTooltip={state.customNationEnabled ? t.CustomNationOff[lang] : t.CustomNationOn[lang]}
                                />

                                {state.customNationEnabled && (
                                    <>
                                        {/* Solid Edge */}
                                        <ColorPickerInput
                                            label={t.SolidEdge[lang]}
                                            color={state.solidColor || '#ffffff'}
                                            onChange={(newColor) => setField('solidColor', newColor)}
                                        />

                                        {/* Card Name Gradient */}
                                        <GradientInput
                                            label={t.CardNameGradient[lang]}
                                            colors={state.cardNameGradient || []}
                                            onChange={(newColors) => setField('cardNameGradient', newColors)}
                                        />

                                        {/* Nation Gradient */}
                                        <GradientInput
                                            label={t.NationGradient[lang]}
                                            colors={state.nationGradient || []}
                                            onChange={(newColors) => setField('nationGradient', newColors)}
                                        />
                                    </>
                                )}
                            </div>

                            <LayerManager
                                layers={layers}
                                setLayers={setLayers}
                                draggedIndex={draggedIndex}
                                setDraggedIndex={setDraggedIndex}
                                fileInputRef={fileInputRef}
                                isCrest={isCrest}
                            />
                        </div>
                    )}
                </div>
            </aside>

            <CardTypeModal
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                selectedValue={state.selectedType}
                onSelect={handleTypeChange}
                options={translatedTypes}
            />
        </>
    )
}
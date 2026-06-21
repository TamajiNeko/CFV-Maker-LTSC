import React, { createContext, useContext, useReducer } from "react";
import { getLanguage } from "./LanguageStore";

const th = getLanguage() === "th";
const CardContext = createContext();

export const initialState = {
  selectedNation: 'none.png',
  selectedType: 'base_normal.png',
  subOrderType: th ? 'ประเภท' : 'Subtype',
  isSubType: false,
  selectedPassive: 'boost.png',
  selectedTrigger: 'draw.png',
  clan: 'race.png',
  imageSrc: null,
  imageConfig: { scale: 1, x: 0, y: 0 },
  addition: "",
  exportPreset: 'standard',
  exportTrigger: 0,
  cardName: th ? 'ชื่อการ์ด' : 'Card Name',
  illust: '',
  flavor: '',
  abilities: '',
  grade: 0,
  power: 6000,
  raceText: th ? 'เผ่า' : 'Race',
  raceCheck: false,
  shield: 5000,
  shieldCheck: true,
  isFullArt: false,
  showGlobe: true,
  showClan: false,
  baseColorTint: { enabled: false, color: '#00b9ff' },

  solidColor: "#0600ff",
  customNationEnabled: false,
  customNationName: th ? 'ชื่อเนชั่น' : 'Nation Name',

  cardNameGradient: ["#6fa8ff", "#ffffff"],
  nationGradient: ["#005eec", "#3d8bff", "#81b3ff"],

  isLocked: false,
  isSaved: true,
  importPreview: null,
  showImportModal: false,
  isImporting: false,
  tempImageSrc: null,
  isImportingPreview: false,
  customLayers: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_MULTIPLE':
      return { ...state, ...action.payload };
    case 'SET_IMAGE_CONFIG':
      const isSame =
        state.imageConfig.scale === action.payload.scale &&
        state.imageConfig.x === action.payload.x &&
        state.imageConfig.y === action.payload.y;
      if (isSame) return state;
      return {
        ...state,
        imageConfig: {
          ...state.imageConfig,
          ...action.payload,
        },
      };
    default:
      return state;
  }
}

export function CardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setField = (field, value) => dispatch({ type: 'SET_FIELD', field, value });
  const setMultiple = (payload) => dispatch({ type: 'SET_MULTIPLE', payload });
  const setImageConfig = (payload) => dispatch({ type: 'SET_IMAGE_CONFIG', payload });

  const value = {
    state,
    setField,
    setMultiple,
    setImageConfig,
  };

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}

export function useCardState() {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error("useCardState must be used within a CardProvider");
  }
  return context;
}
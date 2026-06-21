"use client";

import { useSyncExternalStore } from "react";

let CUSTOM_ICONS = {};
let CUSTOM_TAG_ALLOW = {};

let listeners = new Set();
let version = 0;

let cachedSnapshot = null;
let cachedVersion = -1;

export const ICON_CONFIG_BASE = {
  exact: {
    AUTO: { src: "/assets/icon/AUTO.png", iconHeight: 11 },
    ACT: { src: "/assets/icon/ACT.png", iconHeight: 11 },
    CONT: { src: "/assets/icon/CONT.png", iconHeight: 11 },
    "1/Turn": { src: "/assets/icon/1PT.png", iconHeight: 11 },
    "1/Fight": { src: "/assets/icon/1PF.png", iconHeight: 11 },
    COST: { src: "/assets/icon/COST.png", iconHeight: 14 },
    "{": { src: "/assets/icon/[.png", iconHeight: 10.5 },
    "}": { src: "/assets/icon/].png", iconHeight: 10.5 },

    POWER: { src: "/assets/icon/PW.png", iconHeight: 13 },
    CRITICAL: { src: "/assets/icon/CR.png", iconHeight: 13 },
    SHIELD: { src: "/assets/icon/SH.png", iconHeight: 13 },
    STAND: { src: "/assets/icon/STAND.png", iconHeight: 12 },
    REST: { src: "/assets/icon/REST.png", iconHeight: 12 },

    VC: { src: "/assets/icon/circle/VC.png", iconHeight: 16 },
    RC: { src: "/assets/icon/circle/RC.png", iconHeight: 16 },
    GC: { src: "/assets/icon/circle/GC.png", iconHeight: 16 },

    "[Over Trigger]": { src: "/assets/icon/trigger/Icon_OV.png", iconHeight: 12, iconYOffset: -0.5 },
    "[Critical Trigger]": { src: "/assets/icon/trigger/Icon_CR.png", iconHeight: 13, iconYOffset: -0.5 },
    "[Draw Trigger]": { src: "/assets/icon/trigger/Icon_DR.png", iconHeight: 12, iconYOffset: -0.5 },
    "[Front Trigger]": { src: "/assets/icon/trigger/Icon_FT.png", iconHeight: 12, iconYOffset: -0.5 },
    "[Heal Trigger]": { src: "/assets/icon/trigger/Icon_HE.png", iconHeight: 12, iconYOffset: -0.5 },

    "[Divine Skill]": { src: "/assets/icon/keyword/DVS.png", iconHeight: 21, iconYOffset: 1.5 },
    "[Regalis Piece]": { src: "/assets/icon/keyword/RGP.png", iconHeight: 15, iconYOffset: -1.5 },
    "[Glitter]": { src: "/assets/icon/keyword/GLT.png", iconHeight: 15 },
    "[Stride]": { src: "/assets/icon/keyword/STG.png", iconHeight: 15, iconYOffset: -1.5 },
    "[Ultimate Stride]": { src: "/assets/icon/keyword/UST.png", iconHeight: 18 },
  },

  prefixes: {
    CB: {
      baseSrc: "/assets/icon/cost/CB.png",
      valueBasePath: "/assets/icon/cost/value/",
      valueBgSrc: "/assets/icon/cost/value/bg.png",
      ext: ".png",
      valueRange: { min: 1, max: 5 },
      iconHeight: 12,
      iconYOffset: 0,
      allowPlain: true,
      tintColor: {
        red: 37,
        green: 50,
        blue: 108
      },
      iconYOffset: -0.5
    },

    CC: {
      baseSrc: "/assets/icon/cost/CC.png",
      valueBasePath: "/assets/icon/cost/value/",
      valueBgSrc: "/assets/icon/cost/value/bg.png",
      ext: ".png",
      valueRange: { min: 1, max: 5 },
      iconHeight: 12,
      iconYOffset: 0,
      allowPlain: true,
      tintColor: {
        red: 37,
        green: 50,
        blue: 108
      },
      iconYOffset: -0.5
    },

    SB: {
      baseSrc: "/assets/icon/cost/SB.png",
      valueBasePath: "/assets/icon/cost/value/",
      valueBgSrc: "/assets/icon/cost/value/bg.png",
      ext: ".png",
      valueRange: { min: 1, max: 10 },
      iconHeight: 12,
      iconYOffset: 0,
      allowPlain: true,
      tintColor: {
        red: 175,
        green: 32,
        blue: 36
      },
      iconYOffset: -0.5
    },

    SC: {
      baseSrc: "/assets/icon/cost/SC.png",
      valueBasePath: "/assets/icon/cost/value/",
      valueBgSrc: "/assets/icon/cost/value/bg.png",
      ext: ".png",
      valueRange: { min: 1, max: 10 },
      iconHeight: 12,
      iconYOffset: 0,
      allowPlain: true,
      tintColor: {
        red: 175,
        green: 32,
        blue: 36
      },
      iconYOffset: -0.5
    },

    EB: {
      baseSrc: "/assets/icon/cost/EB.png",
      valueBasePath: "/assets/icon/cost/value/",
      valueBgSrc: "/assets/icon/cost/value/bg.png",
      ext: ".png",
      valueRange: { min: 1, max: 10 },
      iconHeight: 12,
      iconYOffset: 0,
      allowPlain: true,
      tintColor: {
        red: 5,
        green: 106,
        blue: 67
      },
      iconYOffset: -0.5
    },

    EC: {
      baseSrc: "/assets/icon/cost/EC.png",
      valueBasePath: "/assets/icon/cost/value/",
      valueBgSrc: "/assets/icon/cost/value/bg.png",
      ext: ".png",
      valueRange: { min: 1, max: 10 },
      iconHeight: 12,
      iconYOffset: 0,
      allowPlain: true,
      tintColor: {
        red: 5,
        green: 106,
        blue: 67
      },
      iconYOffset: -0.5
    },
    GB: {
      baseSrc: "/assets/icon/cost/GB/GB",
      ext: ".png",
      useNumberedFiles: true,
      valueRange: { min: 1, max: 8 },
      iconHeight: 13,
      iconYOffset: 0,
      allowPlain: false,
    },
    LB: {
      baseSrc: "/assets/icon/cost/LB/LB",
      ext: ".png",
      useNumberedFiles: true,
      valueRange: { min: 3, max: 5 },
      iconHeight: 13,
      iconYOffset: 0,
      allowPlain: false,
    },
  }
};

export const COLOR_TAG_BASE = {
  allow: {
    POWER: true,
    SHIELD: true,
    CRITICAL: true,
    "}": true,
    "{": true,
    COST: ["red"],
  },
  preset: {
    red: { red: 255, green: 0, blue: 0 },
    gray: {
      dark: { red: 192, green: 192, blue: 192 },
      light: { red: 82, green: 82, blue: 82 }
    },
  }
}

export const HYBRID_ICON_CONFIG = {
  icons: {
    "/assets/icon/COST.png": {
      light: {
        type: "path",
        value: "/assets/icon/COST.png",
      },
      dark: {
        type: "path",
        value: "/assets/icon/COST_white.png",
      },
    },

    "/assets/icon/[.png": {
      dark: {
        type: "path",
        value: "/assets/icon/[.png",
      },
      light: {
        type: "invert",
      },
    },

    "/assets/icon/].png": {
      dark: {
        type: "path",
        value: "/assets/icon/].png",
      },
      light: {
        type: "invert",
      },
    },

    "/assets/icon/PW.png": {
      dark: {
        type: "path",
        value: "/assets/icon/PW.png",
      },
      light: {
        type: "tint",
        value: {
          red: 35,
          green: 31,
          blue: 32
        }
      },
    },

    "/assets/icon/SH.png": {
      dark: {
        type: "path",
        value: "/assets/icon/SH.png",
      },
      light: {
        type: "tint",
        value: {
          red: 35,
          green: 31,
          blue: 32
        }
      },
    },

    "/assets/icon/CR.png": {
      dark: {
        type: "path",
        value: "/assets/icon/CR.png",
      },
      light: {
        type: "tint",
        value: {
          red: 35,
          green: 31,
          blue: 32
        }
      },
    },
  },

  fallbackToOriginal: true,

  // Maps "<src>@<preset>" to an exclusive image entry.
  // When matched, the exclusive src is used directly — no tint applied.
  // strokeSrc (optional) overrides the auto-derived stroke path.
  exclusivePaths: {
    "/assets/icon/COST.png@red": {
      src: "/assets/icon/COST_red.png",
      strokeSrc: "/assets/icon/COST_s.png",
    },
  },
};

function emit() {
  version++;
  listeners.forEach((l) => l());
}

export function addCustomIcon(key, data) {
  CUSTOM_ICONS = {
    ...CUSTOM_ICONS,
    [key]: { ...data, custom: true }
  };
  emit();
}

export function removeCustomIcon(key) {
  const copy = { ...CUSTOM_ICONS };
  delete copy[key];
  CUSTOM_ICONS = copy;
  emit();
}

export function setTagAllowed(key, allowed) {
  CUSTOM_TAG_ALLOW = {
    ...CUSTOM_TAG_ALLOW,
    [key]: allowed
  };
  emit();
}

function getSnapshot() {
  if (cachedSnapshot && cachedVersion === version) {
    return cachedSnapshot;
  }

  const config = {
    exact: {
      ...ICON_CONFIG_BASE.exact,
      ...CUSTOM_ICONS
    },
    prefixes: ICON_CONFIG_BASE.prefixes
  };

  const tag = {
    ...COLOR_TAG_BASE,
    allow: {
      ...COLOR_TAG_BASE.allow,
      ...CUSTOM_TAG_ALLOW
    }
  };

  cachedSnapshot = { config, tag };
  cachedVersion = version;

  return cachedSnapshot;
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getServerSnapshot() {
  return getSnapshot();
}

export function useIconConfig() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  ).config;
}

export function useColorTag() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  ).tag;
}

export function hydrateCustomIcons(list) {
  const icons = {};
  const tags = {};

  for (const item of list) {
    if (!item.key) continue;

    icons[item.key] = {
      src: item.src,
      iconHeight: item.height || 11,
      iconYOffset: item.offset || 0,
      custom: true,
    };

    if (item.allowColor) {
      tags[item.key] = true;
    }
  }

  CUSTOM_ICONS = icons;
  CUSTOM_TAG_ALLOW = tags;

  emit();
}
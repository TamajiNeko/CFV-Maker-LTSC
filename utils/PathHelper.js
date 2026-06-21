import { getLanguage } from "./store/LanguageStore";

export const getLocalizedPath = (originalPath) => {
  if (!originalPath) return originalPath;

  if (originalPath.includes('race.png')) {
    return originalPath;
  }

  const currentLanguage = getLanguage();

  if (currentLanguage === 'th') {
    if (originalPath.includes('/assets/') && !originalPath.includes('/assets/th/')) {
      return originalPath.replace('/assets/', '/assets/th/');
    }
  }

  return originalPath;
};

export const getAssetPath = (filename, category = '', shouldLocalize = true) => {
  if (!filename) return null;

  if (filename.startsWith('/')) {
    return shouldLocalize ? getLocalizedPath(filename) : filename;
  }

  let fullPath = `/assets/${category}/${filename}`;

  return shouldLocalize ? getLocalizedPath(fullPath) : fullPath;
};

export const getBasePath = (filename, shouldLocalize = true) => {
  return getAssetPath(filename, 'base', shouldLocalize);
};

export const getPassivePath = (filename, shouldLocalize = true) => {
  return getAssetPath(filename, 'passive', shouldLocalize);
};

export const getTriggerPath = (filename, shouldLocalize = false) => {
  return getAssetPath(filename, 'trigger', shouldLocalize);
};

export const getNationPath = (filename, shouldLocalize = true) => {
  return getAssetPath(filename, 'base/nation', shouldLocalize);
};

export const getGradePath = (filename, shouldLocalize = true) => {
  return getAssetPath(filename, 'base/nation/grade', shouldLocalize);
};

export const getRacePath = (filename, shouldLocalize = true) => {
  return getAssetPath(filename, 'base', shouldLocalize);
};

export const getShieldPath = (filename, shouldLocalize = true) => {
  return getAssetPath(filename, 'base/shield', shouldLocalize);
};

export const getTagPath = (filename, shouldLocalize = true) => {
  return getAssetPath(filename, 'base/tag', shouldLocalize);
};

export const getClanPath = (filename, shouldLocalize = true) => {
  return getAssetPath(filename, 'base', shouldLocalize);
};
"use client";

import JSZip from "jszip";
import { saveAs } from "file-saver";

import { imageSrcToPngBlob } from "./CardIO";

import {
  addCustomIcon,
  setTagAllowed,
} from "./store/IconConfig";

import {
  saveIcon,
} from "../components/custom/Icon/DB";

export const exportIconsToZip = async (exactConfig) => {
  try {
    const zip = new JSZip();
    const imgFolder = zip.folder("images");

    const customKeys = Object.keys(exactConfig).filter(
      (key) => exactConfig[key].custom === true
    );

    if (customKeys.length === 0) {
      return { success: false };
    }

    const configData = customKeys.map((key) => ({
      key,
      srcFilename: `${key}.png`,

      height: exactConfig[key].iconHeight,
      offset: exactConfig[key].iconYOffset || 0,

      allowColor: exactConfig[key].allowColor || false,

      custom: true,
    }));

    for (const key of customKeys) {
      const item = exactConfig[key];

      const blob = await imageSrcToPngBlob(item.src);

      if (blob) {
        imgFolder.file(`${key}.png`, blob);
      }
    }

    zip.file(
      "config.json",
      JSON.stringify(configData, null, 2)
    );

    if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.saveFile) {
      const arrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
      const result = await window.electronAPI.saveFile(arrayBuffer, "custom-icons-config.zip");
      return result;
    } else {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "custom-icons-config.zip");
      return { success: true };
    }
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

const createImportedItem = ({
  file,
  src,
  config = {},
}) => {
  const fallbackKey =
    file.name.slice(0, file.name.lastIndexOf(".")) ||
    file.name;

  return {
    id: crypto.randomUUID(),

    key: config.key || fallbackKey,

    src,

    height: config.height ?? 11,
    offset: config.offset ?? 0,

    allowColor: config.allowColor ?? false,
  };
};

const registerImportedItem = async ({
  file,
  item,
}) => {
  addCustomIcon(item.key, {
    src: item.src,

    iconHeight: item.height,
    iconYOffset: item.offset,

    custom: true,
  });

  setTagAllowed(
    item.key,
    item.allowColor
  );

  await saveIcon(item, file);

  window.dispatchEvent(
    new CustomEvent("icon-config-changed")
  );

  return item;
};

export const importIconsFromZip = async (zipFile) => {
  try {
    const zip = await JSZip.loadAsync(zipFile);

    const configEntry = zip.file("config.json");

    const configText =
      await configEntry.async("string");

    const configData = JSON.parse(configText);

    const importedItems = [];

    for (const cfg of configData) {
      const imagePath = `images/${cfg.srcFilename}`;

      const imageEntry = zip.file(imagePath);

      if (!imageEntry) {
        continue;
      }

      const blob = await imageEntry.async("blob");

      const file = new File(
        [blob],
        cfg.srcFilename,
        {
          type: "image/png",
        }
      );

      const src = URL.createObjectURL(blob);

      const item = createImportedItem({
        file,
        src,
        config: {
          key: cfg.key,

          height: cfg.height,
          offset: cfg.offset,

          allowColor: cfg.allowColor,
        },
      });

      await registerImportedItem({
        file,
        item,
      });

      importedItems.push(item);
    }

    return {
      success: true,
      items: importedItems,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

export const importIconFromImage = async (imageFile, customConfig = {}) => {
  try {
    if (!imageFile) {
      return { success: false, error: "No file provided" };
    }

    const src = URL.createObjectURL(imageFile);

    const item = createImportedItem({
      file: imageFile,
      src,
      config: {
        key: customConfig.key || undefined,
        height: customConfig.height ?? 11,
        offset: customConfig.offset ?? 0,
        allowColor: customConfig.allowColor ?? false,
      },
    });

    await registerImportedItem({
      file: imageFile,
      item,
    });

    return {
      success: true,
      item,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};
"use client";
import JSZip from "jszip";
import { saveAs } from "file-saver";
const version = process.env.TEMPLATE_VERSION;

export const imageSrcToPngBlob = async (imageSrc) => {
  return new Promise((resolve) => {
    if (!imageSrc) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = imageSrc;
  });
};

export const exportCardToZip = async (cardData, imageSrc, imageConfig, cardName, customLayers) => {
  try {
    const zip = new JSZip();

    const configPayload = {
      version: version,
      exportedAt: new Date().toISOString(),
      card: {
        ...cardData,
        imageConfig: {
          scale: imageConfig.scale,
          x: imageConfig.x,
          y: imageConfig.y,
        },
      },
    };

    zip.file("config.json", JSON.stringify(configPayload, null, 2));

    if (imageSrc) {
      const pngBlob = await imageSrcToPngBlob(imageSrc);
      if (pngBlob) {
        zip.file("image.png", pngBlob);
      }
    }

    if (customLayers && customLayers.length > 0) {
      for (let i = 0; i < customLayers.length; i++) {
        const layer = customLayers[i];
        const layerBlob = await imageSrcToPngBlob(layer.src);
        if (layerBlob) {
          zip.file(`assets/layer_${i}.png`, layerBlob);
        }
      }
      zip.file("assets/layers.json", JSON.stringify(customLayers.map(l => ({
        id: l.id,
        name: l.name,
        visible: l.visible
      })), null, 2));
    }

    const safeName = (cardName || "card").replace(/[/\\?%*:|"<>]/g, "");

    if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.saveFile) {
      const arrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
      const result = await window.electronAPI.saveFile(arrayBuffer, `${safeName}.zip`);
      return result;
    } else {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${safeName}.zip`);
      return { success: true };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const previewZip = async (zipFile) => {
  try {
    const zip = await JSZip.loadAsync(zipFile);

    let configFile = zip.file("config.json");
    let abilitiesFile = zip.file("abilities.json");

    if (!configFile && !abilitiesFile) {
      return { success: false, error: "No config.json or abilities.json found" };
    }

    let data = null;
    let isOldStructure = false;

    if (configFile) {
      const text = await configFile.async("string");
      data = JSON.parse(text);
    } else if (abilitiesFile) {
      const text = await abilitiesFile.async("string");
      data = JSON.parse(text);
      isOldStructure = true;
    }

    let imageUrl = null;
    const imageFile = zip.file("image.png");
    if (imageFile) {
      const imageBlob = await imageFile.async("blob");
      imageUrl = URL.createObjectURL(imageBlob);
    }

    let customLayerUrls = [];
    const layersFile = zip.file("assets/layers.json");
    if (layersFile) {
      const layersText = await layersFile.async("string");
      const layersData = JSON.parse(layersText);
      for (let i = 0; i < layersData.length; i++) {
        const layerFile = zip.file(`assets/layer_${i}.png`);
        if (layerFile) {
          const layerBlob = await layerFile.async("blob");
          customLayerUrls.push({
            ...layersData[i],
            url: URL.createObjectURL(layerBlob)
          });
        }
      }
    } else {
      const oldFrameFile = zip.file("assets/frame.png");
      if (oldFrameFile) {
        const frameBlob = await oldFrameFile.async("blob");
        customLayerUrls.push({
          id: 'legacy-frame',
          name: 'Custom Frame',
          visible: true,
          url: URL.createObjectURL(frameBlob)
        });
      }
    }

    return {
      success: true,
      cardName: data.card?.cardName || "Untitled",
      hasImage: !!zip.file("image.png"),
      version: data.version,
      exportedAt: data.exportedAt,
      rawData: data.card,
      imageUrl,
      customLayerUrls
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const importCardFromZip = async (zipFile) => {
  try {
    const zip = await JSZip.loadAsync(zipFile);

    let configFile = zip.file("config.json");
    let abilitiesFile = zip.file("abilities.json");

    if (!configFile && !abilitiesFile) {
      throw new Error("No config.json or abilities.json found");
    }

    let cardData = null;
    let imageConfig = null;

    if (configFile) {
      const text = await configFile.async("string");
      const data = JSON.parse(text);
      cardData = data.card;
      imageConfig = data.card?.imageConfig;
    } else if (abilitiesFile) {
      const text = await abilitiesFile.async("string");
      const data = JSON.parse(text);
      cardData = data.card;
      imageConfig = data.card?.imageConfig;
    }

    let imageUrl = null;
    let imageBlob = null;
    const imageFile = zip.file("image.png");

    if (imageFile) {
      imageBlob = await imageFile.async("blob");
      imageUrl = URL.createObjectURL(imageBlob);
    }

    let customLayers = [];
    const layersFile = zip.file("assets/layers.json");
    if (layersFile) {
      const layersText = await layersFile.async("string");
      const layersData = JSON.parse(layersText);
      for (let i = 0; i < layersData.length; i++) {
        const layerFile = zip.file(`assets/layer_${i}.png`);
        if (layerFile) {
          const layerBlob = await layerFile.async("blob");
          customLayers.push({
            ...layersData[i],
            src: URL.createObjectURL(layerBlob)
          });
        }
      }
    } else {
      const oldFrameFile = zip.file("assets/frame.png");
      if (oldFrameFile) {
        const frameBlob = await oldFrameFile.async("blob");
        customLayers.push({
          id: `layer-legacy-${Date.now()}`,
          name: 'Custom Frame',
          visible: true,
          src: URL.createObjectURL(frameBlob)
        });
      }
    }

    return {
      success: true,
      cardData: cardData,
      imageConfig: imageConfig,
      imageUrl,
      imageBlob,
      customLayers,
      version: cardData?.version,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
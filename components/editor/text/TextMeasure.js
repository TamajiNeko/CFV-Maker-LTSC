let measureCanvas = null;

export const getFontStyle = (italic, dark, lang) => {
  if (dark || lang == "th") {
    return italic ? "italic 500" : "500";
  }
  return italic ? "italic bold" : "bold";
};

export const getTextWidth = (text, fontSize, fontStyle, font) => {
  if (!measureCanvas) {
    measureCanvas = document.createElement("canvas").getContext("2d");
  }

  measureCanvas.font = `${fontStyle} ${fontSize}px "${font}"`;
  return measureCanvas.measureText(text).width;
};
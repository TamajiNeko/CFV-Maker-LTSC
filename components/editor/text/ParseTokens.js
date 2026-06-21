export function ParseTokens(text, ICON_CONFIG, darkMode = false, inheritedStyles = {}) {
  const tokens = [];
  let i = 0;

  const exactKeys = Object.keys(ICON_CONFIG.exact).sort((a, b) => b.length - a.length);
  const prefixKeys = Object.keys(ICON_CONFIG.prefixes);

  let currentStyles = {
    underline: inheritedStyles.underline || false,
    color: inheritedStyles.color || null,
    italic: inheritedStyles.italic || false
  };

  while (i < text.length) {
    let matched = false;

    if (text.startsWith("__", i)) {
      const end = text.indexOf("__", i + 2);
      if (end !== -1) {
        const innerTokens = ParseTokens(
          text.slice(i + 2, end),
          ICON_CONFIG,
          darkMode,
          { ...currentStyles, underline: true }
        );
        tokens.push(...innerTokens);
        i = end + 2;
        continue;
      } else {
        i++;
        continue;
      }
    }

    if (text.startsWith("*__", i)) {
      const end = text.indexOf("__*", i + 3);
      if (end !== -1) {
        const innerTokens = ParseTokens(
          text.slice(i + 3, end),
          ICON_CONFIG,
          darkMode,
          {
            ...currentStyles,
            color: darkMode ? "#c0c0c0" : "#525252",
            italic: true,
            underline: true
          }
        );
        tokens.push(...innerTokens);
        i = end + 3;
        continue;
      } else {
        i++;
        continue;
      }
    }

    if (text.startsWith("/**", i)) {
      const end = text.indexOf("**/", i + 3);
      if (end !== -1) {
        const innerTokens = ParseTokens(
          text.slice(i + 3, end),
          ICON_CONFIG,
          darkMode,
          { ...currentStyles, color: "#ff0000", italic: true }
        );
        tokens.push(...innerTokens);
        i = end + 3;
        continue;
      } else {
        i++;
        continue;
      }
    }

    if (text.startsWith("/*", i)) {
      const end = text.indexOf("*/", i + 2);
      if (end !== -1) {
        const innerTokens = ParseTokens(
          text.slice(i + 2, end),
          ICON_CONFIG,
          darkMode,
          { ...currentStyles, color: "#ff0000" }
        );
        tokens.push(...innerTokens);
        i = end + 2;
        continue;
      } else {
        i++;
        continue;
      }
    }

    if (text[i] === "*" && !text.startsWith("/*", i) && !text.startsWith("/**", i)) {
      let closeIndex = -1;
      let nestLevel = 1;
      let pos = i + 1;

      while (pos < text.length && nestLevel > 0) {
        if (text[pos] === "*" && !text.startsWith("/*", pos) && !text.startsWith("/**", pos)) {
          const isClosing = true;
          nestLevel--;
          if (nestLevel === 0) {
            closeIndex = pos;
            break;
          }
          pos++;
        } else if (text.startsWith("__", pos) || text.startsWith("/*", pos) || text.startsWith("/**", pos)) {
          pos++;
        } else {
          pos++;
        }
      }

      if (closeIndex !== -1) {
        const innerText = text.slice(i + 1, closeIndex);
        const innerTokens = ParseTokens(
          innerText,
          ICON_CONFIG,
          darkMode,
          {
            ...currentStyles,
            color: darkMode ? "#c0c0c0" : "#525252",
            italic: true
          }
        );
        tokens.push(...innerTokens);
        i = closeIndex + 1;
        continue;
      } else {
        tokens.push({
          type: "text",
          parts: [{
            text: "*",
            color: currentStyles.color || (darkMode ? "white" : "black"),
            italic: currentStyles.italic,
            underline: currentStyles.underline
          }]
        });
        i++;
        continue;
      }
    }

    for (const prefix of prefixKeys) {
      const slice = text.slice(i);
      const regex = new RegExp(`^${prefix}\\((\\d+)\\)`);
      const match = slice.match(regex);

      if (match && slice.startsWith(prefix + "(")) {
        const value = parseInt(match[1], 10);
        const config = ICON_CONFIG.prefixes[prefix];

        let isValidValue = true;
        if (config.valueRange) {
          isValidValue = value >= config.valueRange.min && value <= config.valueRange.max;
        }

        if (isValidValue) {
          tokens.push({
            type: "dynamic_icon",
            prefix: prefix,
            value: match[1],
            config: { ...config, name: prefix },
            underline: currentStyles.underline,
            color: currentStyles.color,
            italic: currentStyles.italic
          });
          i += match[0].length;
          matched = true;
          break;
        }
      }
    }
    if (matched) continue;

    for (const prefix of prefixKeys) {
      if (text.startsWith(prefix, i)) {
        if (text[i + prefix.length] === "(") continue;

        const config = ICON_CONFIG.prefixes[prefix];

        if (config.allowPlain === true) {
          tokens.push({
            type: "plain_icon",
            prefix: prefix,
            src: config.baseSrc,
            config: config,
            underline: currentStyles.underline,
            color: currentStyles.color,
            italic: currentStyles.italic
          });
        } else {
          for (let c = 0; c < prefix.length; c++) {
            tokens.push({
              type: "text",
              parts: [{
                text: prefix[c],
                color: currentStyles.color || (darkMode ? "white" : "black"),
                italic: currentStyles.italic,
                underline: currentStyles.underline
              }]
            });
          }
        }
        i += prefix.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    for (const key of exactKeys) {
      if (text.startsWith(key, i)) {
        let presetName = "";
        let skipLength = key.length;

        if (text.startsWith("@[", i + key.length)) {
          const startBracket = i + key.length + 2;
          const endBracket = text.indexOf("]", startBracket);

          if (endBracket !== -1) {
            presetName = text.slice(startBracket, endBracket);
            skipLength = (endBracket + 1) - i;
          }
        }

        tokens.push({
          type: "icon",
          keyword: key,
          src: ICON_CONFIG.exact[key].src + (presetName ? "@" + presetName : ""),
          meta: ICON_CONFIG.exact[key],
          underline: currentStyles.underline,
          color: currentStyles.color,
          italic: currentStyles.italic
        });

        i += skipLength;
        matched = true;
        break;
      }
    }

    if (matched) continue;

    let j = i;
    while (j < text.length) {
      let found = false;

      if (
        text.startsWith("__", j) ||
        text.startsWith("/*", j) ||
        text.startsWith("/**", j) ||
        (text[j] === "*" && !text.startsWith("/*", j) && !text.startsWith("/**", j))
      ) {
        found = true;
      }

      for (const prefix of prefixKeys) {
        if (
          text.startsWith(prefix, j) ||
          text.slice(j).match(new RegExp(`^${prefix}\\(\\d+\\)`))
        ) {
          found = true;
          break;
        }
      }

      for (const key of exactKeys) {
        if (text.startsWith(key, j)) {
          found = true;
          break;
        }
      }

      if (found) break;
      j++;
    }

    if (j > i) {
      tokens.push({
        type: "text",
        parts: [{
          text: text.slice(i, j),
          color: currentStyles.color || (darkMode ? "white" : "black"),
          italic: currentStyles.italic,
          underline: currentStyles.underline
        }]
      });
      i = j;
    } else {
      i++;
    }
  }

  return tokens;
}
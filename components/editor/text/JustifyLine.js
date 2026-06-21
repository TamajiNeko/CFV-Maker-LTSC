const segmenter = new Intl.Segmenter(['th', 'ja'], { granularity: 'word' });

export function JustifyLine(line, maxWidth, fontSize, measureTextFn) {
  if (line.length === 0) return line;

  let processedLine = [];
  for (const node of line) {
    if (node.type === "text" && !/^\s+$/.test(node.text)) {
      const segments = Array.from(segmenter.segment(node.text)).map(s => s.segment);
      
      if (segments.length > 1 && measureTextFn) {
        segments.forEach(word => {
          processedLine.push({
            ...node,
            text: word,
            width: measureTextFn(word, fontSize)
          });
        });
      } else {
        processedLine.push(node);
      }
    } else {
      processedLine.push(node); 
    }
  }

  if (processedLine.length <= 1) return processedLine;

  const totalWidth = processedLine.reduce((acc, n) => acc + (n.width || 0), 0);
  const spaceNodes = processedLine.filter(n => n.type === "text" && /^\s+$/.test(n.text));
  
  if (totalWidth >= maxWidth) return processedLine;

  const diff = maxWidth - totalWidth;
  let currentX = 0;

  if (spaceNodes.length > 0) {
    const extraPerSpace = diff / spaceNodes.length;
    
    return processedLine.map((node) => {
      const isSpace = node.type === "text" && /^\s+$/.test(node.text);
      const finalWidth = isSpace ? node.width + extraPerSpace : node.width;
      
      const newNode = {
        ...node,
        x: currentX,
        width: finalWidth,
        isExpandedSpace: isSpace
      };

      currentX += finalWidth;
      return newNode;
    });
  }

  const gapsCount = processedLine.length - 1;
  const extraPerGap = diff / gapsCount;

  return processedLine.map((node, index) => {
    const gapWidth = (index < gapsCount) ? extraPerGap : 0;
    
    const newNode = {
      ...node,
      x: currentX,
      width: node.width, 
      extraGapAfter: gapWidth
    };

    currentX += node.width + gapWidth; 
    return newNode;
  });
}
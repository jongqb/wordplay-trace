import { Language } from '../types';

export interface SpellingVerificationResult {
  passed: boolean;
  stars: number;
  precision: number;
  recall: number;
  f1Score: number;
  feedback: string;
}

/**
 * High-accuracy handwriting & spelling recognition verifier.
 * Compares drawn canvas ink against the target word geometry to strictly prevent
 * random scribbles from passing, while providing forgiving tolerance for kid handwriting.
 */
export function verifySpelling(
  canvas: HTMLCanvasElement,
  targetWord: string,
  language: Language,
  strokeCount: number
): SpellingVerificationResult {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return {
      passed: false,
      stars: 1,
      precision: 0,
      recall: 0,
      f1Score: 0,
      feedback: 'Please write the word on the lines.',
    };
  }

  // 1. Downsample canvas into a 160x80 grid for fast, robust spatial analysis (6x6 px per cell)
  const GRID_W = 160;
  const GRID_H = 80;
  const CELL_X = width / GRID_W;
  const CELL_Y = height / GRID_H;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const drawnGrid = new Uint8Array(GRID_W * GRID_H);
  let drawnCellCount = 0;
  let minGx = GRID_W;
  let maxGx = 0;
  let minGy = GRID_H;
  let maxGy = 0;

  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      // Sample central and corner pixels of each 6x6 block
      const startX = Math.floor(gx * CELL_X);
      const startY = Math.floor(gy * CELL_Y);
      const endX = Math.min(width, Math.floor((gx + 1) * CELL_X));
      const endY = Math.min(height, Math.floor((gy + 1) * CELL_Y));

      let hasInk = false;
      for (let py = startY; py < endY; py += 2) {
        for (let px = startX; px < endX; px += 2) {
          const idx = (py * width + px) * 4;
          if (data[idx + 3] > 40) {
            hasInk = true;
            break;
          }
        }
        if (hasInk) break;
      }

      if (hasInk) {
        drawnGrid[gy * GRID_W + gx] = 1;
        drawnCellCount++;
        if (gx < minGx) minGx = gx;
        if (gx > maxGx) maxGx = gx;
        if (gy < minGy) minGy = gy;
        if (gy > maxGy) maxGy = gy;
      }
    }
  }

  // Check 1: Insufficient ink (too faint or blank)
  if (drawnCellCount < 30) {
    return {
      passed: false,
      stars: 1,
      precision: 0,
      recall: 0,
      f1Score: 0,
      feedback: `Please write the letters of "${targetWord}" on the lines!`,
    };
  }

  const drawnWidthG = maxGx - minGx + 1;
  const drawnHeightG = maxGy - minGy + 1;
  const charCount = targetWord.length;

  // Check 2: Spatial width distribution for multi-character words
  // An N-letter word cannot be squished into a tiny single scribble spot
  if (language !== 'zh' && charCount >= 3) {
    const minExpectedWidthG = Math.max(22, charCount * 7.5);
    if (drawnWidthG < minExpectedWidthG) {
      return {
        passed: false,
        stars: 1,
        precision: 0.2,
        recall: 0.3,
        f1Score: 0.25,
        feedback: `Try writing all ${charCount} letters of "${targetWord}" spaced out across the line!`,
      };
    }
  }

  // Check 3: Multi-character horizontal distribution
  // For a word like "CAT" (3 letters), ink must exist in at least 70% of horizontal character slots
  if (language !== 'zh' && charCount >= 2) {
    const slotWidthG = drawnWidthG / charCount;
    let coveredSlots = 0;
    for (let s = 0; s < charCount; s++) {
      const slotStart = minGx + s * slotWidthG;
      const slotEnd = minGx + (s + 1) * slotWidthG;
      let slotHasInk = false;
      for (let gx = Math.floor(slotStart); gx <= Math.ceil(slotEnd); gx++) {
        for (let gy = minGy; gy <= maxGy; gy++) {
          if (drawnGrid[gy * GRID_W + gx] === 1) {
            slotHasInk = true;
            break;
          }
        }
        if (slotHasInk) break;
      }
      if (slotHasInk) coveredSlots++;
    }

    if (charCount >= 3 && coveredSlots < Math.ceil(charCount * 0.6)) {
      return {
        passed: false,
        stars: 1,
        precision: 0.25,
        recall: 0.35,
        f1Score: 0.3,
        feedback: `Make sure to write every letter from left to right: "${targetWord}".`,
      };
    }
  }

  // 2. Render target glyph template on an offscreen canvas
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d');

  if (!offCtx) {
    return {
      passed: true,
      stars: 2,
      precision: 0.6,
      recall: 0.6,
      f1Score: 0.6,
      feedback: 'Good effort!',
    };
  }

  // Compute font size matching the canvas notebook lines
  // Baseline is at y = 394 (82% of 480). Top line is at y = 77 (16% of 480).
  // Midline is at y = 230 (48% of 480).
  const maxAvailableWidth = width * 0.85;
  let targetFontSize = language === 'zh' ? 220 : 160;
  if (charCount > 4) {
    targetFontSize = Math.min(160, Math.floor(maxAvailableWidth / (charCount * 0.72)));
  }
  targetFontSize = Math.max(70, targetFontSize);

  const evaluateWithAlignment = (
    centerX: number,
    baselineY: number,
    fontSize: number
  ): { precision: number; recall: number; f1: number } => {
    offCtx.clearRect(0, 0, width, height);
    offCtx.font = `900 ${fontSize}px "Fredoka", "Quicksand", "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'alphabetic';
    offCtx.fillStyle = '#000000';
    offCtx.strokeStyle = '#000000';
    // Stroke width simulates child's writing thickness (approx 26-30px)
    offCtx.lineWidth = Math.max(18, Math.round(fontSize * 0.18));
    offCtx.lineJoin = 'round';
    offCtx.lineCap = 'round';

    offCtx.strokeText(targetWord, centerX, baselineY);
    offCtx.fillText(targetWord, centerX, baselineY);

    const targetImgData = offCtx.getImageData(0, 0, width, height).data;
    const targetGrid = new Uint8Array(GRID_W * GRID_H);
    let targetCellCount = 0;

    for (let gy = 0; gy < GRID_H; gy++) {
      for (let gx = 0; gx < GRID_W; gx++) {
        const startX = Math.floor(gx * CELL_X);
        const startY = Math.floor(gy * CELL_Y);
        const endX = Math.min(width, Math.floor((gx + 1) * CELL_X));
        const endY = Math.min(height, Math.floor((gy + 1) * CELL_Y));

        let hasTarget = false;
        for (let py = startY; py < endY; py += 2) {
          for (let px = startX; px < endX; px += 2) {
            if (targetImgData[(py * width + px) * 4 + 3] > 40) {
              hasTarget = true;
              break;
            }
          }
          if (hasTarget) break;
        }

        if (hasTarget) {
          targetGrid[gy * GRID_W + gx] = 1;
          targetCellCount++;
        }
      }
    }

    if (targetCellCount === 0) {
      return { precision: 0.5, recall: 0.5, f1: 0.5 };
    }

    // Dilate target grid by 2 cells (gives ~12px tolerance for child handwriting variance)
    const dilatedTarget = new Uint8Array(GRID_W * GRID_H);
    const DILATION_RADIUS = 2;

    for (let gy = 0; gy < GRID_H; gy++) {
      for (let gx = 0; gx < GRID_W; gx++) {
        if (targetGrid[gy * GRID_W + gx] === 1) {
          for (let dy = -DILATION_RADIUS; dy <= DILATION_RADIUS; dy++) {
            const ny = gy + dy;
            if (ny < 0 || ny >= GRID_H) continue;
            for (let dx = -DILATION_RADIUS; dx <= DILATION_RADIUS; dx++) {
              const nx = gx + dx;
              if (nx < 0 || nx >= GRID_W) continue;
              dilatedTarget[ny * GRID_W + nx] = 1;
            }
          }
        }
      }
    }

    // Compute precision: What fraction of child's drawn ink touches target strokes?
    // SCRIBBLING severely degrades precision because scribbles wander through blank space!
    let drawnHits = 0;
    for (let i = 0; i < drawnGrid.length; i++) {
      if (drawnGrid[i] === 1 && dilatedTarget[i] === 1) {
        drawnHits++;
      }
    }
    const precision = drawnHits / drawnCellCount;

    // Compute recall: What fraction of target letter strokes were covered by child?
    // MISSING LETTERS severely degrades recall!
    let targetHits = 0;
    for (let gy = 0; gy < GRID_H; gy++) {
      for (let gx = 0; gx < GRID_W; gx++) {
        if (targetGrid[gy * GRID_W + gx] === 1) {
          let touched = false;
          // check within 2 cells of drawn ink
          for (let dy = -DILATION_RADIUS; dy <= DILATION_RADIUS && !touched; dy++) {
            const ny = gy + dy;
            if (ny < 0 || ny >= GRID_H) continue;
            for (let dx = -DILATION_RADIUS; dx <= DILATION_RADIUS; dx++) {
              const nx = gx + dx;
              if (nx < 0 || nx >= GRID_W) continue;
              if (drawnGrid[ny * GRID_W + nx] === 1) {
                touched = true;
                break;
              }
            }
          }
          if (touched) targetHits++;
        }
      }
    }
    const recall = targetHits / targetCellCount;

    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    return { precision, recall, f1 };
  };

  // Alignment 1: Standard Notebook Guideline Alignment (center of canvas, baseline at 388px)
  const standardMatch = evaluateWithAlignment(width / 2, 388, targetFontSize);

  // Alignment 2: Adaptive Bounding-Box Alignment
  // (In case the child wrote slightly higher, smaller, or shifted to left/right)
  const drawnCenterPixelX = ((minGx + maxGx) / 2) * CELL_X;
  const drawnBottomPixelY = maxGy * CELL_Y;
  // Estimate target font size matching child's drawn height
  const childDrawnHeightPx = drawnHeightG * CELL_Y;
  const adaptiveFontSize = Math.max(50, Math.min(220, Math.round(childDrawnHeightPx * 0.95)));

  const adaptiveMatch = evaluateWithAlignment(
    drawnCenterPixelX,
    drawnBottomPixelY - Math.round(adaptiveFontSize * 0.1),
    adaptiveFontSize
  );

  // Pick the best match between standard and adaptive
  const bestMatch = standardMatch.f1 >= adaptiveMatch.f1 ? standardMatch : adaptiveMatch;
  const { precision, recall, f1 } = bestMatch;

  // Additional check: Detect wild continuous scribbles
  // If word is multi-letter (>= 3 letters) and only 1 continuous stroke covers a huge area with low precision
  const isWildSingleStroke =
    charCount >= 3 &&
    strokeCount <= 1 &&
    drawnCellCount > 250 &&
    precision < 0.48;

  if (isWildSingleStroke) {
    return {
      passed: false,
      stars: 1,
      precision,
      recall,
      f1Score: f1,
      feedback: `Looks like a continuous scribble! Please lift your pen to write each separate letter of "${targetWord}".`,
    };
  }

  // Grading Thresholds:
  // F1 < 0.45 or precision < 0.38 or recall < 0.38 -> FAIL (1 Star)
  // Scribbles typically have precision < 0.32 or F1 < 0.38 and will cleanly FAIL.
  if (precision < 0.38) {
    return {
      passed: false,
      stars: 1,
      precision,
      recall,
      f1Score: f1,
      feedback: `Too many extra scribbles outside the letters! Try writing only "${targetWord}".`,
    };
  }

  if (recall < 0.38) {
    return {
      passed: false,
      stars: 1,
      precision,
      recall,
      f1Score: f1,
      feedback: `Some letters seem missing! Remember to write all the letters of "${targetWord}".`,
    };
  }

  if (f1 < 0.46) {
    return {
      passed: false,
      stars: 1,
      precision,
      recall,
      f1Score: f1,
      feedback: `That doesn't quite match "${targetWord}". Use "Peek Word" if you need a hint!`,
    };
  }

  // 2 Stars: Solid pass with some small handwriting irregularities
  if (f1 < 0.66) {
    return {
      passed: true,
      stars: 2,
      precision,
      recall,
      f1Score: f1,
      feedback: `Good spelling! You got the letters right for "${targetWord}"!`,
    };
  }

  // 3 Stars: Superb accurate writing
  return {
    passed: true,
    stars: 3,
    precision,
    recall,
    f1Score: f1,
    feedback: `Superb spelling! Outstanding handwriting for "${targetWord}"!`,
  };
}

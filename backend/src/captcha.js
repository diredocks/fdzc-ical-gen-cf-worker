import { decode } from "fast-bmp";
import { charDict } from "./const.js";

const extractRedChannel = (data, size, channels = 3, threshold = 235) => {
  const pixels = Math.floor(size / channels);
  const binary = new Uint8Array(pixels);
  for (let i = 0; i < pixels; i++) {
    binary[i] = data[i * channels] > threshold ? 1 : 0;
  }
  return binary;
};

const splitPixels = (data, height = 10, width = 40, col_width = 10) => {
  const segments = [];
  const numSegments = Math.floor(width / col_width);
  
  for (let seg = 0; seg < numSegments; seg++) {
    const segment = new Uint8Array(height * col_width);
    let destIndex = 0;
    
    for (let row = 0; row < height; row++) {
      const sourceStart = row * width + seg * col_width;
      const sourceEnd = sourceStart + col_width;
      
      for (let sourceIndex = sourceStart; sourceIndex < sourceEnd; sourceIndex++) {
        segment[destIndex++] = data[sourceIndex];
      }
    }
    segments.push(segment);
  }
  
  return segments;
};

const xorSum = (a, b) => {
  const len = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < len; i++) {
    sum += a[i] ^ b[i];
  }
  return sum;
};

export const recognizeCaptcha = (img) => {
  const { data, width, height, channels } = decode(img);
  const segments = splitPixels(
    extractRedChannel(data, width * height * channels, channels),
    height,
    width
  );
  
  return segments
    .map(segment => 
      Object.entries(charDict)
        .reduce((best, [char, pattern]) => 
          xorSum(segment, pattern) < best.score 
            ? { char, score: xorSum(segment, pattern) }
            : best,
          { char: '', score: Infinity }
        ).char
    )
    .join('');
};

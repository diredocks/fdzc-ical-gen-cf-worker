import { decode } from "fast-bmp";
import { charDict } from "./const.js";

function extractRedChannel(data, size, channels = 3, threshold = 235) {
  const numPixels = Math.floor(size / channels);
  const binary = new Uint8Array(numPixels);
  for (let i = 0; i < numPixels; i++) {
    binary[i] = data[i * channels] > threshold ? 1 : 0; // red channel
  }
  return binary;
}

function splitPixels(data, height = 10, width = 40, col_width = 10) {
  const numSegments = Math.floor(width / col_width);
  const segments = [];

  for (let seg = 0; seg < numSegments; seg++) {
    const segment = new Uint8Array(height * col_width);
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < col_width; col++) {
        const sourceIndex = row * width + seg * col_width + col;
        const destIndex = row * col_width + col;
        segment[destIndex] = data[sourceIndex];
      }
    }
    segments.push(segment);
  }

  return segments;
}

function xorSum(uint8Array, array) {
  let sum = 0;
  const len = Math.min(uint8Array.length, array.length);
  for (let i = 0; i < len; i++) {
    sum += uint8Array[i] ^ array[i];
  }
  return sum;
}

export function recognizeCaptcha(img) {
  let captcha = "";
  const { data, width, height, channels } = decode(img);
  const splited = splitPixels(
    extractRedChannel(data, width * height * channels, channels),
    height,
    width,
  );
  for (const each of splited) {
    let similarity = [];
    for (const [c, p] of Object.entries(charDict)) {
      similarity.push([c, xorSum(each, p)]);
    }
    const result = similarity.reduce((min, [char, val]) =>
      val < min[1] ? [char, val] : min,
    )[0];
    captcha += result;
  }
  return captcha;
}

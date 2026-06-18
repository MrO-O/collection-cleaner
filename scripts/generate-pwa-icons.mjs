import { Buffer } from 'node:buffer';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';

const outputDirectory = resolve('public');

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);

  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));

  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function pointInRoundedRectangle(x, y, left, top, right, bottom, radius) {
  const nearestX = Math.max(left + radius, Math.min(x, right - radius));
  const nearestY = Math.max(top + radius, Math.min(y, bottom - radius));
  const dx = x - nearestX;
  const dy = y - nearestY;

  return x >= left && x <= right && y >= top && y <= bottom && dx * dx + dy * dy <= radius * radius;
}

function pointInPolygon(x, y, points) {
  let inside = false;

  for (
    let current = 0, previous = points.length - 1;
    current < points.length;
    previous = current, current += 1
  ) {
    const [currentX, currentY] = points[current];
    const [previousX, previousY] = points[previous];
    const crosses = currentY > y !== previousY > y;
    const intersectionX =
      ((previousX - currentX) * (y - currentY)) / (previousY - currentY) + currentX;

    if (crosses && x < intersectionX) {
      inside = !inside;
    }
  }

  return inside;
}

function distanceToSegment(x, y, startX, startY, endX, endY) {
  const dx = endX - startX;
  const dy = endY - startY;
  const lengthSquared = dx * dx + dy * dy;
  const progress = Math.max(
    0,
    Math.min(1, ((x - startX) * dx + (y - startY) * dy) / lengthSquared),
  );
  const nearestX = startX + progress * dx;
  const nearestY = startY + progress * dy;

  return Math.hypot(x - nearestX, y - nearestY);
}

function sampleColor(x, y) {
  const green = [7, 95, 70];
  const cream = [250, 247, 237];
  const bookmark = [7, 95, 70];
  const bookmarkPoints = [
    [0.34, 0.28],
    [0.66, 0.28],
    [0.66, 0.72],
    [0.5, 0.61],
    [0.34, 0.72],
  ];

  if (pointInRoundedRectangle(x, y, 0.2, 0.14, 0.8, 0.86, 0.085)) {
    if (pointInPolygon(x, y, bookmarkPoints)) {
      const onCheck =
        distanceToSegment(x, y, 0.41, 0.5, 0.48, 0.57) <= 0.03 ||
        distanceToSegment(x, y, 0.48, 0.57, 0.61, 0.42) <= 0.03;

      return onCheck ? cream : bookmark;
    }

    return cream;
  }

  return green;
}

function createPng(size) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  const sampleOffsets = [0.25, 0.75];

  for (let y = 0; y < size; y += 1) {
    const rowOffset = y * stride;
    raw[rowOffset] = 0;

    for (let x = 0; x < size; x += 1) {
      const channels = [0, 0, 0];

      for (const offsetY of sampleOffsets) {
        for (const offsetX of sampleOffsets) {
          const color = sampleColor((x + offsetX) / size, (y + offsetY) / size);
          channels[0] += color[0];
          channels[1] += color[1];
          channels[2] += color[2];
        }
      }

      const pixelOffset = rowOffset + 1 + x * 4;
      raw[pixelOffset] = Math.round(channels[0] / 4);
      raw[pixelOffset + 1] = Math.round(channels[1] / 4);
      raw[pixelOffset + 2] = Math.round(channels[2] / 4);
      raw[pixelOffset + 3] = 255;
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const [filename, size] of [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  const outputPath = resolve(outputDirectory, filename);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, createPng(size));
}

/**
 * 图标生成脚本 - 无需外部依赖
 * 运行方式: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Minimal PNG encoder
function createPNG(width, height, rgba) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk - raw pixel data
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter none
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      rawData.push(rgba[idx], rgba[idx + 1], rgba[idx + 2], rgba[idx + 3]);
    }
  }

  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc >>>= 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function generateIcon(size, outputPath) {
  const rgba = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const radius = size * 0.47;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background circle
      if (dist <= radius) {
        // Gradient from #FF6B6B to #FF8E8E
        const t = (x + y) / (size * 2);
        const r = Math.round(255 + (255 - 255) * t * 0.2);
        const g = Math.round(107 + (142 - 107) * t);
        const b = Math.round(107 + (142 - 107) * t);

        rgba[idx] = r;
        rgba[idx + 1] = g;
        rgba[idx + 2] = b;
        rgba[idx + 3] = 255;

        // Tomato shape (centered)
        const tomatoR = size * 0.28;
        const tomatoCY = center + size * 0.04;
        const tdx = x - center;
        const tdy = y - tomatoCY;
        const tdist = Math.sqrt(tdx * tdx + tdy * tdy);

        if (tdist <= tomatoR) {
          // Tomato body - red
          rgba[idx] = 255;
          rgba[idx + 1] = 68;
          rgba[idx + 2] = 68;
          rgba[idx + 3] = 255;

          // Highlight
          const hdx = x - (center - size * 0.08);
          const hdy = y - (tomatoCY - size * 0.08);
          const hdist = Math.sqrt(hdx * hdx + hdy * hdy);
          if (hdist <= tomatoR * 0.35) {
            rgba[idx] = Math.min(255, rgba[idx] + 60);
            rgba[idx + 1] = Math.min(255, rgba[idx + 1] + 60);
            rgba[idx + 2] = Math.min(255, rgba[idx + 2] + 60);
          }
        }

        // Stem
        if (Math.abs(x - center) <= size * 0.02 &&
            y >= tomatoCY - tomatoR - size * 0.1 &&
            y <= tomatoCY - tomatoR) {
          rgba[idx] = 76;
          rgba[idx + 1] = 175;
          rgba[idx + 2] = 80;
          rgba[idx + 3] = 255;
        }
      } else {
        // Transparent outside circle
        rgba[idx] = 0;
        rgba[idx + 1] = 0;
        rgba[idx + 2] = 0;
        rgba[idx + 3] = 0;
      }
    }
  }

  const png = createPNG(size, size, rgba);
  fs.writeFileSync(outputPath, png);
  console.log(`Generated: ${outputPath}`);
}

// Generate icons
const imagesDir = path.join(__dirname, 'assets', 'images');

generateIcon(192, path.join(imagesDir, 'icon-192.png'));
generateIcon(512, path.join(imagesDir, 'icon-512.png'));

console.log('Icons generated successfully!');

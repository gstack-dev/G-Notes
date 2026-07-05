import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const pngPath = path.join(root, "screen.png");

if (!fs.existsSync(pngPath)) {
  console.error("screen.png not found at", pngPath);
  process.exit(1);
}

const png = fs.readFileSync(pngPath);

// --- .ico (Windows) ---
const icoSize = png.length;
const icoBuf = Buffer.alloc(22);
icoBuf.writeUInt16LE(0, 0);
icoBuf.writeUInt16LE(1, 2);
icoBuf.writeUInt16LE(1, 4);
icoBuf.writeUInt8(0, 6);
icoBuf.writeUInt8(0, 7);
icoBuf.writeUInt8(0, 8);
icoBuf.writeUInt8(0, 9);
icoBuf.writeUInt16LE(1, 10);
icoBuf.writeUInt16LE(32, 12);
icoBuf.writeUInt32LE(icoSize, 14);
icoBuf.writeUInt32LE(22, 18);

const icoPath = path.join(root, "screen.ico");
fs.writeFileSync(icoPath, Buffer.concat([icoBuf, png]));
console.log(`Wrote ${icoPath} (${22 + icoSize} bytes)`);

// --- .icns (macOS) ---
const types = ["ic07", "ic08", "ic09", "ic10", "ic11", "ic12", "ic13", "ic14"];
const headerSize = 8;
let dataSize = 0;
for (const _ of types) dataSize += 8 + png.length;

const icnsBuf = Buffer.alloc(headerSize + dataSize);
let offset = 0;
icnsBuf.write("icns", 0, 4, "ascii");
icnsBuf.writeUInt32BE(headerSize + dataSize, 4);
offset = 8;

for (const type of types) {
  icnsBuf.write(type, offset, 4, "ascii");
  icnsBuf.writeUInt32BE(8 + png.length, offset + 4);
  png.copy(icnsBuf, offset + 8);
  offset += 8 + png.length;
}

const icnsPath = path.join(root, "screen.icns");
fs.writeFileSync(icnsPath, icnsBuf);
console.log(`Wrote ${icnsPath} (${icnsBuf.length} bytes, ${types.length} icons)`);

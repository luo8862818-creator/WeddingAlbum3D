import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const source = path.join(projectRoot, "node_modules", "gsap", "dist", "gsap.min.js");
const vendorDirectory = path.join(projectRoot, "vendor");
const target = path.join(vendorDirectory, "gsap.min.js");

await mkdir(vendorDirectory, { recursive: true });
await copyFile(source, target);
console.log("GSAP browser bundle copied to vendor/gsap.min.js");

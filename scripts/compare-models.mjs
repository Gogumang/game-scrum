import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createOpenAI } from "@ai-sdk/openai";
import { generateImage } from "ai";

for (const f of [".env.local", ".env"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2];
  }
}

const STYLE = [
  "Bright and cheerful 1990s Japanese comedy-fantasy RPG anime illustration, wide landscape composition.",
  "Super-deformed two-heads-tall characters with big round heads and tiny bodies, seen from behind or in profile, no detailed facial features.",
  "Thick even dark-brown outlines on every shape, flat cel shading, no gradients, no airbrush, no photorealism.",
  "Bold saturated storybook palette: sky blue, grass green, warm cream, coral red, sunny yellow, soft purple.",
  "Light-hearted gag-comedy mood even when the situation is dangerous. Clean shapes, generous open space, easy to read at a glance.",
  "No text, no letters, no numbers, no logos, no UI, no frame, no border, no watermark, no signature.",
].join(" ");

const SCENE =
  "A tiny hero in a pointy hat stands on a green hill with a panicking royal messenger beside him. Far away a cartoonish purple demon castle sits under a blue sky, with a comically jagged red crack running down the clouds above it.";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODELS = ["gpt-image-2", "gpt-image-2.5-flare", "gpt-image-2.5-sunburst"];

await Promise.all(
  MODELS.map(async (name) => {
    const started = Date.now();
    try {
      const { image } = await generateImage({
        model: openai.image(name),
        prompt: `${STYLE} Scene: ${SCENE}`,
        size: "1536x1024",
      });
      writeFileSync(`public/_compare/${name}.png`, Buffer.from(image.uint8Array));
      console.log(`✓ ${name}  ${Math.round((Date.now() - started) / 1000)}초`);
    } catch (e) {
      console.log(`✗ ${name} — ${e?.message ?? e}`);
    }
  }),
);

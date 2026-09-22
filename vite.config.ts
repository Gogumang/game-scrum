import { existsSync } from "node:fs";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Vite 는 .env 파일을 process.env 에 넣지 않는다.
// 서버 코드(OPENAI_API_KEY, UPSTASH_* …)가 읽을 수 있도록 여기서 직접 올린다.
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});

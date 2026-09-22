import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  ssr: true,
  /** FSD 의 app 레이어 = 앱 초기화 + 라우팅 */
  appDirectory: "src/app",
  /** Vercel 에 올릴 때 SSR 을 Vercel Function 으로 내보낸다 */
  presets: [vercelPreset()],
} satisfies Config;

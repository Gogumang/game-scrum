import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";
import "./styles/app.css";

export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  // 먼저 받아두되, 화면을 막지는 않는다
  { rel: "preload", as: "style", href: FONT_CSS },
];

const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&family=IBM+Plex+Sans+KR:wght@400;600&display=swap";

export const meta = () => [
  { title: "전자금융의 기묘한 하루" },
  {
    name: "description",
    content:
      "스크럼 아이스브레이킹 — 마왕을 무찌르러 가는 5막을 팀이 함께 고르고, 마지막엔 개인 사주와 AI 팀 분석으로 마무리합니다.",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <Meta />
        <Links />
        {/* 폰트 CSS 는 남의 서버에서 오고 51KB 다. 첫 페인트를 막지 않게 받아두고,
            다 오면 적용한다. 하이드레이션을 기다리지 않도록 head 에서 바로 처리한다. */}
        <link rel="stylesheet" href={FONT_CSS} media="print" data-font-css="" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var l=document.querySelector('link[data-font-css]');" +
              "if(!l)return;var go=function(){l.media='all'};" +
              "if(l.sheet){go()}else{l.addEventListener('load',go);" +
              "setTimeout(go,3000)}})()",
          }}
        />
        <noscript>
          <link rel="stylesheet" href={FONT_CSS} />
        </noscript>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const isResponse = isRouteErrorResponse(error);

  return (
    <main className="home">
      <div className="home-in">
        <h1>{isResponse ? `${error.status}` : "문제가 생겼습니다"}</h1>
        <p className="lede">
          {isResponse
            ? typeof error.data === "string"
              ? error.data
              : "요청을 처리하지 못했습니다."
            : "잠시 후 다시 시도해 주세요."}
        </p>
        <a className="btn" href="/" style={{ display: "inline-block", textDecoration: "none" }}>
          처음으로
        </a>
      </div>
    </main>
  );
}

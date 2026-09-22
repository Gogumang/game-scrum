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
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap",
  },
];

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

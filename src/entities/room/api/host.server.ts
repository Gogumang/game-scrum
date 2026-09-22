/**
 * 진행자 자격.
 *
 * 방을 새로 열거나 다른 기기에서 진행자로 이어받으려면 비밀번호가 필요하다.
 * 비밀번호는 HOST_PASSWORD 환경변수에서만 읽는다 — 저장소에 값을 두지 않는다.
 * 개발 중에 값이 없으면 임시 비밀번호로 돌아가고 콘솔에 알린다.
 */
const DEV_FALLBACK = "changeme";

let warned = false;

function hostPassword(): string | null {
  const configured = process.env.HOST_PASSWORD;
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") return null;

  if (!warned) {
    warned = true;
    console.warn(
      `[strum] HOST_PASSWORD 가 없어 개발용 임시 비밀번호 "${DEV_FALLBACK}" 를 씁니다. ` +
        ".env 에 HOST_PASSWORD 를 넣어주세요.",
    );
  }
  return DEV_FALLBACK;
}

/** 길이 차이로도 알아채지 못하게 상수 시간에 가깝게 비교한다. */
function sameSecret(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function requireHostPassword(given: unknown) {
  const expected = hostPassword();

  if (!expected) {
    throw new Response(
      "진행자 비밀번호가 설정되지 않았습니다. 배포 환경에 HOST_PASSWORD 를 넣어주세요.",
      { status: 503 },
    );
  }
  if (typeof given !== "string" || !sameSecret(given, expected)) {
    throw new Response("진행자 비밀번호가 맞지 않습니다.", { status: 401 });
  }
}

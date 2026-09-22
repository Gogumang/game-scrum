/** localStorage 는 시크릿 모드나 차단 설정에서 던질 수 있으므로 항상 감싼다. */
export function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 저장하지 못해도 이번 세션은 그대로 동작한다 */
  }
}

export const randomId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

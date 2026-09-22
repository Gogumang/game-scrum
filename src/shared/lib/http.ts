export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const isNotFound = (e: unknown) => e instanceof HttpError && e.status === 404;

export async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new HttpError((await res.text()) || "요청에 실패했습니다", res.status);
  return (await res.json()) as T;
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new HttpError(text || "요청에 실패했습니다", res.status);
  return (text ? JSON.parse(text) : undefined) as T;
}

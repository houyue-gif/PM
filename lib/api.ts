async function handle<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();
  let msg = "request failed";
  try {
    const data = await res.json();
    msg = data?.error || data?.message || msg;
  } catch {}
  throw new Error(msg);
}

export async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  return handle<T>(res);
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return handle<T>(res);
}

export async function patchJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return handle<T>(res);
}

export interface DataStore {
  goals: unknown[];
  completions: unknown[];
  rewards: unknown[];
  notes: unknown[];
  missions?: unknown[];
  memberIcons?: Record<string, string>;
}

function getUrl(): string | null {
  return process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ?? null;
}

export function isCloudEnabled(): boolean {
  return !!getUrl();
}

export async function loadFromCloud(): Promise<DataStore | null> {
  const url = getUrl();
  if (!url) return null;
  try {
    const res = await fetch(`${url}?action=load`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json() as DataStore;
  } catch {
    return null;
  }
}

export async function saveToCloud(data: DataStore): Promise<void> {
  const url = getUrl();
  if (!url) return;
  // POST with no-cors to avoid URL length limits (Korean chars inflate 3x when URL-encoded)
  await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'save', data }),
  });
  // no-cors returns opaque response — cannot read it, assume success
}

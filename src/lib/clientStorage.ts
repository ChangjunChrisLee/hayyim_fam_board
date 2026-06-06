/**
 * 브라우저에서 직접 Apps Script를 GET으로 호출.
 *
 * POST + 리다이렉트 문제를 피하기 위해 action 파라미터를 쓰는 GET 방식.
 * (이전 프로젝트에서 검증된 패턴)
 *
 * 환경변수: NEXT_PUBLIC_APPS_SCRIPT_URL
 */

export interface DataStore {
  goals: unknown[];
  completions: unknown[];
  rewards: unknown[];
}

function getUrl(): string | null {
  return process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ?? null;
}

export function isCloudEnabled(): boolean {
  return !!getUrl();
}

/** 스프레드시트에서 전체 데이터 읽기 */
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

/** 스프레드시트에 전체 데이터 저장 (GET + data 파라미터) */
export async function saveToCloud(data: DataStore): Promise<void> {
  const url = getUrl();
  if (!url) return;

  const encoded = encodeURIComponent(JSON.stringify(data));
  const res = await fetch(`${url}?action=save&data=${encoded}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Save failed: ${res.status}`);
  }

  const result = await res.json();
  console.log('[Cloud] saved at:', result.savedAt);
}

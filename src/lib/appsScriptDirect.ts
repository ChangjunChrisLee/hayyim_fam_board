/**
 * 서버 사이드에서 Apps Script를 직접 호출하는 유틸.
 *
 * Google Apps Script는 POST 요청 시 302 리다이렉트를 함.
 * 브라우저는 302 시 POST→GET으로 바꾸므로 데이터가 유실됨.
 * Node.js(서버)에서는 redirect:'manual'로 Location 헤더를 읽어
 * 실제 실행 URL에 직접 POST하면 doPost가 정상 호출됨.
 */

export interface DataStore {
  goals: unknown[];
  completions: unknown[];
  rewards: unknown[];
}

const EMPTY: DataStore = { goals: [], completions: [], rewards: [] };

// 최초 호출 시 캐시
let cachedExecUrl: string | null = null;

async function getExecUrl(baseUrl: string): Promise<string> {
  if (cachedExecUrl) return cachedExecUrl;

  try {
    // probe POST로 리다이렉트 URL 확인
    const res = await fetch(baseUrl, {
      method: 'POST',
      redirect: 'manual',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ probe: true }),
    });

    const location = res.headers.get('location');
    if (location) {
      cachedExecUrl = location;
      console.log('[AppsScript] Execution URL cached:', location);
      return location;
    }
  } catch (e) {
    console.error('[AppsScript] probe failed:', e);
  }

  return baseUrl;
}

export async function readAllFromAppsScript(): Promise<DataStore> {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return EMPTY;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return EMPTY;
    const data = await res.json();
    return data as DataStore;
  } catch {
    return EMPTY;
  }
}

export async function writeAllToAppsScript(data: DataStore): Promise<void> {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) throw new Error('APPS_SCRIPT_URL not set');

  const execUrl = await getExecUrl(url);

  const res = await fetch(execUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data),
  });

  const text = await res.text().catch(() => '');
  console.log('[AppsScript] write response:', res.status, text);

  if (!res.ok) {
    throw new Error(`Apps Script write failed: ${res.status} ${text}`);
  }
}

/**
 * Storage factory.
 * Uses Google Sheets when env vars are configured, otherwise throws
 * (the client handles this by falling back to the API layer).
 */
import type { IStorage } from './types';

let _storage: IStorage | null = null;

export function getStorage(): IStorage {
  if (_storage) return _storage;

  if (
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  ) {
    const { GoogleSheetsStorage } = require('./googleSheets');
    _storage = new GoogleSheetsStorage();
  } else if (process.env.APPS_SCRIPT_URL) {
    // Google Apps Script 웹앱 (개인 구글 계정, 무료)
    const { AppsScriptStorage } = require('./appsScript');
    _storage = new AppsScriptStorage();
  } else {
    // 기본: JSON 파일 스토리지 (로컬 또는 Google Drive 폴더)
    const { FileStorage } = require('./fileStorage');
    _storage = new FileStorage();
  }

  return _storage!;
}

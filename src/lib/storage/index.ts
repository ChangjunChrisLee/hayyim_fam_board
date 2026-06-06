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
    const { AppsScriptStorage } = require('./appsScript');
    _storage = new AppsScriptStorage();
  } else {
    const { FileStorage } = require('./fileStorage');
    _storage = new FileStorage();
  }

  return _storage!;
}

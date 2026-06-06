/**
 * Google Sheets storage backend.
 *
 * Sheet structure (each tab):
 *   goals:       id | memberId | category | content | repeatType | createdAt | isActive
 *   completions: id | goalId | memberId | completedAt | period
 *   rewards:     id | period | targetPercentage | description | createdAt
 *
 * Setup:
 *   1. Create a Google Cloud project → enable Sheets API
 *   2. Create a service account → download JSON key
 *   3. Share your spreadsheet with the service account email (Editor)
 *   4. Set env vars in .env.local / Vercel:
 *      GOOGLE_SHEETS_SPREADSHEET_ID
 *      GOOGLE_SERVICE_ACCOUNT_EMAIL
 *      GOOGLE_PRIVATE_KEY
 */

import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import type { Goal, GoalCompletion, Reward } from '@/types';
import type { IStorage } from './types';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
const SHEET_GOALS = 'goals';
const SHEET_COMPLETIONS = 'completions';
const SHEET_REWARDS = 'rewards';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getRows(sheet: string): Promise<string[][]> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheet}!A2:Z`,
  });
  return (res.data.values as string[][]) ?? [];
}

async function appendRow(sheet: string, row: (string | boolean | number)[]): Promise<void> {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheet}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [row.map(String)] },
  });
}

async function updateRow(
  sheet: string,
  rowIndex: number, // 0-based among data rows (row 2 in sheet = index 0)
  row: (string | boolean | number)[]
): Promise<void> {
  const sheets = await getSheetsClient();
  const sheetRow = rowIndex + 2; // header is row 1
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheet}!A${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [row.map(String)] },
  });
}

async function deleteRow(sheet: string, rowIndex: number): Promise<void> {
  const sheets = await getSheetsClient();

  // Get sheet ID first
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetMeta = meta.data.sheets?.find(
    (s) => s.properties?.title === sheet
  );
  if (!sheetMeta?.properties?.sheetId) throw new Error(`Sheet "${sheet}" not found`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetMeta.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex + 1, // +1 for header
              endIndex: rowIndex + 2,
            },
          },
        },
      ],
    },
  });
}

// ── Ensure headers exist on first use ────────────────────────────────────────

async function ensureHeaders(): Promise<void> {
  const sheets = await getSheetsClient();

  const headers: Record<string, string[]> = {
    [SHEET_GOALS]: ['id', 'memberId', 'category', 'content', 'repeatType', 'createdAt', 'isActive'],
    [SHEET_COMPLETIONS]: ['id', 'goalId', 'memberId', 'completedAt', 'period'],
    [SHEET_REWARDS]: ['id', 'period', 'targetPercentage', 'description', 'createdAt'],
  };

  for (const [sheetName, cols] of Object.entries(headers)) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:Z1`,
    });
    if (!res.data.values || res.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [cols] },
      });
    }
  }
}

// ── Goals ─────────────────────────────────────────────────────────────────────

function rowToGoal(row: string[]): Goal {
  return {
    id: row[0],
    memberId: row[1],
    category: row[2],
    content: row[3],
    repeatType: row[4] as Goal['repeatType'],
    createdAt: row[5],
    isActive: row[6] === 'true',
  };
}

function goalToRow(g: Goal): string[] {
  return [g.id, g.memberId, g.category, g.content, g.repeatType, g.createdAt, String(g.isActive)];
}

// ── Completions ───────────────────────────────────────────────────────────────

function rowToCompletion(row: string[]): GoalCompletion {
  return { id: row[0], goalId: row[1], memberId: row[2], completedAt: row[3], period: row[4] };
}

function completionToRow(c: GoalCompletion): string[] {
  return [c.id, c.goalId, c.memberId, c.completedAt, c.period];
}

// ── Rewards ───────────────────────────────────────────────────────────────────

function rowToReward(row: string[]): Reward {
  return {
    id: row[0],
    period: row[1] as Reward['period'],
    targetPercentage: Number(row[2]),
    description: row[3],
    createdAt: row[4],
  };
}

function rewardToRow(r: Reward): string[] {
  return [r.id, r.period, String(r.targetPercentage), r.description, r.createdAt];
}

// ── Storage implementation ────────────────────────────────────────────────────

export class GoogleSheetsStorage implements IStorage {
  // Goals
  async getGoals(): Promise<Goal[]> {
    const rows = await getRows(SHEET_GOALS);
    return rows.filter((r) => r[0]).map(rowToGoal);
  }

  async createGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
    await ensureHeaders();
    const newGoal: Goal = { ...goal, id: uuidv4(), createdAt: new Date().toISOString() };
    await appendRow(SHEET_GOALS, goalToRow(newGoal));
    return newGoal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const rows = await getRows(SHEET_GOALS);
    const idx = rows.findIndex((r) => r[0] === id);
    if (idx === -1) throw new Error(`Goal ${id} not found`);
    const updated: Goal = { ...rowToGoal(rows[idx]), ...updates };
    await updateRow(SHEET_GOALS, idx, goalToRow(updated));
    return updated;
  }

  async deleteGoal(id: string): Promise<void> {
    const rows = await getRows(SHEET_GOALS);
    const idx = rows.findIndex((r) => r[0] === id);
    if (idx === -1) return;
    await deleteRow(SHEET_GOALS, idx);
  }

  // Completions
  async getCompletions(): Promise<GoalCompletion[]> {
    const rows = await getRows(SHEET_COMPLETIONS);
    return rows.filter((r) => r[0]).map(rowToCompletion);
  }

  async createCompletion(
    completion: Omit<GoalCompletion, 'id' | 'completedAt'>
  ): Promise<GoalCompletion> {
    await ensureHeaders();
    const newC: GoalCompletion = {
      ...completion,
      id: uuidv4(),
      completedAt: new Date().toISOString(),
    };
    await appendRow(SHEET_COMPLETIONS, completionToRow(newC));
    return newC;
  }

  async deleteCompletion(id: string): Promise<void> {
    const rows = await getRows(SHEET_COMPLETIONS);
    const idx = rows.findIndex((r) => r[0] === id);
    if (idx === -1) return;
    await deleteRow(SHEET_COMPLETIONS, idx);
  }

  // Rewards
  async getRewards(): Promise<Reward[]> {
    const rows = await getRows(SHEET_REWARDS);
    return rows.filter((r) => r[0]).map(rowToReward);
  }

  async createReward(reward: Omit<Reward, 'id' | 'createdAt'>): Promise<Reward> {
    await ensureHeaders();
    const newR: Reward = { ...reward, id: uuidv4(), createdAt: new Date().toISOString() };
    await appendRow(SHEET_REWARDS, rewardToRow(newR));
    return newR;
  }

  async updateReward(id: string, updates: Partial<Reward>): Promise<Reward> {
    const rows = await getRows(SHEET_REWARDS);
    const idx = rows.findIndex((r) => r[0] === id);
    if (idx === -1) throw new Error(`Reward ${id} not found`);
    const updated: Reward = { ...rowToReward(rows[idx]), ...updates };
    await updateRow(SHEET_REWARDS, idx, rewardToRow(updated));
    return updated;
  }

  async deleteReward(id: string): Promise<void> {
    const rows = await getRows(SHEET_REWARDS);
    const idx = rows.findIndex((r) => r[0] === id);
    if (idx === -1) return;
    await deleteRow(SHEET_REWARDS, idx);
  }
}

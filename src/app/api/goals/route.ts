import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';

export async function GET() {
  try {
    const storage = getStorage();
    const goals = await storage.getGoals();
    return NextResponse.json({ data: goals });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const storage = getStorage();
    const body = await req.json();
    const goal = await storage.createGoal(body);
    return NextResponse.json({ data: goal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const storage = getStorage();
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const goal = await storage.updateGoal(id, updates);
    return NextResponse.json({ data: goal });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const storage = getStorage();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await storage.deleteGoal(id);
    return NextResponse.json({ data: { id } });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';

export async function GET() {
  try {
    const storage = getStorage();
    const rewards = await storage.getRewards();
    return NextResponse.json({ data: rewards });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const storage = getStorage();
    const body = await req.json();
    const reward = await storage.createReward(body);
    return NextResponse.json({ data: reward }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const storage = getStorage();
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const reward = await storage.updateReward(id, updates);
    return NextResponse.json({ data: reward });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const storage = getStorage();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await storage.deleteReward(id);
    return NextResponse.json({ data: { id } });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

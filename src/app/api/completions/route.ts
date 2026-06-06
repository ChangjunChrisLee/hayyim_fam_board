import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';

export async function GET() {
  try {
    const storage = getStorage();
    const completions = await storage.getCompletions();
    return NextResponse.json({ data: completions });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const storage = getStorage();
    const body = await req.json();
    const completion = await storage.createCompletion(body);
    return NextResponse.json({ data: completion }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const storage = getStorage();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await storage.deleteCompletion(id);
    return NextResponse.json({ data: { id } });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

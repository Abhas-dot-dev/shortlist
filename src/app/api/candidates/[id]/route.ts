import { NextResponse } from 'next/server';
import { getCandidateById, updateApplicationStatus, updateApplicationNotes, deleteCandidate } from '@/lib/dataService';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const candidate = await getCandidateById(id);
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    return NextResponse.json(candidate);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const body = await req.json();

    let updated = null;
    if (body.status !== undefined) {
      updated = await updateApplicationStatus(id, body.status);
    }
    if (body.recruiterNotes !== undefined) {
      updated = await updateApplicationNotes(id, body.recruiterNotes);
    }

    if (!updated) {
      return NextResponse.json({ error: 'Candidate application not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    await deleteCandidate(id);
    return NextResponse.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

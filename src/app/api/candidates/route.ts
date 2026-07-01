import { NextResponse } from 'next/server';
import { getCandidates } from '@/lib/dataService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const jobId = searchParams.get('jobId') || '';
    const experience = searchParams.get('experience') || '';
    const skills = searchParams.get('skills') || '';
    const education = searchParams.get('education') || '';
    const score = searchParams.get('score') || '';
    const sort = searchParams.get('sort') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const allCandidates = await getCandidates({
      search,
      jobId,
      experience,
      skills,
      education,
      score,
      sort,
    });

    // Simple Pagination
    const total = allCandidates.length;
    const startIndex = (page - 1) * limit;
    const paginatedCandidates = allCandidates.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      candidates: paginatedCandidates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

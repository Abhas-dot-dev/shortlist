import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/dataService';

export async function GET() {
  try {
    const stats = await getDashboardStats();

    // Generate analytical data for charts
    const applicationsOverTime = [
      { date: 'Jun 25', count: 4 },
      { date: 'Jun 26', count: 6 },
      { date: 'Jun 27', count: 5 },
      { date: 'Jun 28', count: 8 },
      { date: 'Jun 29', count: 11 },
      { date: 'Jun 30', count: 9 },
      { date: 'Jul 01', count: 12 },
    ];

    const topSkills = [
      { skill: 'React', count: 18 },
      { skill: 'TypeScript', count: 15 },
      { skill: 'Node.js', count: 12 },
      { skill: 'Python', count: 10 },
      { skill: 'Figma', count: 8 },
      { skill: 'AWS', count: 7 },
    ];

    const experienceDistribution = [
      { name: '0-2 years', count: 6 },
      { name: '3-5 years', count: 14 },
      { name: '5+ years', count: 10 },
    ];

    const shortlistedVsRejected = [
      { name: 'Shortlisted', value: 8, color: '#10b981' },
      { name: 'Applied', value: 16, color: '#3b82f6' },
      { name: 'Rejected', value: 6, color: '#ef4444' },
    ];

    return NextResponse.json({
      ...stats,
      charts: {
        applicationsOverTime,
        topSkills,
        experienceDistribution,
        shortlistedVsRejected,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

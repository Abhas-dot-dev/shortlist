'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ui/ThemeContext';
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { ScoreCircle } from '@/components/ui/ScoreCircle';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { Badge } from '@/components/ui/Inputs';

// We import recharts elements
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function RecruiterDashboard() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        setStats(data);
        setCharts(data.charts);
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl h-[350px]">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-[250px] w-full" />
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl h-[350px]">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-[250px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Monitor open jobs, matching progress, and candidate shortlists.
          </p>
        </div>
        <Link href="/recruiter/candidates">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm font-semibold text-sm cursor-pointer">
            <Sparkles className="h-4 w-4" /> Review Candidates
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Jobs</span>
            <h3 className="text-3xl font-extrabold">{stats?.totalJobs}</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidates Screened</span>
            <h3 className="text-3xl font-extrabold">{stats?.totalCandidates}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shortlisted</span>
            <h3 className="text-3xl font-extrabold">{stats?.shortlisted}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Match Score</span>
            <h3 className="text-3xl font-extrabold">{stats?.averageMatchScore}%</h3>
          </div>
          <div className="p-1">
            <ScoreCircle score={stats?.averageMatchScore || 0} size={50} />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      {isClient && charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-blue-500" /> Applications Sourced Timeline
              </h4>
              <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">Weekly</Badge>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.applicationsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#0b0f19' : '#ffffff',
                      borderColor: theme === 'dark' ? '#1f2937' : '#e2e8f0',
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allocation Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-blue-500" /> Status Distribution
            </h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.shortlistedVsRejected} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#0b0f19' : '#ffffff',
                      borderColor: theme === 'dark' ? '#1f2937' : '#e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={45}>
                    {charts.shortlistedVsRejected.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-blue-500" /> Recent Sourcing Activity
          </h4>
          <Link href="/recruiter/candidates">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer">
              View All <ArrowUpRight className="h-3 w-3" />
            </span>
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-850">
          {stats?.recentActivity.map((activity: any) => (
            <div key={activity.id} className="py-3 flex justify-between items-center gap-4 text-xs sm:text-sm">
              <div className="min-w-0">
                <p className="font-bold truncate text-slate-800 dark:text-slate-200">{activity.candidateName}</p>
                <p className="text-[11px] text-slate-400 truncate">Applied for {activity.jobTitle}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-slate-400 hidden sm:block">
                  {new Date(activity.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <Badge className={
                  activity.status === 'shortlisted' 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' 
                    : activity.status === 'rejected'
                    ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                }>
                  {activity.status.toUpperCase()}
                </Badge>
                <span className="font-bold text-slate-600 dark:text-slate-300">{activity.matchScore}% Match</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

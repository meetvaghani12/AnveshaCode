'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, FileCode, History, Settings, BarChart } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import useSWR from 'swr';

interface CodeReview {
  id: string;
  fileName: string | null;
  code: string;
  review: string;
  score: number;
  issuesCount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalReviews: number;
  averageScore: number;
  totalIssues: number;
  resolvedIssues: number;
  recentReviews: CodeReview[];
}

const fetcher = (url: string, token: string) =>
  fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  });

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { data: reviews, error, isLoading, mutate } = useSWR(
    token ? ['/api/code-reviews', token] : null,
    ([url, token]) => fetcher(url, token)
  );
  const router = useRouter();

  // Calculate statistics
  let stats: DashboardStats = {
    totalReviews: 0,
    averageScore: 0,
    totalIssues: 0,
    resolvedIssues: 0,
    recentReviews: []
  };

  if (reviews && Array.isArray(reviews)) {
    stats.totalReviews = reviews.length;
    stats.averageScore = reviews.length > 0
      ? Math.round(reviews.reduce((acc, review) => acc + review.score, 0) / reviews.length)
      : 0;
    stats.totalIssues = reviews.reduce((acc, review) => acc + review.issuesCount, 0);
    stats.resolvedIssues = reviews.filter((review: CodeReview) => review.status === 'COMPLETED')
      .reduce((acc: number, review: CodeReview) => acc + review.issuesCount, 0);
    stats.recentReviews = reviews
      .sort((a: CodeReview, b: CodeReview) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }

  if (error) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to load dashboard data',
      variant: 'destructive',
    });
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName || 'User'}!</h1>
          <p className="text-muted-foreground">Here's an overview of your code review activity.</p>
          {user?.subscription?.plan ? (
            <div className="mt-4">
              <Button
                variant="default"
                onClick={() => router.push('/invoice/invoicePDF')}
                className="gap-2"
              >
                <span>Current Plan:</span>
                <span>{user.subscription.plan}</span>
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <Button
                variant="default"
                onClick={() => router.push('/pricing')}
                className="gap-2"
              >
                Subscribe to Plan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <FileCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalReviews}</div>
              <p className="text-xs text-muted-foreground">All time reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : `${stats.averageScore}%`}</div>
              <p className="text-xs text-muted-foreground">Overall code quality</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalIssues}</div>
              <p className="text-xs text-muted-foreground">Total issues identified</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues Resolved</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.resolvedIssues}</div>
              <p className="text-xs text-muted-foreground">Completed reviews</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Your most recent code reviews and their status.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-48"></div>
                        <div className="h-3 bg-muted rounded w-32"></div>
                      </div>
                      <div className="h-8 bg-muted rounded w-24"></div>
                    </div>
                  ))}
                </div>
              ) : stats.recentReviews.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No reviews yet. Start your first code review!
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentReviews.map((review) => (
                    <div key={review.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {review.fileName || 'Pasted Code'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Completed {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2" asChild>
                        <Link href={`/history?id=${review.id}`}>
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <Link href="/new-review">
                    <FileCode className="h-4 w-4" />
                    New Review
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <Link href="/history">
                    <History className="h-4 w-4" />
                    View History
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

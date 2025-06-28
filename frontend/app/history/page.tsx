'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowUpDown, FileCode, Search, ArrowLeft, Download, ChevronDown, AlertCircle, BarChart, Code, History, Crown, CheckCircle2, Timer, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import { ComponentPropsWithoutRef } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import useSWR from 'swr';

interface CodeReview {
  id: string
  fileName: string | null
  code: string
  review: string
  score: number
  issuesCount: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  createdAt: string
  updatedAt: string
}

interface SubscriptionStatus {
  plan: string;
  currentReviews: number;
  reviewLimit: number;
  remainingReviews: number;
}

const fetcher = (url: string, token: string) =>
  fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch review history');
    return res.json();
  });

export default function ReviewHistory() {
  const { toast } = useToast()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { data: reviews, error, isLoading, mutate } = useSWR(
    token ? ['/api/code-reviews', token] : null,
    ([url, token]) => fetcher(url, token)
  );
  const [filteredReviews, setFilteredReviews] = useState<CodeReview[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [scoreFilter, setScoreFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  useEffect(() => {
    filterAndSortReviews()
  }, [reviews, searchQuery, statusFilter, scoreFilter, sortBy])

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for subscription status');
        return;
      }

      const response = await fetch('/api/code-reviews/subscription-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch subscription status');
      }

      const data = await response.json();
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load subscription status",
        variant: "destructive"
      });
    }
  }

  const filterAndSortReviews = () => {
    let filtered = [...reviews]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(review => 
        review.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(review => review.status === statusFilter)
    }

    // Apply score filter
    if (scoreFilter !== "all") {
      filtered = filtered.filter(review => {
        switch (scoreFilter) {
          case "high":
            return review.score >= 90
          case "medium":
            return review.score >= 70 && review.score < 90
          case "low":
            return review.score < 70
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "score-high":
          return b.score - a.score
        case "score-low":
          return a.score - b.score
        default:
          return 0
      }
    })

    setFilteredReviews(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#10b981"
    if (score >= 70) return "#f59e0b"
    return "#ef4444"
  }

  const downloadReview = (review: CodeReview, format: 'markdown' | 'pdf' | 'html') => {
    const baseFileName = review.fileName 
      ? `${review.fileName.split('/').pop()?.replace(/\.[^/.]+$/, '')}_review`
      : 'code_review';

    let content: string;
    let mimeType: string;
    let fileExtension: string;

    switch (format) {
      case 'markdown':
        content = review.review;
        mimeType = 'text/markdown';
        fileExtension = 'md';
        break;

      case 'html':
        // Convert markdown to HTML
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Code Review - ${review.fileName || 'Pasted Code'}</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
                pre { background-color: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
                code { background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
                h1, h2, h3 { color: #333; }
                ul, ol { padding-left: 20px; }
                .metadata { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .metadata p { margin: 5px 0; }
              </style>
            </head>
            <body>
              <div class="metadata">
                <p><strong>File:</strong> ${review.fileName || 'Pasted Code'}</p>
                <p><strong>Score:</strong> ${review.score}%</p>
                <p><strong>Issues Found:</strong> ${review.issuesCount}</p>
                <p><strong>Date:</strong> ${new Date(review.createdAt).toLocaleString()}</p>
              </div>
              ${review.review.split('\n').map(line => {
                if (line.startsWith('#')) {
                  return `<h${line.indexOf(' ')}>${line.substring(line.indexOf(' ')).trim()}</h${line.indexOf(' ')}>`;
                }
                if (line.startsWith('- ')) {
                  return `<li>${line.substring(2)}</li>`;
                }
                if (line.startsWith('```')) {
                  return `<pre><code>${line.substring(3)}</code></pre>`;
                }
                return `<p>${line}</p>`;
              }).join('\n')}
            </body>
          </html>
        `;
        content = htmlContent;
        mimeType = 'text/html';
        fileExtension = 'html';
        break;

      case 'pdf':
        // Create a temporary iframe for PDF generation
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Create the PDF content with enhanced styling
        const pdfContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Code Review - ${review.fileName || 'Pasted Code'}</title>
              <style>
                @media print {
                  body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    max-width: 800px; 
                    margin: 0 auto; 
                    padding: 20px;
                    color: #000;
                  }
                  pre { 
                    background-color: #f5f5f5; 
                    padding: 15px; 
                    border-radius: 5px; 
                    overflow-x: auto;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    border: 1px solid #ddd;
                    margin: 15px 0;
                  }
                  code { 
                    background-color: #f5f5f5; 
                    padding: 2px 4px; 
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9em;
                  }
                  h1, h2, h3 { 
                    color: #000;
                    page-break-after: avoid;
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                  }
                  h1 { font-size: 1.8em; }
                  h2 { font-size: 1.5em; }
                  h3 { font-size: 1.2em; }
                  ul, ol { 
                    padding-left: 20px;
                    page-break-inside: avoid;
                    margin: 1em 0;
                  }
                  li {
                    margin: 0.5em 0;
                  }
                  .metadata { 
                    background-color: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 5px; 
                    margin-bottom: 30px;
                    page-break-after: avoid;
                    border: 1px solid #ddd;
                  }
                  .metadata p { 
                    margin: 8px 0;
                    font-size: 0.95em;
                  }
                  .metadata strong {
                    color: #333;
                    min-width: 120px;
                    display: inline-block;
                  }
                  .score-indicator {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-weight: bold;
                    margin-left: 10px;
                  }
                  .score-high { background-color: #d1fae5; color: #065f46; }
                  .score-medium { background-color: #fef3c7; color: #92400e; }
                  .score-low { background-color: #fee2e2; color: #991b1b; }
                  p {
                    margin: 1em 0;
                  }
                  @page {
                    margin: 2cm;
                    @bottom-center {
                      content: "Page " counter(page) " of " counter(pages);
                      font-size: 0.8em;
                      color: #666;
                    }
                  }
                  .header {
                    text-align: center;
                    margin-bottom: 2em;
                    padding-bottom: 1em;
                    border-bottom: 2px solid #eee;
                  }
                  .header h1 {
                    margin: 0;
                    color: #1a1a1a;
                  }
                  .header p {
                    margin: 0.5em 0;
                    color: #666;
                  }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Code Review Report</h1>
                <p>Generated on ${new Date().toLocaleString()}</p>
              </div>
              <div class="metadata">
                <p><strong>File Name:</strong> ${review.fileName || 'Pasted Code'}</p>
                <p><strong>Review Score:</strong> 
                  <span class="score-indicator ${
                    review.score >= 90 ? 'score-high' : 
                    review.score >= 70 ? 'score-medium' : 
                    'score-low'
                  }">${review.score}%</span>
                </p>
                <p><strong>Issues Found:</strong> ${review.issuesCount}</p>
                <p><strong>Review Date:</strong> ${new Date(review.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> ${review.status.toLowerCase().replace('_', ' ')}</p>
              </div>
              ${review.review.split('\n').map(line => {
                if (line.startsWith('#')) {
                  return `<h${line.indexOf(' ')}>${line.substring(line.indexOf(' ')).trim()}</h${line.indexOf(' ')}>`;
                }
                if (line.startsWith('- ')) {
                  return `<li>${line.substring(2)}</li>`;
                }
                if (line.startsWith('```')) {
                  return `<pre><code>${line.substring(3)}</code></pre>`;
                }
                return `<p>${line}</p>`;
              }).join('\n')}
            </body>
          </html>
        `;

        // Write content to iframe
        iframe.contentWindow?.document.open();
        iframe.contentWindow?.document.write(pdfContent);
        iframe.contentWindow?.document.close();

        // Wait for content to load
        iframe.onload = () => {
          // Print the iframe content
          iframe.contentWindow?.print();
          
          // Remove the iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        };

        toast({
          title: "PDF Generation",
          description: "Please use your browser's print dialog to save as PDF.",
        });
        return; // Exit early as we're using the print dialog
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFileName}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `Your code review has been downloaded as a ${format.toUpperCase()} file.`,
    });
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Home</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Review History</h1>
            <p className="text-gray-500">View and manage your code reviews</p>
          </div>
        </div>

        {subscriptionStatus && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                <Crown className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{subscriptionStatus.plan.toLowerCase()}</div>
                <p className="text-xs text-muted-foreground">Active subscription</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reviews Used</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptionStatus.currentReviews}</div>
                <p className="text-xs text-muted-foreground">Total reviews completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Review Limit</CardTitle>
                <Timer className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptionStatus.reviewLimit === Infinity ? '∞' : subscriptionStatus.reviewLimit}</div>
                <p className="text-xs text-muted-foreground">Plan limit</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining Reviews</CardTitle>
                <Zap className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptionStatus.remainingReviews === Infinity ? '∞' : subscriptionStatus.remainingReviews}</div>
                <p className="text-xs text-muted-foreground">Available reviews</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mb-6 bg-gradient-to-br from-background to-muted/50 dark:from-background dark:to-muted/30">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter your review history by various criteria.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search reviews..." 
                  className="h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">High (90-100)</SelectItem>
                  <SelectItem value="medium">Medium (70-89)</SelectItem>
                  <SelectItem value="low">Low (0-69)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="score-high">Highest Score</SelectItem>
                  <SelectItem value="score-low">Lowest Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            {/* <CardTitle>Review History</CardTitle>
            <CardDescription>A list of all your past code reviews.</CardDescription> */}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Loading reviews...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No reviews found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Issues</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.fileName || 'Pasted Code'}</TableCell>
                      <TableCell>{formatDate(review.createdAt)}</TableCell>
                      <TableCell className="text-center">{review.issuesCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-16 rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${getScoreColor(review.score)} ${review.score}%, transparent ${review.score}%)`,
                            }}
                          />
                          <span>{review.score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            review.status === "COMPLETED"
                              ? "default"
                              : review.status === "IN_PROGRESS"
                                ? "outline"
                                : "destructive"
                          }
                        >
                          {review.status.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedReview(review)}
                            title="View Review"
                          >
                            <FileCode className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Download Review"
                              >
                                <Download className="h-4 w-4" />
                                <ChevronDown className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => downloadReview(review, 'markdown')}>
                                Download as Markdown
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadReview(review, 'html')}>
                                Download as HTML
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadReview(review, 'pdf')}>
                                Download as PDF
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span>Review Details</span>
                  {selectedReview && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold`} style={{ color: getScoreColor(selectedReview.score) }}>
                          {selectedReview.score}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /100
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {selectedReview.issuesCount} {selectedReview.issuesCount === 1 ? 'Issue' : 'Issues'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-full pr-4">
              {selectedReview && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown 
                    components={{
                      p: ({...props}: ComponentPropsWithoutRef<'p'>) => <p className="mb-4" {...props} />,
                      ul: ({...props}: ComponentPropsWithoutRef<'ul'>) => <ul className="mb-4 space-y-2" {...props} />,
                      ol: ({...props}: ComponentPropsWithoutRef<'ol'>) => <ol className="mb-4 space-y-2" {...props} />,
                      li: ({...props}: ComponentPropsWithoutRef<'li'>) => <li className="mb-2" {...props} />,
                      h1: ({...props}: ComponentPropsWithoutRef<'h1'>) => <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />,
                      h2: ({...props}: ComponentPropsWithoutRef<'h2'>) => <h2 className="text-xl font-bold mb-3 mt-5" {...props} />,
                      h3: ({...props}: ComponentPropsWithoutRef<'h3'>) => <h3 className="text-lg font-bold mb-2 mt-4" {...props} />,
                      pre: ({...props}: ComponentPropsWithoutRef<'pre'>) => <pre className="mb-4 p-4 bg-muted rounded-md overflow-x-auto" {...props} />,
                      code: ({...props}: ComponentPropsWithoutRef<'code'>) => <code className="bg-muted px-1 py-0.5 rounded" {...props} />
                    }}
                  >
                    {selectedReview.review}
                  </ReactMarkdown>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
} 
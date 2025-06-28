"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Download, FileCode2, Info, RefreshCw, ArrowLeft, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import useSWR from 'swr'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

interface AnalyticsData {
  overview: {
    totalReviews: number;
    totalIssues: number;
    averageIssuesPerReview: number;
    resolutionRate: number;
  };
  monthlyData: Array<{
    name: string;
    reviews: number;
    issues: number;
  }>;
  languageData: Array<{
    name: string;
    value: number;
  }>;
  issueTypeData: Array<{
    name: string;
    value: number;
  }>;
  severityData: Array<{
    name: string;
    count: number;
  }>;
}

const fetcher = (url: string, token: string) =>
  fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch analytics data');
    return res.json();
  });

export default function Analytics() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { data: analyticsData, error, isLoading, mutate } = useSWR(
    token ? ['/api/analytics', token] : null,
    ([url, token]) => fetcher(url, token)
  );
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  });
  const { toast } = useToast();

  if (error) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to load analytics data',
      variant: 'destructive',
    });
  }

  const exportData = (format: 'json' | 'csv' | 'excel') => {
    if (!analyticsData) {
      toast({
        title: "Error",
        description: "No data available to export",
        variant: "destructive"
      })
      return
    }

    // Create a formatted report
    const report = {
      generatedAt: new Date().toISOString(),
      overview: analyticsData.overview,
      monthlyData: analyticsData.monthlyData,
      languageData: analyticsData.languageData,
      issueTypeData: analyticsData.issueTypeData,
      severityData: analyticsData.severityData
    }

    let blob: Blob
    let filename: string
    let mimeType: string

    switch (format) {
      case 'json':
        const reportString = JSON.stringify(report, null, 2)
        blob = new Blob([reportString], { type: 'application/json' })
        filename = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
        break

      case 'csv':
        // Convert data to CSV format
        const csvRows = []
        // Add overview data
        csvRows.push('Overview')
        csvRows.push('Metric,Value')
        Object.entries(report.overview).forEach(([key, value]) => {
          csvRows.push(`${key},${value}`)
        })
        csvRows.push('') // Empty row for separation

        // Add monthly data
        csvRows.push('Monthly Data')
        csvRows.push('Month,Reviews,Issues')
        report.monthlyData.forEach(month => {
          csvRows.push(`${month.name},${month.reviews},${month.issues}`)
        })
        csvRows.push('')

        // Add language data
        csvRows.push('Language Distribution')
        csvRows.push('Language,Count')
        report.languageData.forEach(lang => {
          csvRows.push(`${lang.name},${lang.value}`)
        })
        csvRows.push('')

        // Add issue type data
        csvRows.push('Issue Types')
        csvRows.push('Type,Count')
        report.issueTypeData.forEach(type => {
          csvRows.push(`${type.name},${type.value}`)
        })
        csvRows.push('')

        // Add severity data
        csvRows.push('Severity Distribution')
        csvRows.push('Severity,Count')
        report.severityData.forEach(severity => {
          csvRows.push(`${severity.name},${severity.count}`)
        })

        blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
        filename = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
        break

      case 'excel':
        // For Excel, we'll create a CSV with BOM for Excel compatibility
        const excelRows = []
        // Add overview data
        excelRows.push('Overview')
        excelRows.push('Metric,Value')
        Object.entries(report.overview).forEach(([key, value]) => {
          excelRows.push(`${key},${value}`)
        })
        excelRows.push('')

        // Add monthly data
        excelRows.push('Monthly Data')
        excelRows.push('Month,Reviews,Issues')
        report.monthlyData.forEach(month => {
          excelRows.push(`${month.name},${month.reviews},${month.issues}`)
        })
        excelRows.push('')

        // Add language data
        excelRows.push('Language Distribution')
        excelRows.push('Language,Count')
        report.languageData.forEach(lang => {
          excelRows.push(`${lang.name},${lang.value}`)
        })
        excelRows.push('')

        // Add issue type data
        excelRows.push('Issue Types')
        excelRows.push('Type,Count')
        report.issueTypeData.forEach(type => {
          excelRows.push(`${type.name},${type.value}`)
        })
        excelRows.push('')

        // Add severity data
        excelRows.push('Severity Distribution')
        excelRows.push('Severity,Count')
        report.severityData.forEach(severity => {
          excelRows.push(`${severity.name},${severity.count}`)
        })

        // Add BOM for Excel compatibility
        const BOM = '\uFEFF'
        blob = new Blob([BOM + excelRows.join('\n')], { type: 'text/csv' })
        filename = `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        break
    }

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: `Analytics data exported as ${format.toUpperCase()} successfully`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <RefreshCw className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>No analytics data available. Start by reviewing some code.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        
        {/* <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Detailed insights into your code review activity</p>
        </div> */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "All Time"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={new Date()}
                selected={dateRange}
                onSelect={(range) => {
                  if (range) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportData('json')}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData('excel')}>
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {/* <TabsTrigger value="issues">Issues</TabsTrigger> */}
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <FileCode2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalReviews}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Issues identified across all reviews</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalIssues}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Issues per Review</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Average number of issues found per review</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.averageIssuesPerReview.toFixed(1)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentage of issues that have been resolved</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.resolutionRate.toFixed(0)}%</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Monthly Review Activity</CardTitle>
                <CardDescription>Number of reviews conducted each month</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <RechartsTooltip />
                    <Area
                      type="monotone"
                      dataKey="reviews"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorReviews)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
                <CardDescription>Distribution of code reviews by programming language</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.languageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.languageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Issue Types</CardTitle>
                <CardDescription>Distribution of issues by type</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.issueTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.issueTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issue Severity</CardTitle>
                <CardDescription>Distribution of issues by severity level</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.severityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Distribution</CardTitle>
              <CardDescription>Detailed breakdown of code reviews by language</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.languageData.map((lang, index) => (
                  <div key={lang.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{lang.name}</span>
                    </div>
                    <span className="font-medium">{lang.value} reviews</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Review and issue trends over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reviews"
                    stroke="#8884d8"
                    name="Reviews"
                  />
                  <Line
                    type="monotone"
                    dataKey="issues"
                    stroke="#82ca9d"
                    name="Issues"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

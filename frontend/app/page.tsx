"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "next-themes"

export default function Home() {
  const { user, logout } = useAuth()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Add effect to log auth state
  useEffect(() => {
    console.log('Home Page: Current auth state:', { user })
  }, [user])

  // Make sure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    console.log('Home Page: Logout clicked')
    await logout()
  }

  const toggleBillingCycle = (cycle: "monthly" | "yearly") => {
    setBillingCycle(cycle)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="m18 16 4-4-4-4" />
              <path d="m6 8-4 4 4 4" />
              <path d="m14.5 4-5 16" />
            </svg>
            <span>AnveshaCode</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              About Us
            </Link>
            <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
              Contact Us
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {mounted && (
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="mr-2">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Professional Code Reviews at Your Fingertips
                </h1>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Upload your code, get expert reviews, and improve your codebase with our AI-powered platform.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button size="lg" className="gap-1.5">
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/new-review">
                      <Button size="lg" variant="outline" className="gap-1.5">
                        New Review
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg" className="gap-1.5">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="#pricing">
                      <Button size="lg" variant="outline">
                        View Pricing
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Everything you need to improve your code quality and development workflow.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="m10 13-2 2 2 2" />
                    <path d="m14 17 2-2-2-2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Code Upload</h3>
                <p className="text-center text-muted-foreground">
                  Upload your entire codebase or specific files for review.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7H2Z" />
                    <path d="M6 11v-4h12v4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">AI-Powered Reviews</h3>
                <p className="text-center text-muted-foreground">
                  Get instant feedback and suggestions to improve your code.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Analytics Dashboard</h3>
                <p className="text-center text-muted-foreground">
                  Track your code quality metrics and improvement over time.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Simple, Transparent Pricing
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Choose the plan that's right for you and your team.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-4 mb-8">
                <button
                  onClick={() => toggleBillingCycle("monthly")}
                  className={`px-4 py-2 rounded-lg ${
                    billingCycle === "monthly"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => toggleBillingCycle("yearly")}
                  className={`px-4 py-2 rounded-lg ${
                    billingCycle === "yearly"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  Yearly
                  <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    Save 15%
                  </span>
                </button>
              </div>
              <div>

              </div>
              <div>
                
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                {/* Basic Plan */}
                <div className="flex flex-col p-6 rounded-lg border bg-card">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Basic</h3>
                    <p className="text-muted-foreground">Perfect for individual developers</p>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">₹{billingCycle === "monthly" ? "99" : "999"}</span>
                    <span className="text-muted-foreground">/{billingCycle === "monthly" ? "month" : "year"}</span>
                  </div>
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Up to 5 Projects</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Up to 30 File Reviews</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Basic LLM Model</span>
                    </li>
                  </ul>
                  <Link href="/pricing">
                    <Button className="mt-8 w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>

                {/* Advanced Plan */}
                <div className="flex flex-col p-6 rounded-lg border bg-card relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Best Choice
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Advanced</h3>
                    <p className="text-muted-foreground">Ideal for growing teams</p>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">₹{billingCycle === "monthly" ? "199" : "1999"}</span>
                    <span className="text-muted-foreground">/{billingCycle === "monthly" ? "month" : "year"}</span>
                  </div>
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Up to 25 Projects Per Month</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>200 File Reviews Per Month</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Advanced LLM Models</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Security vulnerability scanning</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Code quality metrics</span>
                    </li>
                  </ul>
                  <Link href="/pricing">
                    <Button className="mt-8 w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>

                {/* Enterprise Plan */}
                <div className="flex flex-col p-6 rounded-lg border bg-card">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Enterprise</h3>
                    <p className="text-muted-foreground">For large organizations</p>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">₹{billingCycle === "monthly" ? "499" : "4999"}</span>
                    <span className="text-muted-foreground">/{billingCycle === "monthly" ? "month" : "year"}</span>
                  </div>
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Unlimited Projects</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Unlimited File Reviews</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>AI Agent & Advanced LLM</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Custom integrations</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Advanced security features</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Custom reporting</span>
                    </li>
                  </ul>
                  <Link href="/pricing">
                    <Button className="mt-8 w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="m18 16 4-4-4-4" />
              <path d="m6 8-4 4 4 4" />
              <path d="m14.5 4-5 16" />
            </svg>
            <span>AnveshaCode</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 AnveshaCode. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

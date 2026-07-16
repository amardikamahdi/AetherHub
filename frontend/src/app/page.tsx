import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, BarChart3, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      title: 'Job Management',
      description: 'Create and manage campaigns, assign talents, and track progress in real-time.',
      icon: Briefcase,
    },
    {
      title: 'Talent Pool',
      description: 'Manage your KOL talent roster, social media accounts, and performance metrics.',
      icon: Users,
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor campaign progress with step-by-step tracking from draft to insight.',
      icon: BarChart3,
    },
  ]

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="size-4" />
            </div>
            <span className="text-lg font-semibold">AetherHub</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 items-center justify-center px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Job & Talent Management
            <br />
            <span className="text-primary">for KOL Specialists</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            AetherHub streamlines your KOL campaign workflow — from talent assignment
            to progress tracking to brand reporting.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg">
              <Link href="/register">
                Get Started
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              <Link href="/brand/access">Brand Access</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">Everything you need</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            Manage your entire KOL campaign lifecycle in one platform.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="size-8 text-primary" />
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © 2025 AetherHub. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

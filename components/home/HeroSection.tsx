'use client';

import Link from 'next/link';
import { Rocket, BookOpen } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="min-h-screen bg-fd-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center rounded-xl border border-fd-border bg-fd-card p-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fd-primary to-fd-primary/80 flex items-center justify-center mb-4">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-fd-foreground">Synap Documentation</h1>
            <p className="text-fd-muted-foreground mt-2">
              Your central hub for product documentation, guides, and team resources.
            </p>
          </div>
          
          <div className="space-y-4 mt-6">
            <p className="text-fd-muted-foreground">
              Get started with Synap by exploring our documentation spaces.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/docs/start/getting-started">
                <button className="px-6 py-3 bg-fd-primary text-white rounded-lg hover:bg-fd-primary/90 transition-colors flex items-center">
                  <Rocket className="w-4 h-4 mr-2" />
                  Get Started
                </button>
              </Link>
              
              <Link href="/docs/start/concepts">
                <button className="px-6 py-3 border border-fd-border bg-fd-card text-fd-foreground rounded-lg hover:bg-fd-muted transition-colors flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Concepts
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HeroProps {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}

export function Hero({ title, description, children, className }: HeroProps) {
  return (
    <div className={cn('relative py-16 lg:py-24', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-fd-primary/5 to-fd-primary/10 dark:from-fd-primary/10 dark:to-fd-primary/20" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-fd-foreground mb-6">
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-fd-muted-foreground mb-8 leading-relaxed">
            {description}
          </p>
          
          {children && (
            <div className="flex flex-wrap gap-4 justify-center">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface HeroCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  className?: string;
}

export function HeroCard({ title, description, icon, href, className }: HeroCardProps) {
  return (
    <a
      href={href}
      className={cn(
        'group block p-6 rounded-lg border border-fd-border bg-fd-card hover:border-fd-primary/50 hover:bg-fd-primary/5 transition-all',
        className
      )}
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-fd-primary/10 text-fd-primary mb-4">
          <div className="text-xl">
            {icon}
          </div>
        </div>
        
        <h3 className="text-base font-semibold mb-2 text-fd-foreground">
          {title}
        </h3>
        
        <p className="text-sm text-fd-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </a>
  );
}

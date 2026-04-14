'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

import { ArrowRight, type LucideIcon } from 'lucide-react';

interface SpaceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  variant?: 'default' | 'featured' | 'public';
  className?: string;
}

export function SpaceCard({
  title,
  description,
  icon: Icon,
  href,
  variant = 'default',
  className,
}: SpaceCardProps) {
  const variantConfig = {
    default: {
      iconBg: 'bg-fd-primary/10',
      iconColor: 'text-fd-primary',
    },
    featured: {
      iconBg: 'bg-fd-primary/15',
      iconColor: 'text-fd-primary',
    },
    public: {
      iconBg: 'bg-fd-muted',
      iconColor: 'text-fd-muted-foreground',
    },
  };

  const config = variantConfig[variant];

  return (
    <a href={href} className={cn('group h-full', className)}>
      <div className="h-full p-6 rounded-lg border border-fd-border bg-fd-card hover:border-fd-primary/30 transition-colors">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-xl mb-4',
                config.iconBg
              )}
            >
              <Icon className={cn('w-6 h-6', config.iconColor)} />
            </div>
            
            <h3 className="text-lg font-semibold mb-2 text-fd-foreground">
              {title}
            </h3>
            
            <p className="text-sm text-fd-muted-foreground mb-4">
              {description}
            </p>
          </div>
          
          <div className="mt-auto pt-4 border-t border-fd-border">
            <div className="flex items-center text-sm text-fd-primary">
              <span>Explore space</span>
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

interface SpaceGridProps {
  children: ReactNode;
  className?: string;
}

export function SpaceGrid({ children, className }: SpaceGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {children}
    </div>
  );
}

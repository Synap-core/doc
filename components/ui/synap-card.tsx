/**
 * Wrapper léger autour du Card de Fumadocs
 * Ajoute le branding Synap tout en utilisant le système Fumadocs
 */

import { Card as FumadocsCard, type CardProps as FumadocsCardProps } from 'fumadocs-ui/components/card';
import { Cards } from 'fumadocs-ui/components/card';
import { cn } from '@/lib/utils';

export interface SynapCardProps extends FumadocsCardProps {
  variant?: 'default' | 'emerald' | 'gradient';
}

export function SynapCard({ variant = 'default', className, ...props }: SynapCardProps) {
  const variantClasses = {
    default: '',
    emerald: 'border-emerald-200 dark:border-emerald-800',
    gradient: 'bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 dark:from-emerald-950/20 dark:to-cyan-950/20',
  };

  return (
    <FumadocsCard
      className={cn(
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Cards };
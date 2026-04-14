'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { TeamSignInForm } from '@/components/TeamSignInForm';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Centered modal — do not reuse Search dialog geometry (`top-[10vh]`, `w-[98vw]`);
 * that layout is for a wide command bar, not forms.
 *
 * Inset: match “comfortable” ramp (px-6 / py-5–6), not px-5, so content doesn’t hug the frame.
 */
export function TeamSignInDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm data-[state=closed]:animate-fd-fade-out data-[state=open]:animate-fd-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[100] max-h-[min(90vh,640px)] w-[min(calc(100vw-2rem),24rem)] -translate-x-1/2 -translate-y-1/2',
            'flex flex-col overflow-hidden rounded-xl border border-fd-border bg-fd-popover text-fd-popover-foreground shadow-xl',
            'data-[state=closed]:animate-fd-dialog-out data-[state=open]:animate-fd-dialog-in'
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-fd-border px-6 py-5">
            <div className="min-w-0 pr-2">
              <Dialog.Title className="text-base font-semibold leading-tight text-fd-foreground">
                Team sign-in
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
                Use your Synap account to access internal Team documentation.
              </Dialog.Description>
            </div>
            <Dialog.Close
              className={cn(
                buttonVariants({ color: 'ghost', size: 'icon' }),
                'size-9 shrink-0 text-fd-muted-foreground hover:text-fd-foreground'
              )}
              aria-label="Close"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto px-6 py-6">
            <TeamSignInForm />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

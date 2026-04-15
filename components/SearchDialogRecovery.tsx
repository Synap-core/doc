'use client';

import { useEffect } from 'react';

function recoverStuckModalState() {
  if (typeof document === 'undefined') return;

  const hasOpenDialog =
    document.querySelector('[role="dialog"][data-state="open"]') !== null ||
    document.querySelector('[data-radix-dialog-content][data-state="open"]') !== null;

  if (hasOpenDialog) return;

  const body = document.body;

  if (body.style.pointerEvents === 'none') {
    body.style.pointerEvents = '';
  }

  if (body.style.overflow === 'hidden') {
    body.style.overflow = '';
  }
}

export function SearchDialogRecovery() {
  useEffect(() => {
    const onInteraction = () => recoverStuckModalState();

    const observer = new MutationObserver(() => recoverStuckModalState());
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['style', 'data-scroll-locked'],
    });

    window.addEventListener('keydown', onInteraction);
    window.addEventListener('pointerup', onInteraction);
    window.addEventListener('focusin', onInteraction);

    const interval = window.setInterval(recoverStuckModalState, 1500);

    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', onInteraction);
      window.removeEventListener('pointerup', onInteraction);
      window.removeEventListener('focusin', onInteraction);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}

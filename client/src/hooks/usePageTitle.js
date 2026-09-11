import { useEffect } from 'react';

/**
 * Declarative per-page tab title ("Page | LifeFlow").
 * This SPA has no SSR/Next.js metadata layer, so this hook is the
 * single central place that owns document.title (no ad-hoc effects).
 */
export default function usePageTitle(page) {
  useEffect(() => {
    document.title = page ? `${page} | LifeFlow` : 'LifeFlow';
  }, [page]);
}

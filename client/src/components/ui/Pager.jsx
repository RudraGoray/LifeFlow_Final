import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Prev/Next pager for server-paginated lists.
 * Props: page, limit, total, onPage(nextPage)
 */
export default function Pager({ page = 1, limit = 20, total = 0, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-muted-gray dark:text-gray-400">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
          className="p-2 rounded-lg border border-border-gray dark:border-white/10 text-muted-gray dark:text-gray-400 hover:text-charcoal dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold text-charcoal dark:text-white">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
          className="p-2 rounded-lg border border-border-gray dark:border-white/10 text-muted-gray dark:text-gray-400 hover:text-charcoal dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

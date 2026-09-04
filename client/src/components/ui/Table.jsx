import React from 'react';

export default function Table({ headers, children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-border-gray bg-white ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-border-gray">
            {headers.map((header, i) => (
              <th key={i} className="px-6 py-3 text-xs font-semibold text-muted-gray uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-gray">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className = '' }) {
  return <tr className={`hover:bg-gray-50 transition-colors ${className}`}>{children}</tr>;
}

export function TableCell({ children, className = '' }) {
  return <td className={`px-6 py-4 text-sm text-charcoal whitespace-nowrap ${className}`}>{children}</td>;
}

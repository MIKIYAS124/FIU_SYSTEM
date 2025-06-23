import * as React from "react"

export function Table({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <table className={`min-w-full divide-y divide-gray-200 ${className ?? ""}`}>{children}</table>
}

export function TableHeader({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <thead className={className}>{children}</thead>
}

export function TableBody({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <tbody className={className}>{children}</tbody>
}

export function TableRow({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <tr className={className}>{children}</tr>
}

export function TableHead({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${className ?? ""}`}>{children}</th>
}

export function TableCell({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <td className={`px-6 py-4 whitespace-nowrap ${className ?? ""}`}>{children}</td>
} 
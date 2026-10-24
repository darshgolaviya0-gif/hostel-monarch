export function exportToCSV<T extends object>(filename: string, rows: T[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]) as (keyof T)[];
  const csvRows = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? '';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    ),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

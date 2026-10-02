/**
 * Media Module Display & Formatting Utilities
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện
 */

/**
 * Formats file size in bytes to human-readable string (B, KB, MB, GB).
 */
export function formatBytes(bytes: number | bigint | null | undefined): string {
  if (bytes === null || bytes === undefined) return '0 B';
  const num = typeof bytes === 'bigint' ? Number(bytes) : bytes;
  if (isNaN(num) || num <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(num) / Math.log(1024));
  const unitIndex = Math.min(i, units.length - 1);
  const formatted = (num / Math.pow(1024, unitIndex)).toFixed(unitIndex === 0 ? 0 : 1);

  return `${formatted} ${units[unitIndex]}`;
}

/**
 * Formats ISO date string to Vietnamese date format (DD/MM/YYYY).
 */
export function formatMediaDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

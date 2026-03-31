export const isoDate = (d = new Date()): string => d.toISOString().slice(0, 10);

export function humanDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

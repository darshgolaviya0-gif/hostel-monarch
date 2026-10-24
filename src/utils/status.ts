// Centralised status -> badge color-token mapping used by <Badge /> across the app.
export type BadgeTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'gold'
  | 'purple';

const MAP: Record<string, BadgeTone> = {
  // generic
  Active: 'success',
  Inactive: 'neutral',
  Suspended: 'danger',
  Alumni: 'neutral',
  // payments
  Paid: 'success',
  Pending: 'warning',
  Overdue: 'danger',
  'Partially Paid': 'info',
  Success: 'success',
  Failed: 'danger',
  Processing: 'info',
  // admission
  'Application Started': 'neutral',
  'Documents Uploaded': 'info',
  'Under Review': 'warning',
  Verification: 'purple',
  Approved: 'success',
  Rejected: 'danger',
  // documents
  Uploaded: 'info',
  Verified: 'success',
  // beds
  Available: 'success',
  Occupied: 'info',
  Reserved: 'gold',
  Maintenance: 'warning',
  // complaints
  Open: 'warning',
  Assigned: 'info',
  'In Progress': 'purple',
  Resolved: 'success',
  Closed: 'neutral',
  // priority
  Low: 'neutral',
  Medium: 'info',
  High: 'warning',
  Urgent: 'danger',
  // leave
  Requested: 'neutral',
  'Warden Review': 'warning',
  // qr pass
  Valid: 'success',
  Expired: 'danger',
  Used: 'neutral',
  Invalid: 'danger',
  // visitors / parcels
  'Checked In': 'success',
  'Checked Out': 'neutral',
  Cancelled: 'danger',
  Expected: 'neutral',
  Received: 'info',
  Notified: 'gold',
  Collected: 'success',
  // audit
  Warning: 'warning',
};

export function toneFor(status: string): BadgeTone {
  return MAP[status] ?? 'neutral';
}

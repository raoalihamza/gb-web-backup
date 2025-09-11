const ON_HOLD = 'on hold';
const COMPLETED = 'completed';
const CANCELLED = 'cancelled';
const ACTIVE = 'active';
const EXPIRED = 'expired';

export const E_COMMERCE_STATUSES_COLORS = {
  [ON_HOLD]: '#efb03c',
  [COMPLETED]: '#b6dd5b',
  [CANCELLED]: '#ef3c3c',
  [ACTIVE]: '#bfbfbf',
  [EXPIRED]: '#F58625',
};

export const E_COMMERCE_DELIVERY_STATUSES = {
  needToBePrepare: "need_to_be_prepared",
  prepared: "prepared",
  delivered: "delivered",
  does_not_apply: "does_not_apply",
};

export const PRODUCT_STATUSES = {
  needApproval: 'need approval',
  active: 'active',
  disabled: 'disabled',
  deleted: 'deleted',
  expired: 'expired',
};

export const TENANTS_STATUSES = {
  confirmed: 'confirmed',
  pending: 'pending',
};

export const MATCHES_STATUSES_COLORS = {
  active: 'inherit',
  declined: 'red',
  rejected: 'red',
  cancelled: 'red',
  accepted: 'green',
  suspended: 'orange',
  deleted: 'red',
};
export const MATCHES_STATUSES__FOR_FILTER_ARRAY = [
  'active',
  // 'declined',
  'rejected',
  'accepted',
  // 'suspended',
  'deleted',
];

export const SESSION_DAYS_FOR_FILTER_ARRAY = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

export const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const BARCODES_STATUSES_COLORS = {
  active: 'green',
  used: 'blue',
  valid: 'green',
  cancelled: 'red',
};

export const SENT_CHALLENGE_STATUSES = {
  active: 'active',
  accepted: 'accepted',
  cancelled: 'cancelled',
};

export const CARPOOL_EVENTS_STATUSES_COLORS = {
  failed: 'red',
  success: 'green',
  processing: 'orange',
};
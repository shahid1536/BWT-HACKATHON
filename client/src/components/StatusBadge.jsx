import React from 'react';
import { getExpiryStatus } from '../utils/dateUtils';

const StatusBadge = ({ expiryDate, showDays = false, size = 'normal' }) => {
  const status = getExpiryStatus(expiryDate);

  const sizeClasses =
    size === 'small'
      ? 'px-2 py-0.5 text-xs'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${status.badgeClass} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
      <span>{showDays ? status.daysText : status.label}</span>
    </span>
  );
};

export default StatusBadge;

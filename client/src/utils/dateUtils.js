export const getCalendarDaysDiff = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target - today) / msPerDay);
};

export const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) {
    return {
      type: 'no_expiry',
      label: 'No Expiry Date',
      shortLabel: 'No Expiry',
      daysDiff: null,
      daysText: 'No Expiry Date',
      badgeClass: 'bg-status-none-bg text-text-secondary border-bg-border',
      dotClass: 'bg-text-secondary',
    };
  }

  const daysDiff = getCalendarDaysDiff(expiryDate);
  if (daysDiff === null) {
    return {
      type: 'no_expiry',
      label: 'Invalid Date',
      shortLabel: 'Invalid',
      daysDiff: null,
      daysText: 'Invalid Date',
      badgeClass: 'bg-status-none-bg text-text-secondary border-bg-border',
      dotClass: 'bg-text-secondary',
    };
  }

  if (daysDiff < 0) {
    const absDays = Math.abs(daysDiff);
    return {
      type: 'expired',
      label: 'Expired',
      shortLabel: 'Expired',
      daysDiff,
      daysText: absDays === 1 ? 'Expired yesterday' : `Expired ${absDays} days ago`,
      badgeClass: 'bg-status-expired-bg text-status-expired border-status-expired/30',
      dotClass: 'bg-status-expired',
    };
  }

  if (daysDiff === 0) {
    return {
      type: 'expiring_soon',
      label: 'Expiring Soon',
      shortLabel: 'Today',
      daysDiff,
      daysText: 'Expires today',
      badgeClass: 'bg-status-urgent-bg text-status-urgent border-status-urgent/40',
      dotClass: 'bg-status-urgent animate-pulse',
    };
  }

  if (daysDiff <= 7) {
    return {
      type: 'expiring_soon',
      label: 'Expiring Soon',
      shortLabel: `${daysDiff}d left`,
      daysDiff,
      daysText: daysDiff === 1 ? 'Expires in 1 day' : `Expires in ${daysDiff} days`,
      badgeClass: 'bg-status-urgent-bg text-status-urgent border-status-urgent/40',
      dotClass: 'bg-status-urgent',
    };
  }

  if (daysDiff <= 30) {
    return {
      type: 'expiring_month',
      label: 'Expiring This Month',
      shortLabel: `${daysDiff}d left`,
      daysDiff,
      daysText: `Expires in ${daysDiff} days`,
      badgeClass: 'bg-status-month-bg text-status-month border-status-month/30',
      dotClass: 'bg-status-month',
    };
  }

  return {
    type: 'valid',
    label: 'Valid',
    shortLabel: 'Valid',
    daysDiff,
    daysText: `Expires in ${daysDiff} days`,
    badgeClass: 'bg-status-valid-bg text-accent-emerald border-accent-emerald/30',
    dotClass: 'bg-accent-emerald',
  };
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const toInputDateFormat = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

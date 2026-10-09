import React from 'react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  helper,
  variant = 'default',
  onClick,
}) => {
  const variantStyles = {
    default: {
      border: 'border-bg-border hover:border-zinc-700',
      iconBg: 'bg-zinc-800/80 text-text-secondary',
      valColor: 'text-text-primary',
    },
    lime: {
      border: 'border-bg-border hover:border-accent-lime/40',
      iconBg: 'bg-accent-lime-dim text-accent-lime',
      valColor: 'text-accent-lime',
    },
    warning: {
      border: 'border-bg-border hover:border-status-urgent/40',
      iconBg: 'bg-status-urgent-bg text-status-urgent',
      valColor: 'text-status-urgent',
    },
    danger: {
      border: 'border-bg-border hover:border-status-expired/40',
      iconBg: 'bg-status-expired-bg text-status-expired',
      valColor: 'text-status-expired',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      onClick={onClick}
      className={`bg-bg-surface border ${style.border} rounded-xl p-5 transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:bg-bg-hover' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-3xl font-semibold tracking-tight ${style.valColor}`}>
          {value ?? 0}
        </span>
      </div>

      {helper && (
        <p className="mt-1.5 text-xs text-text-muted">{helper}</p>
      )}
    </div>
  );
};

export default StatCard;

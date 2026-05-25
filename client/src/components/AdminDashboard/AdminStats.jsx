import React from 'react';

export default function AdminStats({ reservations = [], orders = [] }) {
  const today = new Date().toISOString().split('T')[0];
  const todayResCount = reservations.filter(r => r.date === today).length;

  const estimatedRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + (o.subtotal || 0), 0);

  const formattedRevenue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(estimatedRevenue);

  const stats = [
    {
      label: 'Total Bookings',
      value: reservations.length,
      icon: '📅',
      className: 'admin-stat-card border-red-500/20 hover:border-red-500/50',
      iconBg: 'rgba(239, 68, 68, 0.1)',
      iconColor: '#ef4444',
    },
    {
      label: "Today's Reservations",
      value: todayResCount,
      icon: '🗓️',
      className: 'admin-stat-card border-purple-500/20 hover:border-purple-500/50',
      iconBg: 'rgba(168, 85, 247, 0.1)',
      iconColor: '#a855f7',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      icon: '📦',
      className: 'admin-stat-card border-sky-500/20 hover:border-sky-500/50',
      iconBg: 'rgba(14, 165, 233, 0.1)',
      iconColor: '#0ea5e9',
    },
    {
      label: 'Estimated Revenue',
      value: formattedRevenue,
      icon: '💰',
      className: 'admin-stat-card border-emerald-500/20 hover:border-emerald-500/50',
      iconBg: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#10b981',
    },
  ];

  return (
    <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={stat.className}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '1.25rem',
            borderRadius: '12px',
            background: 'var(--bg-alt)',
            border: '1px solid var(--border)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 10px 25px ${stat.iconBg}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div
            className="admin-stat-card__icon"
            style={{
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: stat.iconBg,
              color: stat.iconColor,
            }}
          >
            {stat.icon}
          </div>
          <div className="admin-stat-card__info" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="admin-stat-card__value" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
              {stat.value}
            </div>
            <div className="admin-stat-card__label" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', marginTop: '2px' }}>
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

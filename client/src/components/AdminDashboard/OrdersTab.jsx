import React, { useState } from 'react';

export default function OrdersTab({ orders = [], onUpdateStatus }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      (o.customerName || 'Guest').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o._id || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  const stages = ['received', 'preparing', 'out for delivery', 'completed', 'cancelled'];

  const handleSelectChange = (id, newStatus) => {
    onUpdateStatus(id, newStatus);
  };

  return (
    <div className="admin-tab-content active" id="adminTabOrders">
      {/* Controls */}
      <div className="admin-controls" style={{ display: 'flex', gap: '12px', marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by customer name, email or order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem' }}
        />
        <select
          className="form-input form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '195px', borderRadius: '8px', padding: '10px 36px 10px 12px', fontSize: '0.85rem' }}
        >
          <option value="all">All Orders</option>
          <option value="received">Received</option>
          <option value="preparing">Preparing</option>
          <option value="out for delivery">Out for Delivery</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Grid Table */}
      <div className="admin-table-wrapper" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px' }}>Order ID</th>
              <th style={{ padding: '12px' }}>Customer</th>
              <th style={{ padding: '12px' }}>Items Details</th>
              <th style={{ padding: '12px' }}>Subtotal</th>
              <th style={{ padding: '12px' }}>Current Status</th>
              <th style={{ padding: '12px' }}>Preparation Updates</th>
              <th style={{ padding: '12px' }}>Timeline Logs</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colspan="7" className="text-center" style={{ padding: '2.5rem', fontStyle: 'italic', color: 'var(--text-3)', textAlign: 'center' }}>
                  No orders found matching the filters.
                </td>
              </tr>
            ) : (
              filteredOrders.map(ord => {
                const dateStr = new Date(ord.createdAt).toLocaleDateString('en-IN', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                });

                return (
                  <tr key={ord._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>#{ord._id.slice(-6).toUpperCase()}</span>
                      <div style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-3)' }}>{dateStr}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{ord.customerName || 'Guest'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{ord.customerEmail || 'Anonymous'}</div>
                    </td>
                    <td style={{ padding: '12px', minWidth: '180px' }}>
                      {(ord.items || []).map((item, idx) => (
                        <div key={idx} style={{ fontSize: '0.8rem', padding: '2px 0' }}>
                          <strong>{item.quantity}×</strong> {item.name} <span style={{ color: 'var(--text-3)' }}>(₹{item.price})</span>
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>₹{ord.subtotal}</td>
                    <td style={{ padding: '12px' }}>
                      <span 
                        className={`badge badge--${(ord.status || 'received').replace(/\s+/g, '-')}`}
                        style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {(ord.status || 'received').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <select
                        className="form-input form-select admin-order-status-select"
                        data-id={ord._id}
                        value={ord.status || 'received'}
                        onChange={(e) => handleSelectChange(ord._id, e.target.value)}
                        style={{ padding: '6px 36px 6px 12px', borderRadius: '6px', fontSize: '0.8rem', width: '190px' }}
                      >
                        {stages.map(stage => (
                          <option key={stage} value={stage}>
                            {stage.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '12px', minWidth: '180px' }}>
                      {/* Subdocument array status timeline logs */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.7rem', maxHeight: '75px', overflowY: 'auto', background: 'var(--bg)', padding: '6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        {ord.statusHistory && ord.statusHistory.length > 0 ? (
                          ord.statusHistory.map((history, hIdx) => {
                            const timeStampStr = new Date(history.updatedAt || history.timestamp || Date.now()).toLocaleTimeString('en-IN', {
                              hour: '2-digit', minute: '2-digit', second: '2-digit',
                            });
                            return (
                              <div key={hIdx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-2)' }}>
                                <span style={{ fontWeight: 600 }}>• {history.status.toUpperCase()}</span>
                                <span style={{ color: 'var(--text-3)', fontSize: '0.65rem' }}>{timeStampStr}</span>
                              </div>
                            );
                          })
                        ) : (
                          <span style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>No steps logged.</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

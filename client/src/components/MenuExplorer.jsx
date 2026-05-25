import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_ITEMS } from '../data/menu.js';
import { useCart } from '../context/CartContext';

export default function MenuExplorer() {
  const { addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState('all');
  const [addedItems, setAddedItems] = useState({});

  const categories = [
    { key: 'all', label: 'All Items' },
    { key: 'burgers', label: '🍔 Burgers' },
    { key: 'pizzas', label: '🍕 Pizzas' },
    { key: 'drinks', label: '🥤 Drinks' },
    { key: 'desserts', label: '🍰 Desserts' },
  ];

  const filteredItems = activeFilter === 'all'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(item => item.category === activeFilter);

  const handleAddClick = (item) => {
    addToCart(item);

    // Show visual confirmation on the add button
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 1800);
  };

  return (
    <section className="section menu-section" id="menu" aria-label="Menu">
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="eyebrow">Our Menu</span>
          <h2 className="section-title">Something for Everyone</h2>
          <p className="section-sub">Indian fusion burgers, wood-fired pizzas, craft milkshakes and Indian-inspired desserts — made fresh daily.</p>
        </div>

        <div className="menu-filters" role="tablist" aria-label="Filter by category">
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`tab-btn ${activeFilter === cat.key ? 'is-active' : ''}`}
              role="tab"
              aria-selected={activeFilter === cat.key}
              id={`tab-${cat.key}`}
              onClick={() => setActiveFilter(cat.key)}
              style={{ position: 'relative' }}
            >
              {activeFilter === cat.key && (
                <motion.span
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    backgroundColor: 'var(--primary)',
                    borderRadius: '9999px',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 10, color: activeFilter === cat.key ? 'white' : 'inherit' }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        <motion.div
          layout
          className="menu-grid"
          id="menuGrid"
          role="list"
          aria-label="Menu items"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
              <motion.article
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                className="menu-card"
                role="listitem"
                aria-label={item.name}
              >
                <div className="menu-card__media">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="menu-card__img"
                    loading="lazy"
                    decoding="async"
                  />
                  {item.badge && (
                    <span className={`menu-card__badge ${item.badgeClass}`}>{item.badge}</span>
                  )}
                </div>
                <div className="menu-card__body">
                  <div className="menu-card__cat">{item.category}</div>
                  <h3 className="menu-card__name">{item.name}</h3>
                  <p className="menu-card__desc">{item.desc}</p>
                  <div className="menu-card__footer">
                    <span className="menu-card__price">₹{item.price}</span>
                    <button
                      className={`menu-card__add ${addedItems[item.id] ? 'added' : ''}`}
                      aria-label={`Add ${item.name} to order`}
                      onClick={() => handleAddClick(item)}
                    >
                      {addedItems[item.id] ? '✓' : '+'}
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

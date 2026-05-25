import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onOpenAdmin }) {
  const { theme, toggleTheme } = useTheme();
  const { user, isLoggedIn, setDrawerOpen } = useAuth();
  const isUserLoggedIn = isLoggedIn && user?.role !== 'admin';
  const { itemCount, setCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const links = [
    { href: '#home', label: 'Home' },
    { href: '#flavor-matcher', label: 'Menu Concierge' },
    { href: '#menu', label: 'Menu' },
    { href: '#specials', label: 'Specials' },
    { href: '#about', label: 'Our Story' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#testimonials', label: 'Reviews' },
    { href: '#reservation', label: 'Reserve' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);

      // Track active section
      const sections = ['home', 'flavor-matcher', 'menu', 'specials', 'about', 'gallery', 'testimonials', 'reservation'];
      let current = 'home';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el && window.scrollY >= el.offsetTop - 150) {
          current = sectionId;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBurgerClick = () => {
    if (mobileOpen) {
      setMobileOpen(false);
      document.body.style.overflow = '';
    } else {
      setMobileOpen(true);
      document.body.style.overflow = 'hidden';
    }
  };

  const handleLinkClick = (e, href) => {
    setMobileOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''}`} id="nav" role="banner">
        <div className="nav__inner">
          <a href="#home" className="nav__logo" aria-label="One-Bite — go to homepage">
            <span className="nav__logo-mark" aria-hidden="true">🍔</span>
            <span className="nav__logo-name">One<span className="nav__logo-accent">-Bite</span></span>
          </a>

          <nav aria-label="Primary navigation">
            <ul className={`nav__links ${mobileOpen ? 'is-open' : ''}`} id="navLinks" role="list">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className={`nav__link ${activeSection === href.slice(1) ? 'is-active' : ''}`}
                    onClick={(e) => handleLinkClick(e, href)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav__actions">
            <button className="theme-toggle" id="themeToggle" aria-label="Toggle dark mode" onClick={toggleTheme}>
              {theme === 'light' ? (
                <svg className="theme-icon theme-icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg className="theme-icon theme-icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <button className="user-toggle" id="userToggle" aria-label="Open your profile" aria-haspopup="dialog" onClick={() => setDrawerOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="user-badge" id="userBadge" hidden={!isUserLoggedIn}>●</span>
            </button>

            <button className="cart-toggle" id="cartToggle" aria-label="Open your order" aria-haspopup="dialog" onClick={() => setCartOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <span className="cart-badge" id="cartBadge" hidden={itemCount === 0} aria-label="items in cart">{itemCount}</span>
            </button>

            <a href="#reservation" className="btn btn--primary btn--sm nav__cta">Reserve a Table</a>

            <button
              className={`nav__burger ${mobileOpen ? 'is-open' : ''}`}
              id="navBurger"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="navLinks"
              onClick={handleBurgerClick}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
        <div
          className={`nav__overlay ${mobileOpen ? 'is-open' : ''}`}
          id="navOverlay"
          aria-hidden="true"
          onClick={() => {
            setMobileOpen(false);
            document.body.style.overflow = '';
          }}
        ></div>
      </header>
    </>
  );
}

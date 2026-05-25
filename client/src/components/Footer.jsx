import React from 'react';

export default function Footer({ onOpenAdmin }) {
  const handleAdminClick = (e) => {
    e.preventDefault();
    onOpenAdmin();
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__brand">
              <a href="#home" className="nav__logo" aria-label="One-Bite home">
                <span className="nav__logo-mark" aria-hidden="true">🍔</span>
                <span className="nav__logo-name footer__logo-name">One<span className="nav__logo-accent">-Bite</span></span>
              </a>
              <p className="footer__tagline">Handcrafted Indian fusion burgers and wood-fired pizzas in the heart of Indiranagar, Bengaluru. Made from scratch, every single day.</p>
              <div className="footer__rating" aria-label="4.9 stars, 2400 plus reviews">⭐⭐⭐⭐⭐&nbsp; 4.9 · 2,400+ reviews</div>
            </div>
            <nav className="footer__nav-group" aria-label="Explore">
              <h4 className="footer__nav-heading">Explore</h4>
              <ul className="footer__nav-links" role="list">
                <li><a href="#menu">Full Menu</a></li>
                <li><a href="#specials">Chef's Specials</a></li>
                <li><a href="#flavor-matcher">Menu Concierge</a></li>
                <li><a href="#gallery">Gallery</a></li>
              </ul>
            </nav>
            <nav className="footer__nav-group" aria-label="Company">
              <h4 className="footer__nav-heading">Company</h4>
              <ul className="footer__nav-links" role="list">
                <li><a href="#about">Our Story</a></li>
                <li><a href="#testimonials">Reviews</a></li>
                <li><a href="#reservation">Reserve a Table</a></li>
                <li><a href="mailto:careers@onebite.in">Careers</a></li>
              </ul>
            </nav>
            <div className="footer__nav-group">
              <h4 className="footer__nav-heading">Contact</h4>
              <ul className="footer__nav-links" role="list">
                <li><a href="tel:+918045550192">+91 (80) 4555-0192</a></li>
                <li><a href="mailto:hello@onebite.in">hello@onebite.in</a></li>
                <li>Plot No. 42, 80 Feet Road, Indiranagar, Bengaluru</li>
                <li>Mon – Sun · 11 AM – 11 PM</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          <span>© 2026 One-Bite Hospitality India Pvt. Ltd. All rights reserved.</span>
          <div className="footer__legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#admin" id="adminPortalLink" onClick={handleAdminClick}>Admin Portal</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

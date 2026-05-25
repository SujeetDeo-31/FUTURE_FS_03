import React from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut', delay: 0.6 },
    },
  };

  return (
    <section className="hero" id="home" aria-label="Hero">
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__bg-gradient"></div>
        <div className="hero__bg-noise"></div>
      </div>

      <div className="hero__container">
        <motion.div
          className="hero__content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p className="hero__eyebrow" variants={itemVariants}>
            Now open in Indiranagar · Mon – Sun, 11 AM – 11 PM
          </motion.p>
          <motion.h1 className="hero__title" variants={itemVariants}>
            Bold Flavors.<br />
            <em className="hero__title-em">One Perfect</em><br />
            Bite.
          </motion.h1>
          <motion.p className="hero__tagline" variants={itemVariants}>
            Handcrafted gourmet Indian burgers and wood-fired pizzas made daily from scratch — because shortcuts don't belong in the kitchen.
          </motion.p>

          <motion.div className="hero__stats" aria-label="At a glance" variants={itemVariants}>
            <div className="hero__stat">
              <span className="hero__stat-value">4.9★</span>
              <span className="hero__stat-label">Rating</span>
            </div>
            <div className="hero__stat-divider" aria-hidden="true"></div>
            <div className="hero__stat">
              <span className="hero__stat-value">50K+</span>
              <span className="hero__stat-label">Guests served</span>
            </div>
            <div className="hero__stat-divider" aria-hidden="true"></div>
            <div className="hero__stat">
              <span className="hero__stat-value">6 yrs</span>
              <span className="hero__stat-label">In business</span>
            </div>
          </motion.div>

          <motion.div className="hero__cta" variants={itemVariants}>
            <a href="#menu" className="btn btn--primary btn--lg" id="heroExploreBtn">
              Explore Menu
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#reservation" className="btn btn--ghost btn--lg">Book a Table</a>
          </motion.div>
        </motion.div>

        <div className="hero__visual" aria-hidden="true">
          <motion.div
            className="hero__img-frame"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img
              src="/images/hero_burger.png"
              alt="One-Bite signature Makhani Paneer Crispy Burger"
              className="hero__img"
            />
          </motion.div>

          <motion.div
            className="hero__badge hero__badge--trending"
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
          >
            <span className="hero__badge-icon">🔥</span>
            <div>
              <div className="hero__badge-label">Trending now</div>
              <div className="hero__badge-value">Makhani Paneer Crispy</div>
            </div>
          </motion.div>

          <motion.div
            className="hero__badge hero__badge--award"
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
            style={{ delay: 0.8 }}
          >
            <span className="hero__badge-icon">🏆</span>
            <div>
              <div className="hero__badge-label">Best Gourmet Fusion 2024</div>
              <div className="hero__badge-value">Times Food Awards</div>
            </div>
          </motion.div>
        </div>
      </div>

      <a href="#flavor-matcher" className="hero__scroll-cue" aria-label="Scroll to Menu Concierge">
        <span className="hero__scroll-mouse">
          <span className="hero__scroll-wheel"></span>
        </span>
        <span>Scroll</span>
      </a>
    </section>
  );
}

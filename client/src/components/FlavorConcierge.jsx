import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FLAVOR_GUIDE } from '../data/flavorGuide.js';

export default function FlavorConcierge() {
  const [selectedMood, setSelectedMood] = useState(null);

  const moods = [
    { key: 'adventurous', icon: '🌶️', label: 'Something bold' },
    { key: 'comfort', icon: '🤗', label: 'Comfort food' },
    { key: 'indulgent', icon: '👑', label: 'Go all out' },
    { key: 'light', icon: '🌿', label: 'Light & fresh' },
    { key: 'sharing', icon: '🤝', label: 'Sharing with friends' },
    { key: 'sweet', icon: '🍫', label: 'Save room for dessert' },
  ];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleReset = () => {
    setSelectedMood(null);
  };

  const resultData = selectedMood ? FLAVOR_GUIDE[selectedMood] : null;

  return (
    <section className="section flavor-section" id="flavor-matcher" aria-label="Flavor Guide">
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="eyebrow eyebrow--inv">Menu Concierge</span>
          <h2 className="section-title section-title--inv">Find Your Perfect Dish</h2>
          <p className="section-sub section-sub--inv">Tell us what you're in the mood for and our kitchen team will guide you to the right dish.</p>
        </div>

        <div className="flavor-card">
          <AnimatePresence mode="wait">
            {!selectedMood ? (
              <motion.div
                key="mood-selector"
                className="flavor-moods"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <p className="flavor-prompt">What are you in the mood for?</p>
                <div className="mood-grid" role="group" aria-label="Select a mood">
                  {moods.map(mood => (
                    <button
                      key={mood.key}
                      className="mood-btn"
                      onClick={() => handleMoodSelect(mood.key)}
                      aria-pressed={selectedMood === mood.key}
                    >
                      <span className="mood-btn__icon" aria-hidden="true">{mood.icon}</span>
                      <span className="mood-btn__label">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              resultData && (
                <motion.div
                  key="mood-result"
                  className="flavor-result"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  aria-live="polite"
                >
                  <div className="flavor-result__header">
                    <span className="flavor-result__icon" id="flavorResultIcon" aria-hidden="true">{resultData.icon}</span>
                    <div>
                      <h3 className="flavor-result__title" id="flavorResultTitle">{resultData.title}</h3>
                      <p className="flavor-result__desc" id="flavorResultDesc">{resultData.desc}</p>
                    </div>
                  </div>
                  <div className="flavor-result__reason" id="flavorResultReason">{resultData.reason}</div>
                  <div className="flavor-result__cards" id="flavorResultCards">
                    {resultData.items.map((item, idx) => (
                      <div key={idx} className="flavor-rec-card">
                        <div className="flavor-rec-card__emoji">{item.emoji}</div>
                        <div className="flavor-rec-card__name">{item.name}</div>
                        <div className="flavor-rec-card__cat">{item.category}</div>
                        <div className="flavor-rec-card__price">₹{item.price}</div>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn--outline btn--sm flavor-reset" id="flavorReset" onClick={handleReset}>
                    ← Try a different mood
                  </button>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

import React from 'react';

export default function OurStory() {
  return (
    <section className="section about-section" id="about" aria-label="About One-Bite">
      <div className="container">
        <div className="about-grid">
          <div className="about-visual" data-reveal>
            <div className="about-img-stack">
              <img
                src="/images/interior.png"
                alt="The One-Bite dining room"
                className="about-img-main"
                loading="lazy"
              />
              <div className="about-stat-card" aria-label="Founded 2019, Bengaluru">
                <span className="about-stat-card__value">2019</span>
                <span className="about-stat-card__label">Est. Bengaluru</span>
              </div>
            </div>
          </div>

          <div className="about-copy" data-reveal>
            <span className="eyebrow">Our Story</span>
            <h2 className="section-title section-title--left">Every Bite Should<br />Stop You in Your Tracks</h2>
            <p className="about-text">One-Bite opened its doors in 2019 in Bengaluru with a simple conviction: the street eats and fusion bites served at your favourite casual restaurant could be premium fine-dining quality. Chef Kabir Sen spent twelve years in fine-dining kitchens before channeling those skills into tandoori smash burgers and wood-fired fusion pizzas.</p>
            <p className="about-text">We source our fresh dairy daily, mix our sourdough from scratch every morning, and work with local spice and tea estates since day one. None of it is revolutionary. It's just the right way to do it.</p>
            
            <ul className="about-values" aria-label="Our values">
              <li className="about-value">
                <span className="about-value__icon" aria-hidden="true">🌿</span>
                <div>
                  <strong className="about-value__title">Estate-direct ingredients</strong>
                  <span className="about-value__desc">Sourced from organic local estates within the Western Ghats</span>
                </div>
              </li>
              <li className="about-value">
                <span className="about-value__icon" aria-hidden="true">🔪</span>
                <div>
                  <strong className="about-value__title">Made fresh daily</strong>
                  <span className="about-value__desc">No freezers. Everything prepped before each service.</span>
                </div>
              </li>
              <li className="about-value">
                <span className="about-value__icon" aria-hidden="true">🏆</span>
                <div>
                  <strong className="about-value__title">Award-winning kitchen</strong>
                  <span className="about-value__desc">Best Gourmet Fusion, Times Food Awards — 2022, 2023 &amp; 2024</span>
                </div>
              </li>
            </ul>
            <a href="#menu" className="btn btn--primary">Explore the Menu</a>
          </div>
        </div>
      </div>
    </section>
  );
}

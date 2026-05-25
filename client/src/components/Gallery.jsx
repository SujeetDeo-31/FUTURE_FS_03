import React from 'react';

export default function Gallery({ onOpenLightbox }) {
  const galleryItems = [
    {
      src: '/images/hero_burger.png',
      caption: 'Signature Smash Burger',
      className: 'gallery-item gallery-item--wide',
    },
    {
      src: '/images/pizza_special.png',
      caption: 'Black Truffle Margherita',
      className: 'gallery-item',
    },
    {
      src: '/images/interior.png',
      caption: 'The Dining Room',
      className: 'gallery-item',
    },
    {
      src: '/images/burger_menu.png',
      caption: 'The Double Smash',
      className: 'gallery-item',
    },
    {
      src: '/images/dessert.png',
      caption: 'Lava Cake Deluxe',
      className: 'gallery-item',
    },
    {
      src: '/images/drinks.png',
      caption: 'Craft Milkshakes',
      className: 'gallery-item',
    },
  ];

  return (
    <section className="section gallery-section" id="gallery" aria-label="Food Gallery">
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="eyebrow">Gallery</span>
          <h2 className="section-title">Food That Speaks for Itself</h2>
          <p className="section-sub">A look at what comes out of our kitchen every day.</p>
        </div>

        <div className="gallery-grid" data-reveal>
          {galleryItems.map((item, idx) => (
            <button
              key={idx}
              className={item.className}
              onClick={() => onOpenLightbox(item.src, item.caption)}
              aria-label={`View: ${item.caption}`}
            >
              <img src={item.src} alt={item.caption} loading="lazy" />
              <span className="gallery-item__label">{item.caption}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

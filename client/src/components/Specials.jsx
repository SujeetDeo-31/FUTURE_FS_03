import React from 'react';
import { useCart } from '../context/CartContext';
import { MENU_ITEMS } from '../data/menu.js';

export default function Specials() {
  const { addToCart, setCartOpen } = useCart();

  const handleOrderSpecial = (itemId) => {
    const item = MENU_ITEMS.find(i => i.id === itemId);
    if (item) {
      addToCart(item);
      setCartOpen(true);
    }
  };

  return (
    <section className="section specials-section" id="specials" aria-label="Chef's Specials">
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="eyebrow">This Week</span>
          <h2 className="section-title">Chef's Specials</h2>
          <p className="section-sub">Seasonal dishes curated by Chef Kabir Sen — available for a limited time only.</p>
        </div>

        <div className="specials-grid">
          <article className="special-card special-card--featured" data-reveal>
            <div className="special-card__media">
              <img
                src="/images/burger_menu.png"
                alt="The Paneer Tikka Beast Stack — this week's burger special"
                className="special-card__img"
                loading="lazy"
              />
              <span className="special-card__ribbon">⭐ This week's star</span>
            </div>
            <div className="special-card__body">
              <span className="eyebrow">Burger Special</span>
              <h3 className="special-card__title">Paneer Tikka Beast Stack</h3>
              <p className="special-card__desc">Double-layered spiced paneer steaks, cheddar cheese, caramelized onions, crispy jalapeños, and fresh mint-coriander mayo on a toasted brioche bun. Served with masala peri-peri fries.</p>
              <div className="special-card__footer">
                <div className="special-card__pricing">
                  <s className="special-card__old-price">₹429</s>
                  <strong className="special-card__price">₹329</strong>
                </div>
                <button className="btn btn--primary btn--sm" onClick={() => handleOrderSpecial(2)}>
                  Order Now
                </button>
              </div>
            </div>
          </article>

          <div className="specials-sidebar">
            <article className="special-card special-card--compact" data-reveal>
              <div className="special-card__media">
                <img
                  src="/images/pizza_special.png"
                  alt="Kadhai Paneer Margherita pizza special"
                  className="special-card__img"
                  loading="lazy"
                />
                <span className="special-card__ribbon special-card__ribbon--accent">🍕 Weekend only</span>
              </div>
              <div className="special-card__body">
                <span className="eyebrow">Pizza Special</span>
                <h3 className="special-card__title">Kadhai Paneer Margherita</h3>
                <p className="special-card__desc">Crispy wood-fired sourdough crust, rich makhani sauce base, soft marinated paneer cubes, buffalo mozzarella, and fresh coriander leaves.</p>
                <div className="special-card__footer">
                  <strong className="special-card__price">₹499</strong>
                  <button className="btn btn--outline btn--sm" onClick={() => handleOrderSpecial(5)}>
                    Order
                  </button>
                </div>
              </div>
            </article>

            <article className="special-card special-card--compact" data-reveal>
              <div className="special-card__media">
                <img
                  src="/images/dessert.png"
                  alt="Gulab Jamun Lava Cake dessert special"
                  className="special-card__img"
                  loading="lazy"
                />
                <span className="special-card__ribbon special-card__ribbon--gold">🏆 Fan favourite</span>
              </div>
              <div className="special-card__body">
                <span className="eyebrow">Dessert Special</span>
                <h3 className="special-card__title">Gulab Jamun Lava Cake</h3>
                <p className="special-card__desc">Warm cardamom-spiced Belgian chocolate lava cake with an oozing white chocolate center, served with warm gulab jamun and vanilla bean gelato.</p>
                <div className="special-card__footer">
                  <strong className="special-card__price">₹299</strong>
                  <button className="btn btn--outline btn--sm" onClick={() => handleOrderSpecial(13)}>
                    Order
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * flavorGuide.js — Rule-based flavor recommendation system (Indian Gourmet Style)
 *
 * Each mood maps to a flavor profile, a short explanation of the logic,
 * and an ordered list of dish recommendations.
 */

export const FLAVOR_GUIDE = {
  adventurous: {
    icon: '🌶️',
    title: 'Going bold tonight.',
    desc: "You want heat, intensity and something that stays with you.",
    reason: "We've paired dishes with bold spice profiles — the kind that build heat gradually rather than overwhelming. Each one is calibrated, not just spicy for the sake of it.",
    items: [
      { emoji: '🍔', name: 'Paneer Tikka Beast Stack',    category: 'burger',  price: 329 },
      { emoji: '🍕', name: 'Tandoori Mushroom Diavola Pizza', category: 'pizza',   price: 469 },
      { emoji: '🥤', name: 'Alphonso Mango Mastani',      category: 'drink',   price: 279 },
    ],
  },
  comfort: {
    icon: '🤗',
    title: 'Comfort food done properly.',
    desc: 'Warm, filling and completely satisfying.',
    reason: "Classic combinations that earned their reputation — nothing experimental, just dishes that consistently deliver. The Kadhai Paneer Margherita has been a top favorite since day one.",
    items: [
      { emoji: '🍔', name: 'Makhani Paneer Crispy Burger', category: 'burger',  price: 299 },
      { emoji: '🍕', name: 'Achari Veggie Delight',       category: 'pizza',   price: 449 },
      { emoji: '🍰', name: 'Chocolate Brownie Kulfi',     category: 'dessert', price: 279 },
    ],
  },
  indulgent: {
    icon: '👑',
    title: 'No holding back.',
    desc: "You're not here to be sensible. The full experience, as intended.",
    reason: "These are our highest-tier dishes — royal spiced soya keema, wood-fired paneer, saffron cardamoms. Each one requires more prep and better ingredients. Worth every rupee.",
    items: [
      { emoji: '🍔', name: 'Royal Soya Keema Burger',    category: 'burger',  price: 289 },
      { emoji: '🍕', name: 'Tandoori Mushroom Diavola Pizza', category: 'pizza',   price: 469 },
      { emoji: '🍰', name: 'Gulab Jamun Lava Cake',       category: 'dessert', price: 299 },
      { emoji: '🥤', name: 'Kesar Pista Badam Shake',     category: 'drink',   price: 249 },
    ],
  },
  light: {
    icon: '🌿',
    title: 'Lighter, but still satisfying.',
    desc: 'Clean flavors, quality ingredients.',
    reason: "These dishes are lower in richness but high in flavor — grilled over fried, fresh garden herbs, and a drink that cleanses the palate.",
    items: [
      { emoji: '🍔', name: 'Tandoori Mushroom Avocado Burger', category: 'burger',  price: 319 },
      { emoji: '🍕', name: 'Garden Green Pesto',         category: 'pizza',   price: 429 },
      { emoji: '🥤', name: 'Fresh Nimbu Shikanji',       category: 'drink',   price: 149 },
    ],
  },
  sharing: {
    icon: '🤝',
    title: 'Something for the whole table.',
    desc: "Crowd-pleasers, no compromises.",
    reason: "These are the dishes that reliably disappear fastest when ordering for a group. No strong divisive flavors — broadly appealing but still made properly.",
    items: [
      { emoji: '🍔', name: 'Makhani Paneer Crispy Burger', category: 'burger',  price: 299 },
      { emoji: '🍕', name: 'Kadhai Paneer Margherita',    category: 'pizza',   price: 499 },
      { emoji: '🥤', name: 'Kesar Pista Badam Shake',     category: 'drink',   price: 249 },
      { emoji: '🍰', name: 'Rabri Rasmalai Mousse',       category: 'dessert', price: 249 },
    ],
  },
  sweet: {
    icon: '🍫',
    title: 'Saving room for dessert.',
    desc: "You know what you're here for.",
    reason: "We've paired lighter savoury options with our best desserts — so you can enjoy a full meal without getting to the lava cake already full.",
    items: [
      { emoji: '🍰', name: 'Gulab Jamun Lava Cake',       category: 'dessert', price: 299 },
      { emoji: '🥤', name: 'Alphonso Mango Mastani',      category: 'drink',   price: 279 },
      { emoji: '🍰', name: 'Rabri Rasmalai Mousse',       category: 'dessert', price: 249 },
      { emoji: '🍧', name: 'Saffron Kulfi Falooda',       category: 'dessert', price: 299 },
    ],
  },
};

/**
 * menu.js — One-Bite menu data (Indian Gourmet Style)
 * Single source of truth for all menu items.
 * Import this wherever menu data is needed.
 */

/** @type {Array<MenuItem>} */
export const MENU_ITEMS = [
  // ── Burgers ────────────────────────────────────────────────
  {
    id: 1, category: 'burgers', name: 'Makhani Paneer Crispy Burger',
    desc: 'Crispy fried cottage cheese paneer slab coated in tandoori breadcrumbs, drenched in creamy makhani sauce, topped with fresh coriander and pickled red onions.',
    price: 199, badge: 'BESTSELLER',   badgeClass: 'badge--hot',  img: '/images/hero_burger.png',
  },
  {
    id: 2, category: 'burgers', name: 'Paneer Tikka Beast Stack',
    desc: 'Double-layered spiced paneer steaks, cheddar cheese, caramelized onions, crispy jalapeños, and mint-coriander mayo. A royal vegetarian indulgence.',
    price: 229, badge: 'TRENDING',    badgeClass: 'badge--hot',  img: '/images/burger_menu.png',
  },
  {
    id: 3, category: 'burgers', name: 'Royal Soya Keema Burger',
    desc: 'Spiced slow-cooked soya keema mix, grilled cheese patty, peppery arugula, caramelized onions, and house special mint-chutney spread on a toasted sesame bun.',
    price: 189, badge: "CHEF'S PICK", badgeClass: 'badge--chef', img: '/images/soya_keema_burger.png',
  },
  {
    id: 4, category: 'burgers', name: 'Tandoori Mushroom Avocado Burger',
    desc: 'Juicy butter-roasted tandoori button mushrooms, smashed fresh avocado, tomatoes, crisp leaf lettuce, and a house herb chutney spread on a toasted brioche bun.',
    price: 219, badge: 'NEW',         badgeClass: 'badge--new',  img: '/images/mushroom_avocado_burger.png',
  },

  // ── Pizzas ─────────────────────────────────────────────────
  {
    id: 5, category: 'pizzas', name: 'Kadhai Paneer Margherita',
    desc: 'Wood-fired crust, rich makhani sauce base, soft marinated paneer cubes, buffalo mozzarella, and fresh coriander leaves.',
    price: 349, badge: 'PREMIUM',     badgeClass: 'badge--chef', img: '/images/pizza_special.png',
  },
  {
    id: 6, category: 'pizzas', name: 'Tandoori Mushroom Diavola Pizza',
    desc: 'Wood-fired crust topped with spicy tandoori roasted mushrooms, red onions, hot green chilies, roasted bell peppers, fresh cilantro, and creamy buffalo mozzarella.',
    price: 329, badge: 'SPICY',       badgeClass: 'badge--hot',  img: '/images/diavola_pizza.png',
  },
  {
    id: 7, category: 'pizzas', name: 'Achari Veggie Delight',
    desc: 'Tangy pickled achari vegetables, mozzarella, fontina, crumbled paneer, topped with a sweet mint drizzle.',
    price: 299, badge: 'CROWD FAV',   badgeClass: 'badge--chef', img: '/images/achari_pizza.png',
  },
  {
    id: 8, category: 'pizzas', name: 'Garden Green Pesto',
    desc: 'Seasonal roasted zucchini and bell peppers on a fresh mint-pesto base with crumbled goat cheese and toasted pine nuts.',
    price: 289, badge: 'VEGGIE',      badgeClass: 'badge--new',  img: '/images/pesto_pizza.png',
  },

  // ── Drinks ─────────────────────────────────────────────────
  {
    id: 9,  category: 'drinks', name: 'Kesar Pista Badam Shake',
    desc: 'Hand-churned saffron ice cream blended with crushed pistachios and almonds, topped with silver leaf and roasted nuts.',
    price: 149, badge: 'BESTSELLER',   badgeClass: 'badge--hot',  img: '/images/drinks.png',
  },
  {
    id: 10, category: 'drinks', name: 'Masala Chai Milkshake',
    desc: 'A rich milkshake infused with freshly brewed signature spiced tea, cream, and ginger-cinnamon crumble.',
    price: 139, badge: 'NEW',          badgeClass: 'badge--new',  img: '/images/chai_shake.png',
  },
  {
    id: 11, category: 'drinks', name: 'Fresh Nimbu Shikanji',
    desc: 'Hand-squeezed fresh lemons, lime, rock salt, mint leaves, and roasted cumin powder in sparkling water. Bright and refreshing.',
    price: 99, badge: 'FRESH',        badgeClass: 'badge--new',  img: '/images/nimbu_shikanji.png',
  },
  {
    id: 12, category: 'drinks', name: 'Alphonso Mango Mastani',
    desc: 'Blended pure Alphonso mangoes, creamy vanilla ice cream, topped with chopped almonds and a candied cherry.',
    price: 179, badge: 'BOLD',         badgeClass: 'badge--hot',  img: '/images/mango_mastani.png',
  },

  // ── Desserts ───────────────────────────────────────────────
  {
    id: 13, category: 'desserts', name: 'Gulab Jamun Lava Cake',
    desc: 'Warm cardamom-spiced chocolate cake with an oozing white chocolate center, served with warm gulab jamun and vanilla bean gelato.',
    price: 199, badge: 'FAN FAV',     badgeClass: 'badge--chef', img: '/images/dessert.png',
  },
  {
    id: 14, category: 'desserts', name: 'Rabri Rasmalai Mousse',
    desc: 'Light and airy saffron mousse layered with soft rasmalai chunks and dense, sweetened rabri.',
    price: 159, badge: 'CLASSIC',     badgeClass: 'badge--chef', img: '/images/rasmalai_mousse.png',
  },
  {
    id: 15, category: 'desserts', name: 'Chocolate Brownie Kulfi',
    desc: 'Double-chocolate warm brownie served with a sliced authentic saffron-pistachio malai kulfi, hot fudge, and candied pecans.',
    price: 189, badge: 'HOT',         badgeClass: 'badge--hot',  img: '/images/brownie_kulfi.png',
  },
  {
    id: 16, category: 'desserts', name: 'Saffron Kulfi Falooda',
    desc: 'Rich saffron kulfi slices layered with rose syrup, falooda vermicelli, sweet basil seeds (sabja), and chopped dry fruits.',
    price: 199, badge: 'NEW',         badgeClass: 'badge--new',  img: '/images/kulfi_falooda.png',
  },
];
/** Get items by category */
export function getByCategory(category) {
  if (category === 'all') return MENU_ITEMS;
  return MENU_ITEMS.filter(i => i.category === category);
}

/** Get a single item by ID */
export function getById(id) {
  return MENU_ITEMS.find(i => i.id === id) ?? null;
}

/** Format price to display string */
export function formatPrice(price) {
  return `₹${price.toFixed(0)}`;
}

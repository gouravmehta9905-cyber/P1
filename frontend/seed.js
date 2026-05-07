const axios = require('axios');

const menuItems = [
  { name: 'Coca Cola', category: 'Beverages', price: 203.59, description: '' },
  { name: 'Fanta', category: 'Beverages', price: 203.59, description: '' },
  { name: 'Cola', category: 'Beverages', price: 203.59, description: '' },
  { name: 'Lemon Soda', category: 'Beverages', price: 204.20, description: 'Freshly squeezed' },
  { name: 'Ice Coffee', category: 'Beverages', price: 208.39, description: 'Local brew' },
  { name: 'Cold Tea', category: 'Beverages', price: 203.59, description: 'Sweet or Unsweet' },
  { name: 'Oreo Shake', category: 'Beverages', price: 210.79, description: 'Glass' },

  { name: 'Fried Rice', category: 'Main Course', price: 223.99, description: 'Rich meat sauce' },
  { name: 'Jeera Rice', category: 'Main Course', price: 220.39, description: 'Creamy parmesan sauce' },
  { name: 'Veg Rice', category: 'Main Course', price: 219.19, description: 'Spicy tomato sauce' },
  { name: 'Butter Roti', category: 'Main Course', price: 205.99, description: 'Classic cut' },
  { name: 'Naan', category: 'Main Course', price: 207.19, description: 'Served with honey mustard' },
  { name: 'Garlic Naan', category: 'Main Course', price: 209.59, description: 'Creamy with butter' },
  { name: 'Paneer Butter Masala', category: 'Main Course', price: 226.39, description: 'Layered meat and cheese' },
  { name: 'Chicken Curry', category: 'Main Course', price: 227.59, description: 'Breaded chicken over spaghetti' },
  { name: 'Dal Fry', category: 'Main Course', price: 220.39, description: 'Garlic butter sauce' },

  { name: 'French Fries', category: 'Snacks', price: 205.99, description: 'Classic cut' },
  { name: 'Burger', category: 'Snacks', price: 217.99, description: 'Beef patty, cheddar, lettuce, tomato' },
  { name: 'Sandwich', category: 'Snacks', price: 216.79, description: 'Crispy chicken with spicy mayo' },

  { name: 'Ice Cream', category: 'Desserts', price: 208.39, description: 'Choice of 3 scoops' },
  { name: 'Brownie', category: 'Desserts', price: 211.99, description: 'Warm with vanilla ice cream' },
  { name: 'Gulab Jamun', category: 'Desserts', price: 210.79, description: 'Coffee flavored Italian dessert' }
];

async function seed() {
  console.log(`Seeding ${menuItems.length} items...`);
  let successCount = 0;
  for (const item of menuItems) {
    try {
      await axios.post('http://localhost:8080/api/menu', {
        ...item,
        available: true
      });
      successCount++;
    } catch (err) {
      console.error(`Failed to add ${item.name}:`, err.response?.data || err.message);
    }
  }
  console.log(`Successfully added ${successCount} menu items!`);
}

seed();

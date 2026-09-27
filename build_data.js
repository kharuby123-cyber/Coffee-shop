const fs = require('fs');
const path = require('path');

function parseCSV(text) {
  const lines = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i+1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(cell.trim());
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        lines.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
      lines.push(row);
    }
  }
  return lines;
}

const catText = fs.readFileSync('data/category.csv', 'utf-8');
const prodText = fs.readFileSync('data/product.csv', 'utf-8');

const catRows = parseCSV(catText);
const prodRows = parseCSV(prodText);

const categories = catRows.slice(1).map(r => ({
  id: parseInt(r[0]),
  name: r[1] || '',
  description: r[2] || ''
})).filter(c => !isNaN(c.id));

const products = prodRows.slice(1).map(r => {
  const id = parseInt(r[0]);
  const name = r[1] || '';
  const price = parseInt(r[2]) || 0;
  const image = r[3] || '';
  const description = r[4] || '';
  const published_date = r[5] || '';
  const category_id = parseInt(r[6]) || 1;
  return { id, name, price, image, description, published_date, category_id };
}).filter(p => !isNaN(p.id));

console.log(`Parsed ${categories.length} categories, ${products.length} products.`);

// Verify image paths
products.forEach(p => {
  if (p.image) {
    const exists = fs.existsSync(p.image);
    if (!exists) {
      console.warn(`Warning: Image not found: ${p.image} for product ${p.name}`);
    }
  }
});

const outJs = `// CoffeeShop Data Store
// Automatically loaded from data/category.csv and data/product.csv with dynamic CSV parser support

const COFFEE_CATEGORIES = ${JSON.stringify(categories, null, 2)};

const COFFEE_PRODUCTS = ${JSON.stringify(products, null, 2)};

// CSV Parser Helper for dynamic loading
function parseCSV(text) {
  const lines = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i+1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\\r' || char === '\\n') && !inQuotes) {
      if (char === '\\r' && nextChar === '\\n') i++;
      row.push(cell.trim());
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        lines.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
      lines.push(row);
    }
  }
  return lines;
}

// Data service with fallback and localStorage persistence for cart and feedback
const CoffeeDataService = {
  categories: COFFEE_CATEGORIES,
  products: COFFEE_PRODUCTS,

  async init() {
    try {
      // Attempt to fetch fresh CSV data if hosted via HTTP/HTTPS
      if (window.location.protocol.startsWith('http')) {
        const [catRes, prodRes] = await Promise.all([
          fetch('data/category.csv'),
          fetch('data/product.csv')
        ]);
        if (catRes.ok && prodRes.ok) {
          const catText = await catRes.text();
          const prodText = await prodRes.text();
          const catRows = parseCSV(catText);
          const prodRows = parseCSV(prodText);
          
          this.categories = catRows.slice(1).map(r => ({
            id: parseInt(r[0]),
            name: r[1] || '',
            description: r[2] || ''
          })).filter(c => !isNaN(c.id));

          this.products = prodRows.slice(1).map(r => ({
            id: parseInt(r[0]),
            name: r[1] || '',
            price: parseInt(r[2]) || 0,
            image: r[3] || '',
            description: r[4] || '',
            published_date: r[5] || '',
            category_id: parseInt(r[6]) || 1
          })).filter(p => !isNaN(p.id));
          console.log('CoffeeDataService: Dynamically loaded from CSV files.');
        }
      }
    } catch (e) {
      console.info('Using embedded dataset:', e.message);
    }
    return { categories: this.categories, products: this.products };
  },

  getCategories() {
    return this.categories;
  },

  getCategoryById(id) {
    return this.categories.find(c => c.id === parseInt(id));
  },

  getProducts() {
    return this.products;
  },

  getProductById(id) {
    return this.products.find(p => p.id === parseInt(id));
  },

  getLatestProducts(limit = 8) {
    return [...this.products]
      .sort((a, b) => new Date(b.published_date || 0) - new Date(a.published_date || 0))
      .slice(0, limit);
  },

  getProductsByCategory(categoryId) {
    if (!categoryId || categoryId === 'all' || categoryId === 0) {
      return this.products;
    }
    return this.products.filter(p => p.category_id === parseInt(categoryId));
  },

  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  },

  stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
};

window.CoffeeDataService = CoffeeDataService;
`;

if (!fs.existsSync('js')) {
  fs.mkdirSync('js');
}
fs.writeFileSync('js/data.js', outJs, 'utf-8');
console.log('Successfully generated js/data.js');

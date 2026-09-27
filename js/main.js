// ==========================================================================
// CoffeeShop Main Application Script
// ==========================================================================

async function initApp() {
  // Initialize Data & Cart
  await CoffeeDataService.init();
  CoffeeCart.init();

  // Navigation & UI Helpers
  initNavigation();
  initQuickViewModal();

  // Initialize Auth UI (login/register modal + header button)
  if (window.CoffeeAuth) {
    window.CoffeeAuth.init();
  }

  // Page Specific Inits
  const path = window.location.pathname;
  if (path.includes('products.html')) {
    initProductsPage();
  } else if (path.includes('contact.html')) {
    initContactPage();
  } else {
    // Default to Home page (index.html)
    initHomePage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Toast System
function showToast(message, icon = '<i class="fa-solid fa-mug-hot"></i>') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-text">${message}</span>
  `;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}
window.showToast = showToast;

// Navigation & Header
function initNavigation() {
  const menuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      const isOpen = mainNav.classList.contains('open');
      menuToggle.innerHTML = isOpen
        ? `<i class="fa-solid fa-xmark"></i>`
        : `<i class="fa-solid fa-bars"></i>`;
    });

    // Close when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !menuToggle.contains(e.target) && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
      }
    });
  }

  // Header scroll shadow
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
    } else {
      header.style.boxShadow = 'none';
    }
  });
}

// ==========================================================================
// HOME PAGE LOGIC (index.html)
// ==========================================================================
function initHomePage() {
  initHeroCarousel();
  renderHomeLatestProducts();
}

function initHeroCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.indicator-dot');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const carouselEl = document.querySelector('.hero-carousel');

  if (!slides.length) return;

  let currentIndex = 0;
  let timer = null;
  const slideInterval = 5500;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentIndex = index;
  }

  function nextSlide() {
    let next = (currentIndex + 1) % slides.length;
    showSlide(next);
  }

  function prevSlide() {
    let prev = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  function startAutoPlay() {
    stopAutoPlay();
    timer = setInterval(nextSlide, slideInterval);
  }

  function stopAutoPlay() {
    if (timer) clearInterval(timer);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => {
    nextSlide();
    startAutoPlay();
  });

  if (prevBtn) prevBtn.addEventListener('click', () => {
    prevSlide();
    startAutoPlay();
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      startAutoPlay();
    });
  });

  if (carouselEl) {
    carouselEl.addEventListener('mouseenter', stopAutoPlay);
    carouselEl.addEventListener('mouseleave', startAutoPlay);
  }

  startAutoPlay();
}

function renderHomeLatestProducts() {
  const container = document.getElementById('latestProductsGrid');
  if (!container) return;

  const latest = CoffeeDataService.getLatestProducts(8);
  container.innerHTML = latest.map(prod => renderProductCardHTML(prod)).join('');
}

// ==========================================================================
// PRODUCT CARD TEMPLATE
// ==========================================================================
function renderProductCardHTML(product) {
  const category = CoffeeDataService.getCategoryById(product.category_id);
  const catName = category ? category.name : 'CoffeeShop';

  return `
    <div class="product-card" data-id="${product.id}">
      <span class="product-badge-corner">${catName}</span>
      <div class="product-image-box">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23eee\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext x=\\'50\\' y=\\'50\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-size=\\'12\\'%3ECoffee%3C/text%3E%3C/svg%3E'">
        <div class="product-card-overlay">
          <button class="quick-view-btn" title="Xem nhanh" onclick="openQuickView(${product.id})">
            <i class="fa-solid fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <span class="product-category-name">${catName}</span>
        <h4 class="product-title" title="${product.name}">
          <a href="javascript:void(0)" onclick="openQuickView(${product.id})">${product.name}</a>
        </h4>
        <div class="product-rating">
          <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i> <span>(4.9)</span>
        </div>
        <div class="product-bottom">
          <div class="product-price">${CoffeeDataService.formatPrice(product.price)}</div>
          <button class="add-cart-btn" onclick="CoffeeCart.addItem(${product.id}, 1)">
            <i class="fa-solid fa-cart-plus"></i>
            Thêm
          </button>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// PRODUCTS PAGE LOGIC (products.html)
// ==========================================================================
function initProductsPage() {
  let activeCategory = 'all';
  let searchQuery = '';
  let sortOption = 'default';

  const catNav = document.getElementById('categoryFilterNav');
  const grid = document.getElementById('productsCatalogGrid');
  const searchInput = document.getElementById('productSearchInput');
  const sortSelect = document.getElementById('productSortSelect');
  const counterBadge = document.getElementById('productsCountBadge');

  // Render Category Filter Tabs with dynamic counts
  function renderCategoryTabs() {
    if (!catNav) return;
    const categories = CoffeeDataService.getCategories();
    const allProducts = CoffeeDataService.getProducts();

    const catIconMap = {
      1: 'fa-solid fa-mug-hot',
      2: 'fa-solid fa-snowflake',
      3: 'fa-solid fa-leaf',
      4: 'fa-solid fa-cake-candles'
    };

    let html = `
      <button class="cat-tab-btn ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">
        <i class="fa-solid fa-border-all"></i>
        <span>Tất cả</span>
        <span class="badge-count">${allProducts.length}</span>
      </button>
    `;

    categories.forEach(cat => {
      const count = allProducts.filter(p => p.category_id === cat.id).length;
      const iconClass = catIconMap[cat.id] || 'fa-solid fa-mug-saucer';
      html += `
        <button class="cat-tab-btn ${activeCategory === String(cat.id) ? 'active' : ''}" data-cat="${cat.id}">
          <i class="${iconClass}"></i>
          <span>${cat.name}</span>
          <span class="badge-count">${count}</span>
        </button>
      `;
    });

    catNav.innerHTML = html;

    // Add click listeners
    catNav.querySelectorAll('.cat-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        catNav.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.cat;
        applyFiltersAndRender();
      });
    });
  }

  // Filter & Sort Logic
  function applyFiltersAndRender() {
    let list = CoffeeDataService.getProducts();

    // 1. Filter by category
    if (activeCategory !== 'all') {
      list = list.filter(p => p.category_id === parseInt(activeCategory));
    }

    // 2. Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.trim().toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query)));
    }

    // 3. Sort
    if (sortOption === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortOption === 'name-desc') {
      list.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
    } else if (sortOption === 'newest') {
      list.sort((a, b) => new Date(b.published_date || 0) - new Date(a.published_date || 0));
    }

    // Render results
    if (counterBadge) {
      counterBadge.textContent = `Hiển thị ${list.length} sản phẩm`;
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fa-solid fa-mug-hot" style="font-size: 54px; color: var(--color-primary-light);"></i></div>
          <h3>Không tìm thấy sản phẩm phù hợp</h3>
          <p>Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục khác.</p>
          <button class="btn btn-primary" onclick="document.getElementById('productSearchInput').value=''; document.querySelector('.cat-tab-btn[data-cat=all]').click();">
            Xem tất cả sản phẩm
          </button>
        </div>
      `;
    } else {
      grid.innerHTML = list.map(prod => renderProductCardHTML(prod)).join('');
    }
  }

  // Handle URL hash / search params for category
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  if (catParam) {
    activeCategory = catParam;
  }

  renderCategoryTabs();
  applyFiltersAndRender();

  // Search Input Event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Sort Select Event
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortOption = e.target.value;
      applyFiltersAndRender();
    });
  }
}

// ==========================================================================
// QUICK VIEW MODAL
// ==========================================================================
let currentModalQty = 1;
let currentModalProductId = null;

function initQuickViewModal() {
  const backdrop = document.getElementById('quickViewBackdrop');
  const closeBtn = document.getElementById('quickViewCloseBtn');

  if (closeBtn && backdrop) {
    closeBtn.addEventListener('click', closeQuickView);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeQuickView();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeQuickView();
  });
}

function openQuickView(productId) {
  const product = CoffeeDataService.getProductById(productId);
  if (!product) return;

  currentModalProductId = product.id;
  currentModalQty = 1;

  const category = CoffeeDataService.getCategoryById(product.category_id);
  const catName = category ? category.name : 'CoffeeShop';

  document.getElementById('modalProductImg').src = product.image;
  document.getElementById('modalProductCat').textContent = catName;
  document.getElementById('modalProductTitle').textContent = product.name;
  document.getElementById('modalProductPrice').textContent = CoffeeDataService.formatPrice(product.price);
  
  // Format description
  const cleanDesc = product.description
    ? CoffeeDataService.stripHtml(product.description)
    : 'Hương vị tuyệt hảo pha chế từ nguyên liệu tươi ngon chọn lọc theo công thức độc quyền CoffeeShop.';
  document.getElementById('modalProductDesc').textContent = cleanDesc;

  document.getElementById('modalQtyDisplay').textContent = currentModalQty;

  const backdrop = document.getElementById('quickViewBackdrop');
  if (backdrop) {
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
window.openQuickView = openQuickView;

function closeQuickView() {
  const backdrop = document.getElementById('quickViewBackdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}
window.closeQuickView = closeQuickView;

function changeModalQty(delta) {
  currentModalQty = Math.max(1, currentModalQty + delta);
  document.getElementById('modalQtyDisplay').textContent = currentModalQty;
}
window.changeModalQty = changeModalQty;

function addModalToCart() {
  if (currentModalProductId) {
    CoffeeCart.addItem(currentModalProductId, currentModalQty);
    closeQuickView();
  }
}
window.addModalToCart = addModalToCart;

// ==========================================================================
// CONTACT PAGE LOGIC (contact.html)
// ==========================================================================
function initContactPage() {
  const feedbackForm = document.getElementById('feedbackForm');
  const nameInput = document.getElementById('fbName');
  const emailInput = document.getElementById('fbEmail');
  const phoneInput = document.getElementById('fbPhone');
  const topicSelect = document.getElementById('fbTopic');
  const messageInput = document.getElementById('fbMessage');
  const charCounter = document.getElementById('fbCharCount');
  const starItems = document.querySelectorAll('.rating-picker .star-item');
  let selectedRating = 5;

  // Star Rating Picker
  starItems.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.val);
      updateStarUI(selectedRating);
    });

    star.addEventListener('mouseenter', () => {
      const hoverVal = parseInt(star.dataset.val);
      updateStarUI(hoverVal);
    });
  });

  const ratingPicker = document.querySelector('.rating-picker');
  if (ratingPicker) {
    ratingPicker.addEventListener('mouseleave', () => {
      updateStarUI(selectedRating);
    });
  }

  function updateStarUI(val) {
    starItems.forEach(star => {
      const starVal = parseInt(star.dataset.val);
      star.classList.toggle('selected', starVal <= val);
    });
  }

  // Character counter
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      charCounter.textContent = `${messageInput.value.length} / 500 ký tự`;
    });
  }

  // Form Validation & Submission
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
        showError(nameInput, 'Vui lòng nhập họ và tên (tối thiểu 2 ký tự)');
        isValid = false;
      } else {
        clearError(nameInput);
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        showError(emailInput, 'Vui lòng nhập địa chỉ email hợp lệ');
        isValid = false;
      } else {
        clearError(emailInput);
      }

      // Validate Phone
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneInput.value.trim() || !phoneRegex.test(phoneInput.value.trim())) {
        showError(phoneInput, 'Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 số)');
        isValid = false;
      } else {
        clearError(phoneInput);
      }

      // Validate Message
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        showError(messageInput, 'Nội dung phản hồi cần ít nhất 10 ký tự');
        isValid = false;
      } else {
        clearError(messageInput);
      }

      if (!isValid) return;

      // Submit feedback via API
      const submitBtn = document.getElementById('submitFeedbackBtn');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Đang gửi phản hồi...
      `;

      const feedbackData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput ? phoneInput.value.trim() : undefined,
        topic: topicSelect ? topicSelect.value : 'Góp ý chung',
        rating: selectedRating,
        message: messageInput.value.trim()
      };

      if (window.CoffeeAPI) {
        // Submit to API
        window.CoffeeAPI.submitFeedback(feedbackData).then(res => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;

          if (res.ok) {
            feedbackForm.reset();
            selectedRating = 5;
            updateStarUI(5);
            if (charCounter) charCounter.textContent = '0 / 500 ký tự';
            showToast(`${res.data.message} ❤️`);
          } else {
            showToast(`Lỗi: ${res.data.message || 'Gửi phản hồi thất bại. Thử lại sau.'}`);
          }
        }).catch(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          showToast('Lỗi kết nối. Vui lòng thử lại.');
        });
      } else {
        // Fallback: save to localStorage only
        setTimeout(() => {
          try {
            const stored = JSON.parse(localStorage.getItem('coffeeshop_feedbacks') || '[]');
            stored.push({ ...feedbackData, created_at: new Date().toISOString() });
            localStorage.setItem('coffeeshop_feedbacks', JSON.stringify(stored));
          } catch (e) { console.warn('Storage error', e); }

          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          feedbackForm.reset();
          selectedRating = 5;
          updateStarUI(5);
          if (charCounter) charCounter.textContent = '0 / 500 ký tự';
          showToast('Gửi phản hồi thành công! Cảm ơn bạn ❤️');
        }, 800);
      }
    });
  }

  function showError(inputEl, msg) {
    inputEl.classList.add('error');
    const parent = inputEl.closest('.form-group');
    if (parent) {
      let errEl = parent.querySelector('.error-msg');
      if (errEl) {
        errEl.textContent = msg;
        errEl.classList.add('visible');
      }
    }
  }

  function clearError(inputEl) {
    inputEl.classList.remove('error');
    const parent = inputEl.closest('.form-group');
    if (parent) {
      let errEl = parent.querySelector('.error-msg');
      if (errEl) {
        errEl.classList.remove('visible');
      }
    }
  }

  // Branch Selector Tabs
  const branchTabs = document.querySelectorAll('.branch-tab-btn');
  const branchAddresses = {
    'q1': {
      title: 'CoffeeShop Bến Nghé (Flagship)',
      addr: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      hotline: '028 3822 9999',
      hours: '06:30 - 23:00 hàng ngày',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5177583489814!2d106.69916297593257!3d10.771594959279505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f385570472f%3A0x11946f1a79b6d0e8!2zxJDGsOG7nW5nIEzDqiBM4bujaSwgQuG6v24gTmdow6ksIFF14bqtbiAxLCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmg!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s'
    },
    'q3': {
      title: 'CoffeeShop Võ Văn Tần',
      addr: '215 Võ Văn Tần, Phường 5, Quận 3, TP. Hồ Chí Minh',
      hotline: '028 3930 8888',
      hours: '07:00 - 22:30 hàng ngày',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4674744474776!2d106.6853248759326!3d10.775460559207869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f254559bf6b%3A0xa618e47fcf648bfa!2zVsO1IFbEg24gVOG6p24sIFBoxrDhu51uZyA1LCBRdeG6rW4gMywgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s'
    },
    'hn': {
      title: 'CoffeeShop Tràng Tiền',
      addr: '45 Tràng Tiền, Quận Hoàn Kiếm, TP. Hà Nội',
      hotline: '024 3936 6666',
      hours: '07:00 - 23:00 hàng ngày',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.1685816961476!2d105.85422897587635!3d21.02593928787019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abec28186f91%3A0x8682054ffcb7d6e4!2zVHLDoG5nIFRp4buBbiwgSG_DoG4gS2nhur9tLCBIw6AgTuG7mWk!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s'
    },
    'dn': {
      title: 'CoffeeShop Bạch Đằng',
      addr: '88 Bạch Đằng, Quận Hải Châu, TP. Đà Nẵng',
      hotline: '0236 388 9999',
      hours: '06:30 - 22:30 hàng ngày',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.0205830919934!2d108.2217737757962!3d16.064434239572627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421831899e9009%3A0xaa5b38031e428456!2zQuG6oWNoIMSQ4bqxbmcsIEjhuqNpIENow6J1LCDEkMOgIE7hurVuZw!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s'
    }
  };

  branchTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      branchTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const branchKey = btn.dataset.branch;
      const data = branchAddresses[branchKey];
      if (data) {
        const titleEl = document.getElementById('branchNameText');
        const addrEl = document.getElementById('branchAddrText');
        const phoneEl = document.getElementById('branchPhoneText');
        const hoursEl = document.getElementById('branchHoursText');
        const mapIframe = document.getElementById('branchMapIframe');

        if (titleEl) titleEl.textContent = data.title;
        if (addrEl) addrEl.textContent = data.addr;
        if (phoneEl) phoneEl.textContent = data.hotline;
        if (hoursEl) hoursEl.textContent = data.hours;
        if (mapIframe) mapIframe.src = data.mapUrl;
      }
    });
  });

  // FAQ Accordion
  const faqCards = document.querySelectorAll('.faq-card');
  faqCards.forEach(card => {
    const header = card.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      faqCards.forEach(c => c.classList.remove('open'));
      if (!isOpen) {
        card.classList.add('open');
      }
    });
  });
}

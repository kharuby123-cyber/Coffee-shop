// ==========================================================================
// CoffeeShop Cart Management (localStorage persistence)
// ==========================================================================

const CoffeeCart = {
  items: [],

  init() {
    this.loadFromStorage();
    this.renderBadge();
    this.bindEvents();
  },

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('coffeeshop_cart');
      this.items = stored ? JSON.parse(stored) : [];
    } catch (e) {
      this.items = [];
    }
  },

  saveToStorage() {
    try {
      localStorage.setItem('coffeeshop_cart', JSON.stringify(this.items));
    } catch (e) {
      console.warn('Cannot save to localStorage', e);
    }
    this.renderBadge();
  },

  addItem(productId, quantity = 1) {
    const product = CoffeeDataService.getProductById(productId);
    if (!product) return;

    const existingIndex = this.items.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }

    this.saveToStorage();
    this.renderCartDrawer();
    this.openDrawer();

    if (window.showToast) {
      window.showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
    }
  },

  updateQuantity(productId, newQty) {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;

    if (newQty <= 0) {
      this.removeItem(productId);
    } else {
      item.quantity = newQty;
      this.saveToStorage();
      this.renderCartDrawer();
    }
  },

  removeItem(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.saveToStorage();
    this.renderCartDrawer();
    if (window.showToast) {
      window.showToast('Đã xóa món khỏi giỏ hàng.');
    }
  },

  clearCart() {
    this.items = [];
    this.saveToStorage();
    this.renderCartDrawer();
  },

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalPrice() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  renderBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.getTotalCount();
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  renderCartDrawer() {
    const container = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartDrawerTotal');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-message">
          <div class="cart-empty-icon"><i class="fa-solid fa-mug-hot" style="font-size: 48px; color: var(--color-primary-light);"></i></div>
          <h4>Giỏ hàng của bạn đang trống</h4>
          <p style="font-size: 13px; margin-top: 6px;">Hãy khám phá menu thơm ngon của CoffeeShop nhé!</p>
        </div>
      `;
      if (totalEl) totalEl.textContent = CoffeeDataService.formatPrice(0);
      return;
    }

    let html = '';
    this.items.forEach(item => {
      html += `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23eee\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext x=\\'50\\' y=\\'50\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-size=\\'12\\'%3ECoffee%3C/text%3E%3C/svg%3E'">
          <div class="cart-item-info">
            <h5 class="cart-item-title">${item.name}</h5>
            <div class="cart-item-price">${CoffeeDataService.formatPrice(item.price)}</div>
            <div class="cart-item-controls">
              <button class="qty-btn btn-decrease" onclick="CoffeeCart.updateQuantity(${item.id}, ${item.quantity - 1})"><i class="fa-solid fa-minus"></i></button>
              <span class="qty-display">${item.quantity}</span>
              <button class="qty-btn btn-increase" onclick="CoffeeCart.updateQuantity(${item.id}, ${item.quantity + 1})"><i class="fa-solid fa-plus"></i></button>
            </div>
          </div>
          <button class="cart-item-remove" title="Xóa món" onclick="CoffeeCart.removeItem(${item.id})">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    });

    container.innerHTML = html;
    if (totalEl) {
      totalEl.textContent = CoffeeDataService.formatPrice(this.getTotalPrice());
    }
  },

  openDrawer() {
    const backdrop = document.getElementById('cartBackdrop');
    const drawer = document.getElementById('cartDrawer');
    if (backdrop && drawer) {
      this.renderCartDrawer();
      backdrop.classList.add('open');
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },

  closeDrawer() {
    const backdrop = document.getElementById('cartBackdrop');
    const drawer = document.getElementById('cartDrawer');
    if (backdrop && drawer) {
      backdrop.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  checkout() {
    if (this.items.length === 0) {
      if (window.showToast) window.showToast('Giỏ hàng của bạn đang trống!');
      return;
    }
    this.openCheckoutModal();
  },

  openCheckoutModal() {
    // Remove existing modal if any
    const existing = document.getElementById('checkoutModal');
    if (existing) existing.remove();

    const user = window.CoffeeAPI ? window.CoffeeAPI.getUser() : null;
    const total = this.getTotalPrice();
    const count = this.getTotalCount();

    const modal = document.createElement('div');
    modal.id = 'checkoutModal';
    modal.className = 'auth-modal-backdrop open';
    modal.innerHTML = `
      <div class="auth-modal-dialog" style="max-width: 480px;">
        <button class="auth-modal-close" id="checkoutModalClose"><i class="fa-solid fa-xmark"></i></button>
        <div class="auth-modal-header">
          <div class="auth-logo-icon"><i class="fa-solid fa-bag-shopping"></i></div>
          <h3>Xác Nhận Đặt Hàng</h3>
          <p>${count} sản phẩm · <strong>${CoffeeDataService.formatPrice(total)}</strong></p>
        </div>
        <form id="checkoutForm" novalidate style="margin-top: 20px;">
          <div class="auth-form-group">
            <label>Họ và tên *</label>
            <div class="auth-input-box">
              <i class="fa-solid fa-user"></i>
              <input type="text" id="coName" class="auth-input" placeholder="Nguyễn Văn A" value="${user ? user.full_name : ''}" required>
            </div>
            <div class="auth-error-msg" id="coNameErr"></div>
          </div>
          <div class="auth-form-group">
            <label>Email *</label>
            <div class="auth-input-box">
              <i class="fa-solid fa-envelope"></i>
              <input type="email" id="coEmail" class="auth-input" placeholder="email@example.com" value="${user ? user.email : ''}" required>
            </div>
            <div class="auth-error-msg" id="coEmailErr"></div>
          </div>
          <div class="auth-form-group">
            <label>Số điện thoại *</label>
            <div class="auth-input-box">
              <i class="fa-solid fa-phone"></i>
              <input type="tel" id="coPhone" class="auth-input" placeholder="0901 234 567" value="${user ? (user.phone || '') : ''}" required>
            </div>
            <div class="auth-error-msg" id="coPhoneErr"></div>
          </div>
          <div class="auth-form-group">
            <label>Địa chỉ giao hàng</label>
            <div class="auth-input-box">
              <i class="fa-solid fa-location-dot"></i>
              <input type="text" id="coAddress" class="auth-input" placeholder="123 Đường ABC, Quận X, TP.HCM">
            </div>
          </div>
          <div class="auth-form-group">
            <label>Ghi chú</label>
            <div class="auth-input-box">
              <i class="fa-solid fa-note-sticky"></i>
              <input type="text" id="coNote" class="auth-input" placeholder="Ít đá, ít đường...">
            </div>
          </div>
          <div class="auth-error-msg auth-global-err" id="coGlobalErr"></div>
          <button type="submit" class="btn btn-primary auth-submit-btn" id="coSubmitBtn">
            <span>Đặt Hàng Ngay</span>
            <i class="fa-solid fa-check"></i>
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Close
    document.getElementById('checkoutModalClose').addEventListener('click', () => {
      modal.remove();
      document.body.style.overflow = '';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; }
    });

    // Submit
    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      // Clear errors
      ['coNameErr', 'coEmailErr', 'coPhoneErr', 'coGlobalErr'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = ''; el.style.display = 'none'; }
      });

      const name = document.getElementById('coName').value.trim();
      const email = document.getElementById('coEmail').value.trim();
      const phone = document.getElementById('coPhone').value.trim();
      const address = document.getElementById('coAddress').value.trim();
      const note = document.getElementById('coNote').value.trim();

      let valid = true;
      if (!name) {
        const el = document.getElementById('coNameErr');
        el.textContent = 'Vui lòng nhập họ tên.'; el.style.display = 'block'; valid = false;
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRe.test(email)) {
        const el = document.getElementById('coEmailErr');
        el.textContent = 'Email không hợp lệ.'; el.style.display = 'block'; valid = false;
      }
      if (!phone) {
        const el = document.getElementById('coPhoneErr');
        el.textContent = 'Vui lòng nhập số điện thoại.'; el.style.display = 'block'; valid = false;
      }
      if (!valid) return;

      const btn = document.getElementById('coSubmitBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi đơn...';

      // Prepare order data
      const orderData = {
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        delivery_address: address || undefined,
        note: note || undefined,
        items: CoffeeCart.items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          quantity: item.quantity,
          unit_price: item.price
        }))
      };

      if (window.CoffeeAPI) {
        const res = await window.CoffeeAPI.placeOrder(orderData);
        btn.disabled = false;
        btn.innerHTML = '<span>Đặt Hàng Ngay</span><i class="fa-solid fa-check"></i>';

        if (res.ok) {
          modal.remove();
          document.body.style.overflow = '';
          CoffeeCart.clearCart();
          CoffeeCart.closeDrawer();
          if (window.CoffeeAuth && typeof window.CoffeeAuth.showOrderSuccessModal === 'function') {
            window.CoffeeAuth.showOrderSuccessModal(res.data.order);
          } else if (window.showToast) {
            window.showToast(`${res.data.message} 🎉`);
          }
        } else {
          const el = document.getElementById('coGlobalErr');
          el.textContent = res.data.message || 'Lỗi đặt hàng. Vui lòng thử lại.';
          el.style.display = 'block';
        }
      } else {
        // Fallback if API not available
        btn.disabled = false;
        btn.innerHTML = '<span>Đặt Hàng Ngay</span><i class="fa-solid fa-check"></i>';
        modal.remove();
        document.body.style.overflow = '';
        CoffeeCart.clearCart();
        CoffeeCart.closeDrawer();
        if (window.showToast) window.showToast('Đặt hàng thành công! Chúng tôi sẽ liên hệ bạn sớm. 🎉');
      }
    });
  },

  bindEvents() {
    const toggles = document.querySelectorAll('.cart-toggle-btn');
    toggles.forEach(t => t.addEventListener('click', (e) => {
      e.preventDefault();
      this.openDrawer();
    }));

    const closeBtn = document.getElementById('cartCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());

    const backdrop = document.getElementById('cartBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeDrawer();
      });
    }

    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.checkout());
  }
};

window.CoffeeCart = CoffeeCart;

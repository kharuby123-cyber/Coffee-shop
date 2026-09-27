// ==========================================================================
// CoffeeShop Auth & Orders UI
// Handles Login / Register modal, Luxury User Dropdown, and SQLite Orders View
// ==========================================================================

const CoffeeAuth = {
  currentTab: 'orders', // 'orders' | 'track'
  
  init() {
    this.injectModals();
    this.injectHeaderAuthBtn();
    this.updateHeaderUI();
    this.bindGlobalOrderTriggers();
  },

  // ── Global triggers for "Đơn Hàng" in navigation & elsewhere ─────────────
  bindGlobalOrderTriggers() {
    // Links with id="navOrdersLink" or class="nav-orders-link"
    document.querySelectorAll('#navOrdersLink, .nav-orders-link').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.openOrdersModal();
      });
    });
  },

  // ── Inject All Modals (Auth Modal + Orders Modal + Success Modal) ─────────
  injectModals() {
    this.injectAuthModal();
    this.injectOrdersModal();
  },

  // ── Inject Auth Modal (Login / Register / Profile) ─────────────────────────
  injectAuthModal() {
    if (document.getElementById('authModal')) return;

    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'auth-modal-backdrop';
    modal.innerHTML = `
      <div class="auth-modal-dialog" id="authModalDialog">
        <button class="auth-modal-close" id="authModalClose" title="Đóng">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- Login Form -->
        <div id="authLoginForm" class="auth-form-section">
          <div class="auth-modal-header">
            <div class="auth-logo-icon"><i class="fa-solid fa-mug-hot"></i></div>
            <h3>Đăng Nhập Tài Khoản</h3>
            <p>Chào mừng bạn trở lại với không gian CoffeeShop! ☕</p>
          </div>
          <form id="loginForm" novalidate>
            <div class="auth-form-group">
              <label for="loginEmail">Email đăng nhập</label>
              <div class="auth-input-box">
                <i class="fa-solid fa-envelope"></i>
                <input type="email" id="loginEmail" class="auth-input" placeholder="email@cuaban.com" required autocomplete="email">
              </div>
              <div class="auth-error-msg" id="loginEmailErr"></div>
            </div>
            <div class="auth-form-group">
              <label for="loginPassword">Mật khẩu</label>
              <div class="auth-input-box">
                <i class="fa-solid fa-lock"></i>
                <input type="password" id="loginPassword" class="auth-input" placeholder="••••••••" required autocomplete="current-password">
                <button type="button" class="toggle-pw-btn" id="toggleLoginPw"><i class="fa-solid fa-eye"></i></button>
              </div>
              <div class="auth-error-msg" id="loginPassErr"></div>
            </div>
            <div class="auth-error-msg auth-global-err" id="loginGlobalErr"></div>
            <button type="submit" class="btn btn-primary auth-submit-btn" id="loginSubmitBtn">
              <span>Đăng Nhập Ngay</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </form>
          <div class="auth-switch-box">
            <span>Chưa có tài khoản?</span>
            <button type="button" class="auth-switch-btn" id="goToRegisterBtn">Tạo tài khoản mới</button>
          </div>
        </div>

        <!-- Register Form -->
        <div id="authRegisterForm" class="auth-form-section" style="display:none;">
          <div class="auth-modal-header">
            <div class="auth-logo-icon"><i class="fa-solid fa-mug-hot"></i></div>
            <h3>Tạo Tài Khoản Thành Viên</h3>
            <p>Đăng ký để tích điểm và theo dõi đơn hàng dễ dàng!</p>
          </div>
          <form id="registerForm" novalidate>
            <div class="auth-form-group">
              <label for="regName">Họ và tên *</label>
              <div class="auth-input-box">
                <i class="fa-solid fa-user"></i>
                <input type="text" id="regName" class="auth-input" placeholder="Nguyễn Văn A" required>
              </div>
              <div class="auth-error-msg" id="regNameErr"></div>
            </div>
            <div class="auth-form-group">
              <label for="regEmail">Email *</label>
              <div class="auth-input-box">
                <i class="fa-solid fa-envelope"></i>
                <input type="email" id="regEmail" class="auth-input" placeholder="email@cuaban.com" required>
              </div>
              <div class="auth-error-msg" id="regEmailErr"></div>
            </div>
            <div class="auth-form-group">
              <label for="regPhone">Số điện thoại</label>
              <div class="auth-input-box">
                <i class="fa-solid fa-phone"></i>
                <input type="tel" id="regPhone" class="auth-input" placeholder="0901 234 567">
              </div>
            </div>
            <div class="auth-form-group">
              <label for="regPassword">Mật khẩu * (Tối thiểu 6 ký tự)</label>
              <div class="auth-input-box">
                <i class="fa-solid fa-lock"></i>
                <input type="password" id="regPassword" class="auth-input" placeholder="••••••••" required>
                <button type="button" class="toggle-pw-btn" id="toggleRegPw"><i class="fa-solid fa-eye"></i></button>
              </div>
              <div class="auth-error-msg" id="regPassErr"></div>
            </div>
            <div class="auth-error-msg auth-global-err" id="regGlobalErr"></div>
            <button type="submit" class="btn btn-primary auth-submit-btn" id="registerSubmitBtn">
              <span>Đăng Ký Tài Khoản</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </form>
          <div class="auth-switch-box">
            <span>Đã có tài khoản?</span>
            <button type="button" class="auth-switch-btn" id="goToLoginBtn">Đăng nhập</button>
          </div>
        </div>

        <!-- User Profile Panel -->
        <div id="authProfilePanel" class="auth-form-section" style="display:none;">
          <div class="auth-modal-header">
            <div class="profile-header-avatar" id="profileBigAvatar">A</div>
            <h3 id="profileName">Tài Khoản</h3>
            <p id="profileEmail" style="font-size:13px; color: var(--color-text-light-muted);">email@example.com</p>
            <span class="profile-member-badge"><i class="fa-solid fa-award"></i> Thành viên Thân Thiết CoffeeShop</span>
          </div>

          <div class="profile-quick-actions">
            <button class="btn btn-primary" id="profileViewOrdersBtn" style="width: 100%; margin-bottom: 12px;">
              <i class="fa-solid fa-receipt"></i> Xem Lịch Sử Đơn Hàng Của Tôi
            </button>
          </div>

          <div class="profile-db-note">
            <i class="fa-solid fa-database"></i> Dữ liệu tài khoản & đơn hàng được lưu trữ an toàn trong SQLite (<code>coffeeshop.db</code>).
          </div>

          <button class="btn btn-outline-dark auth-logout-btn" id="logoutBtn" style="width:100%; margin-top: 16px;">
            <i class="fa-solid fa-right-from-bracket"></i> Đăng Xuất
          </button>
        </div>

      </div>
    `;
    document.body.appendChild(modal);
    this.bindAuthEvents();
  },

  // ── Inject Orders Modal (Rich Order Management & Tracking) ────────────────
  injectOrdersModal() {
    if (document.getElementById('ordersModal')) return;

    const modal = document.createElement('div');
    modal.id = 'ordersModal';
    modal.className = 'auth-modal-backdrop';
    modal.innerHTML = `
      <div class="orders-modal-dialog" id="ordersModalDialog">
        <button class="auth-modal-close" id="ordersModalClose" title="Đóng">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="orders-modal-header">
          <div class="orders-title-wrap">
            <div class="orders-logo-icon"><i class="fa-solid fa-box-archive"></i></div>
            <div>
              <h3>Quản Lý Đơn Hàng</h3>
              <p class="orders-subtitle">
                <span class="db-indicator-pill"><i class="fa-solid fa-database"></i> CSDL SQLite: <code>coffeeshop.db</code></span>
                Lưu trữ vĩnh viễn & cập nhật thời gian thực
              </p>
            </div>
          </div>
        </div>

        <!-- Orders Nav Tabs -->
        <div class="orders-tabs-nav">
          <button class="orders-tab-btn active" id="tabMyOrdersBtn">
            <i class="fa-solid fa-receipt"></i> Đơn Hàng Của Tôi
          </button>
          <button class="orders-tab-btn" id="tabTrackOrderBtn">
            <i class="fa-solid fa-magnifying-glass"></i> Tra Cứu Đơn Nhanh
          </button>
        </div>

        <!-- Tab 1: My Orders List -->
        <div class="orders-tab-content active" id="ordersTabMyList">
          <div id="ordersListContainer" class="orders-list-scroll">
            <div class="orders-loading-state">
              <i class="fa-solid fa-spinner fa-spin"></i>
              <p>Đang tải danh sách đơn hàng từ CSDL SQLite...</p>
            </div>
          </div>
        </div>

        <!-- Tab 2: Track Guest Order -->
        <div class="orders-tab-content" id="ordersTabTrack" style="display:none;">
          <div class="track-order-box">
            <p class="track-desc">Nhập Mã đơn hàng và Số điện thoại bạn đã dùng khi đặt hàng để tra cứu tiến trình giao hàng:</p>
            <form id="trackOrderForm" class="track-order-form">
              <div class="track-input-row">
                <div class="auth-form-group">
                  <label for="trackOrderId">Mã đơn hàng (#)</label>
                  <div class="auth-input-box">
                    <i class="fa-solid fa-hashtag"></i>
                    <input type="number" id="trackOrderId" class="auth-input" placeholder="Ví dụ: 1, 2" required>
                  </div>
                </div>
                <div class="auth-form-group">
                  <label for="trackPhone">Số điện thoại đặt hàng</label>
                  <div class="auth-input-box">
                    <i class="fa-solid fa-phone"></i>
                    <input type="tel" id="trackPhone" class="auth-input" placeholder="Ví dụ: 0901234567" required>
                  </div>
                </div>
              </div>
              <button type="submit" class="btn btn-primary" id="trackSubmitBtn" style="width: 100%; margin-top: 10px;">
                <i class="fa-solid fa-magnifying-glass"></i> Tra Cứu Đơn Hàng
              </button>
            </form>
            <div id="trackResultContainer" style="margin-top: 20px;"></div>
          </div>
        </div>

      </div>
    `;
    document.body.appendChild(modal);
    this.bindOrdersEvents();
  },

  // ── Inject Header Auth Button & Luxury Dropdown ───────────────────────────
  injectHeaderAuthBtn() {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions || document.getElementById('authHeaderWrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'auth-header-wrapper';
    wrapper.id = 'authHeaderWrapper';

    // Insert before cart button
    const cartBtn = document.getElementById('cartToggleBtn');
    if (cartBtn) {
      headerActions.insertBefore(wrapper, cartBtn);
    } else {
      headerActions.appendChild(wrapper);
    }
  },

  // ── Update Header UI (Handles Logged-In and Logged-Out states) ─────────────
  updateHeaderUI() {
    const wrapper = document.getElementById('authHeaderWrapper');
    if (!wrapper) return;

    if (CoffeeAPI.isLoggedIn()) {
      const user = CoffeeAPI.getUser() || {};
      const fullName = user.full_name || 'Khách hàng';
      const shortName = fullName.split(' ').pop() || fullName;
      const initials = shortName.charAt(0).toUpperCase();

      wrapper.innerHTML = `
        <div class="auth-user-dropdown" id="authUserDropdown">
          <button class="auth-user-chip" id="authUserChip" aria-expanded="false" title="Tài khoản: ${fullName}">
            <span class="auth-avatar-ring">
              <span class="auth-avatar-letter">${initials}</span>
              <span class="auth-online-dot"></span>
            </span>
            <span class="auth-user-meta">
              <span class="auth-greeting-label">Xin chào</span>
              <span class="auth-user-name">${shortName}</span>
            </span>
            <i class="fa-solid fa-chevron-down auth-chevron"></i>
          </button>

          <!-- Luxury Dropdown Panel -->
          <div class="auth-dropdown-panel" id="authDropdownPanel">
            <div class="dropdown-user-header">
              <div class="dropdown-avatar">${initials}</div>
              <div class="dropdown-user-meta">
                <strong class="dropdown-user-name">${fullName}</strong>
                <span class="dropdown-user-email">${user.email || ''}</span>
                <span class="dropdown-user-badge"><i class="fa-solid fa-crown"></i> Khách hàng thân thiết</span>
              </div>
            </div>

            <div class="dropdown-menu-list">
              <button class="dropdown-menu-item" id="menuMyOrdersBtn">
                <div class="dropdown-item-icon"><i class="fa-solid fa-receipt"></i></div>
                <div class="dropdown-item-content">
                  <strong>Đơn hàng của tôi</strong>
                  <span class="dropdown-item-sub">Lịch sử & trạng thái giao hàng</span>
                </div>
                <span class="dropdown-item-pill" id="menuOrderBadge">...</span>
              </button>

              <button class="dropdown-menu-item" id="menuProfileBtn">
                <div class="dropdown-item-icon"><i class="fa-solid fa-user-gear"></i></div>
                <div class="dropdown-item-content">
                  <strong>Thông tin tài khoản</strong>
                  <span class="dropdown-item-sub">Cập nhật hồ sơ cá nhân</span>
                </div>
              </button>

              <button class="dropdown-menu-item" id="menuTrackOrderBtn">
                <div class="dropdown-item-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
                <div class="dropdown-item-content">
                  <strong>Tra cứu đơn hàng</strong>
                  <span class="dropdown-item-sub">Tra cứu bằng mã & SĐT</span>
                </div>
              </button>
            </div>

            <div class="dropdown-footer">
              <button class="dropdown-logout-btn" id="menuLogoutBtn">
                <i class="fa-solid fa-right-from-bracket"></i> Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      `;

      this.bindDropdownEvents();
      this.fetchOrderCount();
    } else {
      // Logged OUT state: Elegant glassmorphic button matching other action buttons
      wrapper.innerHTML = `
        <button class="auth-header-btn" id="authHeaderBtn" title="Đăng nhập / Đăng ký" aria-label="Tài khoản">
          <span class="auth-btn-icon"><i class="fa-regular fa-user"></i></span>
          <span class="auth-btn-label">Đăng nhập</span>
        </button>
      `;

      document.getElementById('authHeaderBtn')?.addEventListener('click', () => {
        this.openAuthModal('login');
      });
    }
  },

  // ── Bind Dropdown Events ──────────────────────────────────────────────────
  bindDropdownEvents() {
    const chip = document.getElementById('authUserChip');
    const panel = document.getElementById('authDropdownPanel');
    if (!chip || !panel) return;

    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.contains('show');
      if (isOpen) {
        panel.classList.remove('show');
        chip.setAttribute('aria-expanded', 'false');
      } else {
        panel.classList.add('show');
        chip.setAttribute('aria-expanded', 'true');
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !chip.contains(e.target)) {
        panel.classList.remove('show');
        chip.setAttribute('aria-expanded', 'false');
      }
    });

    // Dropdown Items
    document.getElementById('menuMyOrdersBtn')?.addEventListener('click', () => {
      panel.classList.remove('show');
      this.openOrdersModal('orders');
    });

    document.getElementById('menuProfileBtn')?.addEventListener('click', () => {
      panel.classList.remove('show');
      this.openAuthModal('profile');
    });

    document.getElementById('menuTrackOrderBtn')?.addEventListener('click', () => {
      panel.classList.remove('show');
      this.openOrdersModal('track');
    });

    document.getElementById('menuLogoutBtn')?.addEventListener('click', () => {
      panel.classList.remove('show');
      CoffeeAPI.logout();
      this.updateHeaderUI();
      if (typeof showToast === 'function') showToast('Đã đăng xuất tài khoản thành công.');
    });
  },

  // ── Fetch Order Count for Dropdown Badge ──────────────────────────────────
  async fetchOrderCount() {
    const badge = document.getElementById('menuOrderBadge');
    if (!badge || !CoffeeAPI.isLoggedIn()) return;
    try {
      const res = await CoffeeAPI.getMyOrders();
      if (res.ok && res.data.orders) {
        const count = res.data.orders.length;
        badge.textContent = `${count} đơn`;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    } catch {
      badge.style.display = 'none';
    }
  },

  // ── Bind Auth Modal Events ────────────────────────────────────────────────
  bindAuthEvents() {
    document.getElementById('authModalClose')?.addEventListener('click', () => this.closeAuthModal());
    document.getElementById('authModal')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('authModal')) this.closeAuthModal();
    });

    document.getElementById('goToRegisterBtn')?.addEventListener('click', () => this.showAuthForm('register'));
    document.getElementById('goToLoginBtn')?.addEventListener('click', () => this.showAuthForm('login'));

    this.bindPasswordToggle('toggleLoginPw', 'loginPassword');
    this.bindPasswordToggle('toggleRegPw', 'regPassword');

    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      CoffeeAPI.logout();
      this.closeAuthModal();
      this.updateHeaderUI();
      if (typeof showToast === 'function') showToast('Đã đăng xuất khỏi tài khoản.');
    });

    document.getElementById('profileViewOrdersBtn')?.addEventListener('click', () => {
      this.closeAuthModal();
      this.openOrdersModal('orders');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAuthModal();
        this.closeOrdersModal();
      }
    });
  },

  // ── Bind Orders Modal Events ──────────────────────────────────────────────
  bindOrdersEvents() {
    document.getElementById('ordersModalClose')?.addEventListener('click', () => this.closeOrdersModal());
    document.getElementById('ordersModal')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('ordersModal')) this.closeOrdersModal();
    });

    // Tab switching
    const tabMyOrdersBtn = document.getElementById('tabMyOrdersBtn');
    const tabTrackOrderBtn = document.getElementById('tabTrackOrderBtn');
    const ordersTabMyList = document.getElementById('ordersTabMyList');
    const ordersTabTrack = document.getElementById('ordersTabTrack');

    tabMyOrdersBtn?.addEventListener('click', () => {
      tabMyOrdersBtn.classList.add('active');
      tabTrackOrderBtn.classList.remove('active');
      ordersTabMyList.style.display = 'block';
      ordersTabTrack.style.display = 'none';
      this.loadMyOrders();
    });

    tabTrackOrderBtn?.addEventListener('click', () => {
      tabTrackOrderBtn.classList.add('active');
      tabMyOrdersBtn.classList.remove('active');
      ordersTabTrack.style.display = 'block';
      ordersTabMyList.style.display = 'none';
    });

    // Track Form Submit
    document.getElementById('trackOrderForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const orderId = document.getElementById('trackOrderId').value.trim();
      const phone = document.getElementById('trackPhone').value.trim();
      if (!orderId || !phone) return;

      const btn = document.getElementById('trackSubmitBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tìm kiếm...';

      const resultBox = document.getElementById('trackResultContainer');
      resultBox.innerHTML = '';

      const res = await CoffeeAPI.trackOrder(orderId, phone);
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Tra Cứu Đơn Hàng';

      if (res.ok && res.data.order) {
        resultBox.innerHTML = this.renderSingleOrderCard(res.data.order);
      } else {
        resultBox.innerHTML = `
          <div class="track-not-found">
            <i class="fa-solid fa-circle-exclamation"></i>
            <h5>Không tìm thấy đơn hàng</h5>
            <p>Vui lòng kiểm tra lại Mã đơn (#${orderId}) và Số điện thoại (${phone}).</p>
          </div>
        `;
      }
    });
  },

  bindPasswordToggle(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.innerHTML = `<i class="fa-solid fa-eye${isPass ? '-slash' : ''}"></i>`;
    });
  },

  // ── Open / Close Modals ───────────────────────────────────────────────────
  openAuthModal(mode = 'login') {
    const modal = document.getElementById('authModal');
    if (!modal) return;

    if (CoffeeAPI.isLoggedIn() && mode === 'profile') {
      this.showAuthForm('profile');
      this.loadProfileData();
    } else if (CoffeeAPI.isLoggedIn()) {
      this.showAuthForm('profile');
      this.loadProfileData();
    } else {
      this.showAuthForm(mode || 'login');
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  openOrdersModal(tab = 'orders') {
    const modal = document.getElementById('ordersModal');
    if (!modal) return;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    const tabMyOrdersBtn = document.getElementById('tabMyOrdersBtn');
    const tabTrackOrderBtn = document.getElementById('tabTrackOrderBtn');
    const ordersTabMyList = document.getElementById('ordersTabMyList');
    const ordersTabTrack = document.getElementById('ordersTabTrack');

    if (tab === 'track' || (!CoffeeAPI.isLoggedIn() && tab !== 'orders')) {
      tabTrackOrderBtn?.classList.add('active');
      tabMyOrdersBtn?.classList.remove('active');
      if (ordersTabTrack) ordersTabTrack.style.display = 'block';
      if (ordersTabMyList) ordersTabMyList.style.display = 'none';
    } else {
      tabMyOrdersBtn?.classList.add('active');
      tabTrackOrderBtn?.classList.remove('active');
      if (ordersTabMyList) ordersTabMyList.style.display = 'block';
      if (ordersTabTrack) ordersTabTrack.style.display = 'none';
      this.loadMyOrders();
    }
  },

  closeOrdersModal() {
    const modal = document.getElementById('ordersModal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  showAuthForm(mode) {
    document.getElementById('authLoginForm').style.display = mode === 'login' ? 'block' : 'none';
    document.getElementById('authRegisterForm').style.display = mode === 'register' ? 'block' : 'none';
    document.getElementById('authProfilePanel').style.display = mode === 'profile' ? 'block' : 'none';
    this.clearErrors();
  },

  clearErrors() {
    document.querySelectorAll('.auth-error-msg').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
    document.querySelectorAll('.auth-input').forEach(el => {
      el.classList.remove('error');
    });
  },

  showError(elId, msg) {
    const el = document.getElementById(elId);
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  },

  // ── Handle Login ──────────────────────────────────────────────────────────
  async handleLogin() {
    this.clearErrors();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email) { this.showError('loginEmailErr', 'Vui lòng nhập email.'); return; }
    if (!password) { this.showError('loginPassErr', 'Vui lòng nhập mật khẩu.'); return; }

    const btn = document.getElementById('loginSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đăng nhập...';

    const res = await CoffeeAPI.login(email, password);
    btn.disabled = false;
    btn.innerHTML = '<span>Đăng Nhập Ngay</span><i class="fa-solid fa-arrow-right"></i>';

    if (res.ok) {
      this.closeAuthModal();
      this.updateHeaderUI();
      if (typeof showToast === 'function') {
        showToast(`${res.data.message} 🎉`);
      }
    } else {
      this.showError('loginGlobalErr', res.data.message || 'Đăng nhập thất bại.');
    }
  },

  // ── Handle Register ───────────────────────────────────────────────────────
  async handleRegister() {
    this.clearErrors();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;

    let valid = true;
    if (!name || name.length < 2) {
      this.showError('regNameErr', 'Vui lòng nhập họ tên (ít nhất 2 ký tự).');
      valid = false;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRe.test(email)) {
      this.showError('regEmailErr', 'Email không hợp lệ.');
      valid = false;
    }
    if (!password || password.length < 6) {
      this.showError('regPassErr', 'Mật khẩu cần ít nhất 6 ký tự.');
      valid = false;
    }
    if (!valid) return;

    const btn = document.getElementById('registerSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo tài khoản...';

    const res = await CoffeeAPI.register(name, email, phone, password);
    btn.disabled = false;
    btn.innerHTML = '<span>Đăng Ký Tài Khoản</span><i class="fa-solid fa-arrow-right"></i>';

    if (res.ok) {
      this.closeAuthModal();
      this.updateHeaderUI();
      if (typeof showToast === 'function') {
        showToast(`${res.data.message} 🎉`);
      }
    } else {
      this.showError('regGlobalErr', res.data.message || 'Đăng ký thất bại. Thử lại sau.');
    }
  },

  // ── Load Profile Data ─────────────────────────────────────────────────────
  loadProfileData() {
    const user = CoffeeAPI.getUser();
    if (!user) return;

    const shortName = user.full_name ? user.full_name.split(' ').pop() : '';
    const initial = shortName ? shortName.charAt(0).toUpperCase() : 'U';

    const avatarEl = document.getElementById('profileBigAvatar');
    if (avatarEl) avatarEl.textContent = initial;

    const nameEl = document.getElementById('profileName');
    if (nameEl) nameEl.textContent = user.full_name || 'Khách hàng';

    const emailEl = document.getElementById('profileEmail');
    if (emailEl) emailEl.textContent = user.email || '';
  },

  // ── Load My Orders (from SQLite DB via API) ────────────────────────────────
  async loadMyOrders() {
    const container = document.getElementById('ordersListContainer');
    if (!container) return;

    if (!CoffeeAPI.isLoggedIn()) {
      container.innerHTML = `
        <div class="orders-guest-prompt">
          <div class="prompt-icon"><i class="fa-solid fa-user-lock"></i></div>
          <h4>Bạn chưa đăng nhập</h4>
          <p>Đăng nhập tài khoản để xem toàn bộ lịch sử các đơn hàng đã đặt của bạn, hoặc dùng tab <strong>Tra cứu đơn nhanh</strong>.</p>
          <div class="prompt-actions">
            <button class="btn btn-primary" onclick="CoffeeAuth.closeOrdersModal(); CoffeeAuth.openAuthModal('login');">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> Đăng Nhập Ngay
            </button>
            <button class="btn btn-outline-dark" onclick="document.getElementById('tabTrackOrderBtn').click();">
              <i class="fa-solid fa-magnifying-glass"></i> Tra Cứu Bằng Mã & SĐT
            </button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="orders-loading-state">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Đang tải đơn hàng từ CSDL SQLite (coffeeshop.db)...</p>
      </div>
    `;

    const res = await CoffeeAPI.getMyOrders();
    if (!res.ok || !res.data.orders || res.data.orders.length === 0) {
      container.innerHTML = `
        <div class="orders-empty-state">
          <div class="empty-icon"><i class="fa-solid fa-mug-saucer"></i></div>
          <h4>Bạn chưa có đơn hàng nào</h4>
          <p>Tất cả đơn hàng của bạn sẽ được lưu trữ an toàn trong CSDL SQLite và hiển thị tại đây.</p>
          <a href="products.html" class="btn btn-primary" onclick="CoffeeAuth.closeOrdersModal();">
            <i class="fa-solid fa-coffee"></i> Khám Phá Menu CoffeeShop
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="orders-list-summary">
        <span>Tổng cộng: <strong>${res.data.orders.length} đơn hàng</strong></span>
        <span class="db-storage-tag"><i class="fa-solid fa-database"></i> Đã lưu trữ trong CSDL</span>
      </div>
      <div class="orders-cards-list">
        ${res.data.orders.map(order => this.renderSingleOrderCard(order)).join('')}
      </div>
    `;
  },

  // ── Render Rich Order Card ────────────────────────────────────────────────
  renderSingleOrderCard(order) {
    const statusMap = {
      pending: { label: 'Chờ xác nhận', cls: 'status-pending', icon: 'fa-clock', step: 1 },
      confirmed: { label: 'Đã tiếp nhận', cls: 'status-confirmed', icon: 'fa-check', step: 2 },
      preparing: { label: 'Đang pha chế', cls: 'status-preparing', icon: 'fa-blender', step: 3 },
      delivering: { label: 'Đang giao hàng', cls: 'status-delivering', icon: 'fa-truck-fast', step: 4 },
      completed: { label: 'Giao thành công', cls: 'status-completed', icon: 'fa-circle-check', step: 5 },
      cancelled: { label: 'Đã huỷ', cls: 'status-cancelled', icon: 'fa-circle-xmark', step: 0 }
    };

    const st = statusMap[order.status] || { label: order.status, cls: '', icon: 'fa-receipt', step: 1 };
    const date = new Date(order.created_at).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
    const items = order.items || [];
    const formattedTotal = new Intl.NumberFormat('vi-VN').format(order.total_amount);

    // Build timeline stepper
    const steps = [
      { num: 1, title: 'Đã đặt' },
      { num: 2, title: 'Tiếp nhận' },
      { num: 3, title: 'Pha chế' },
      { num: 4, title: 'Đang giao' },
      { num: 5, title: 'Hoàn tất' }
    ];

    const isCancelled = order.status === 'cancelled';
    const currentStep = st.step;

    const stepperHtml = isCancelled ? `
      <div class="order-cancelled-banner">
        <i class="fa-solid fa-ban"></i> Đơn hàng này đã bị hủy.
      </div>
    ` : `
      <div class="order-stepper">
        ${steps.map(s => {
          const isDone = s.num <= currentStep;
          const isCurrent = s.num === currentStep;
          return `
            <div class="stepper-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}">
              <div class="stepper-bullet">
                <i class="fa-solid ${isDone ? 'fa-check' : 'fa-circle'}"></i>
              </div>
              <span class="stepper-label">${s.title}</span>
            </div>
          `;
        }).join('<div class="stepper-line"></div>')}
      </div>
    `;

    // Build items HTML
    const itemsHtml = items.map(item => `
      <div class="order-item-row">
        <div class="order-item-thumb">
          <img src="${item.product_image || 'images/default-coffee.jpg'}" alt="${item.product_name}" 
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 40 40\\'%3E%3Crect fill=\\'%2353382c\\' width=\\'40\\' height=\\'40\\'/%3E%3Ctext fill=\\'%23fff\\' x=\\'50%\\' y=\\'55%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-size=\\'18\\'%3E☕%3C/text%3E%3C/svg%3E'">
        </div>
        <div class="order-item-details">
          <h6 class="order-item-name">${item.product_name}</h6>
          <span class="order-item-price-qty">
            ${new Intl.NumberFormat('vi-VN').format(item.unit_price)}đ × ${item.quantity}
          </span>
        </div>
        <div class="order-item-subtotal">
          <strong>${new Intl.NumberFormat('vi-VN').format(item.subtotal || (item.unit_price * item.quantity))}đ</strong>
        </div>
      </div>
    `).join('');

    return `
      <div class="order-detail-card" id="orderCard${order.id}">
        <!-- Card Top Bar -->
        <div class="order-card-header">
          <div class="order-id-group">
            <span class="order-id-badge">#DH-${String(order.id).padStart(3, '0')}</span>
            <span class="order-time"><i class="fa-regular fa-calendar-check"></i> ${date}</span>
          </div>
          <span class="order-status-pill ${st.cls}">
            <i class="fa-solid ${st.icon}"></i> ${st.label}
          </span>
        </div>

        <!-- Timeline Stepper -->
        ${stepperHtml}

        <!-- Items List -->
        <div class="order-card-items">
          ${itemsHtml}
        </div>

        <!-- Delivery & Payment Info -->
        <div class="order-card-footer">
          <div class="order-delivery-meta">
            <p><i class="fa-solid fa-user"></i> <strong>${order.customer_name}</strong> · <i class="fa-solid fa-phone"></i> ${order.customer_phone}</p>
            <p><i class="fa-solid fa-location-dot"></i> ${order.delivery_address || 'Nhận tại quầy CoffeeShop'}</p>
            ${order.note ? `<p><i class="fa-regular fa-comment-dots"></i> <em>Ghi chú: ${order.note}</em></p>` : ''}
          </div>
          <div class="order-total-block">
            <span class="total-label">Tổng thanh toán (COD):</span>
            <span class="total-number">${formattedTotal}đ</span>
          </div>
        </div>
      </div>
    `;
  },

  // ── Show Success Modal after placing order ─────────────────────────────────
  showOrderSuccessModal(order) {
    const existing = document.getElementById('orderSuccessModal');
    if (existing) existing.remove();

    const formattedTotal = new Intl.NumberFormat('vi-VN').format(order.total_amount);
    const modal = document.createElement('div');
    modal.id = 'orderSuccessModal';
    modal.className = 'auth-modal-backdrop open';
    modal.innerHTML = `
      <div class="success-modal-dialog">
        <div class="success-icon-wrap">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <h3>Đặt Hàng Thành Công! 🎉</h3>
        <p class="success-order-code">Mã đơn hàng: <strong>#DH-${String(order.id).padStart(3, '0')}</strong></p>
        
        <div class="success-db-alert">
          <i class="fa-solid fa-database"></i>
          <div>
            <strong>Đơn hàng đã được lưu trữ trong CSDL SQLite:</strong>
            <p>Bảng <code>orders</code> & <code>order_items</code> tại <code>coffeeshop.db</code></p>
          </div>
        </div>

        <div class="success-order-summary">
          <div class="summary-line">
            <span>Người nhận:</span>
            <strong>${order.customer_name} (${order.customer_phone})</strong>
          </div>
          <div class="summary-line">
            <span>Tổng thanh toán:</span>
            <strong style="color: var(--color-accent-gold); font-size: 16px;">${formattedTotal}đ</strong>
          </div>
          <div class="summary-line">
            <span>Giao đến:</span>
            <span>${order.delivery_address || 'Nhận tại quầy'}</span>
          </div>
        </div>

        <div class="success-modal-actions">
          <button class="btn btn-primary" id="btnSuccessViewOrders" style="width: 100%;">
            <i class="fa-solid fa-receipt"></i> Xem Chi Tiết Đơn Hàng Của Bạn
          </button>
          <button class="btn btn-secondary" id="btnSuccessContinue" style="width: 100%; margin-top: 10px;">
            Tiếp Tục Mua Sắm
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    document.getElementById('btnSuccessViewOrders')?.addEventListener('click', () => {
      modal.remove();
      document.body.style.overflow = '';
      this.openOrdersModal('orders');
    });

    document.getElementById('btnSuccessContinue')?.addEventListener('click', () => {
      modal.remove();
      document.body.style.overflow = '';
    });
  }
};

window.CoffeeAuth = CoffeeAuth;

// ==========================================================================
// CoffeeShop API Client - Frontend JavaScript
// Communicates with the Express TypeScript backend
// ==========================================================================

const CoffeeAPI = {
  BASE_URL: '',  // Same origin

  // ── Token Management ──────────────────────────────────────────────────
  getToken() {
    return localStorage.getItem('cs_token');
  },
  setToken(token) {
    localStorage.setItem('cs_token', token);
  },
  clearToken() {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
  },
  getUser() {
    const raw = localStorage.getItem('cs_user');
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  setUser(user) {
    localStorage.setItem('cs_user', JSON.stringify(user));
  },
  isLoggedIn() {
    return !!this.getToken();
  },

  // ── HTTP Helpers ───────────────────────────────────────────────────────
  async request(method, path, body, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }
    try {
      const res = await fetch(`${this.BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      return { ok: false, status: 0, data: { success: false, message: 'Lỗi kết nối mạng.' } };
    }
  },

  get(path, auth = false) { return this.request('GET', path, undefined, auth); },
  post(path, body, auth = false) { return this.request('POST', path, body, auth); },
  put(path, body, auth = false) { return this.request('PUT', path, body, auth); },

  // ── Auth ───────────────────────────────────────────────────────────────
  async register(full_name, email, phone, password) {
    const res = await this.post('/api/auth/register', { full_name, email, phone, password });
    if (res.ok) {
      this.setToken(res.data.token);
      this.setUser(res.data.user);
    }
    return res;
  },

  async login(email, password) {
    const res = await this.post('/api/auth/login', { email, password });
    if (res.ok) {
      this.setToken(res.data.token);
      this.setUser(res.data.user);
    }
    return res;
  },

  logout() {
    this.clearToken();
  },

  async getProfile() {
    return this.get('/api/auth/me', true);
  },

  async updateProfile(full_name, phone) {
    return this.put('/api/auth/profile', { full_name, phone }, true);
  },

  async changePassword(current_password, new_password) {
    return this.put('/api/auth/change-password', { current_password, new_password }, true);
  },

  // ── Orders ─────────────────────────────────────────────────────────────
  async placeOrder(orderData) {
    // Try with auth if logged in; fallback to guest order
    return this.post('/api/orders', orderData, this.isLoggedIn());
  },

  async getMyOrders() {
    return this.get('/api/orders', true);
  },

  async getOrder(id) {
    return this.get(`/api/orders/${id}`, true);
  },

  async trackOrder(orderId, phone) {
    return this.get(`/api/orders/track?order_id=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`);
  },

  // ── Feedbacks ──────────────────────────────────────────────────────────
  async submitFeedback(data) {
    return this.post('/api/feedbacks', data, this.isLoggedIn());
  }
};

window.CoffeeAPI = CoffeeAPI;

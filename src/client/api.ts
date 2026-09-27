// ==========================================================================
// CoffeeShop API Client
// Handles all communication with the backend REST API
// ==========================================================================

const CoffeeAPI = {
  BASE_URL: '',  // Same origin - served by Express

  // ── Token Management ──────────────────────────────────────────────────
  getToken() {
    return localStorage.getItem('cs_token');
  },

  setToken(token: string) {
    localStorage.setItem('cs_token', token);
  },

  clearToken() {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
  },

  getUser() {
    const raw = localStorage.getItem('cs_user');
    return raw ? JSON.parse(raw) : null;
  },

  setUser(user: any) {
    localStorage.setItem('cs_user', JSON.stringify(user));
  },

  isLoggedIn(): boolean {
    return !!this.getToken();
  },

  // ── HTTP Helpers ───────────────────────────────────────────────────────
  async request(method: string, path: string, body?: any, auth = false): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (auth && this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    const res = await fetch(`${this.BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  },

  get: (path: string, auth = false) => CoffeeAPI.request('GET', path, undefined, auth),
  post: (path: string, body: any, auth = false) => CoffeeAPI.request('POST', path, body, auth),
  put: (path: string, body: any, auth = false) => CoffeeAPI.request('PUT', path, body, auth),

  // ── Auth ───────────────────────────────────────────────────────────────
  async register(full_name: string, email: string, phone: string, password: string) {
    const res = await this.post('/api/auth/register', { full_name, email, phone, password });
    if (res.ok) {
      this.setToken(res.data.token);
      this.setUser(res.data.user);
    }
    return res;
  },

  async login(email: string, password: string) {
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

  async updateProfile(full_name: string, phone: string) {
    return this.put('/api/auth/profile', { full_name, phone }, true);
  },

  async changePassword(current_password: string, new_password: string) {
    return this.put('/api/auth/change-password', { current_password, new_password }, true);
  },

  // ── Orders ─────────────────────────────────────────────────────────────
  async placeOrder(orderData: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address?: string;
    note?: string;
    items: Array<{
      product_id: number;
      product_name: string;
      product_image: string;
      quantity: number;
      unit_price: number;
    }>;
  }) {
    return this.post('/api/orders', orderData, true);
  },

  async getMyOrders() {
    return this.get('/api/orders', true);
  },

  async getOrder(id: number) {
    return this.get(`/api/orders/${id}`, true);
  },

  // ── Feedbacks ──────────────────────────────────────────────────────────
  async submitFeedback(data: {
    name: string;
    email: string;
    phone?: string;
    topic?: string;
    rating: number;
    message: string;
  }) {
    // Include auth token if user is logged in (optional)
    return this.post('/api/feedbacks', data, this.isLoggedIn());
  }
};

// Make available globally
declare global {
  interface Window {
    CoffeeAPI: typeof CoffeeAPI;
  }
}
if (typeof window !== 'undefined') {
  window.CoffeeAPI = CoffeeAPI;
}
export default CoffeeAPI;

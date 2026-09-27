import { Router, Request, Response } from 'express';
import getDb from '../database';
import { requireAuth, optionalAuth } from '../auth';

const router = Router();

// ─── POST /api/orders ─────────────────────────────────────────────────────
// Place a new order (authenticated or guest)
router.post('/', optionalAuth, (req: Request, res: Response) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    delivery_address,
    note,
    items  // [{ product_id, product_name, product_image, quantity, unit_price }]
  } = req.body;

  // Validation
  if (!customer_name || !customer_email || !customer_phone) {
    res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin khách hàng.' });
    return;
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, message: 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.' });
    return;
  }

  // Calculate total
  const totalAmount = items.reduce((sum: number, item: any) => {
    return sum + (item.unit_price * item.quantity);
  }, 0);

  const db = getDb();

  // Get user_id from JWT if available, or match existing registered user by email
  const jwtUser = (req as any).user;
  let userId = jwtUser ? jwtUser.id : null;

  if (!userId && customer_email) {
    const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(customer_email.trim()) as any;
    if (existingUser) {
      userId = existingUser.id;
    }
  }

  // Insert order
  const orderResult = db.prepare(`
    INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, delivery_address, note, total_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, customer_name, customer_email, customer_phone, delivery_address || null, note || null, totalAmount);

  const orderId = orderResult.lastInsertRowid as number;

  // Insert order items
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, subtotal)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((orderItems: any[]) => {
    for (const item of orderItems) {
      insertItem.run(
        orderId,
        item.product_id,
        item.product_name,
        item.product_image || null,
        item.quantity,
        item.unit_price,
        item.unit_price * item.quantity
      );
    }
  });

  insertMany(items);

  // Fetch created order with items
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

  res.status(201).json({
    success: true,
    message: `Đặt hàng thành công! Mã đơn hàng #${orderId}. Đơn hàng đã được lưu trữ vào hệ thống.`,
    order: { ...order as any, items: orderItems }
  });
});

// ─── GET /api/orders/track ────────────────────────────────────────────────
// Public order tracking by order_id and phone
router.get('/track', (req: Request, res: Response) => {
  const { order_id, phone } = req.query;
  if (!order_id || !phone) {
    res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã đơn hàng và số điện thoại đặt hàng.' });
    return;
  }

  const db = getDb();
  const cleanPhone = String(phone).replace(/\s+/g, '');
  const order = db.prepare(`
    SELECT * FROM orders 
    WHERE id = ? AND REPLACE(customer_phone, ' ', '') = ?
  `).get(order_id, cleanPhone) as any;

  if (!order) {
    res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng với thông tin đã cung cấp.' });
    return;
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ success: true, order: { ...order, items } });
});

// ─── GET /api/orders ──────────────────────────────────────────────────────
// Get orders for authenticated user
router.get('/', requireAuth, (req: Request, res: Response) => {
  const jwtUser = (req as any).user;
  const db = getDb();

  let orders: any[];
  if (jwtUser.role === 'admin') {
    // Admin: get all orders
    orders = db.prepare(`
      SELECT o.*, u.full_name as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `).all() as any[];
  } else {
    // Customer: get own orders by user_id OR matching customer_email
    orders = db.prepare(`
      SELECT * FROM orders 
      WHERE user_id = ? OR LOWER(customer_email) = LOWER(?) 
      ORDER BY created_at DESC
    `).all(jwtUser.id, jwtUser.email) as any[];
  }

  // Attach items to each order
  const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  const enriched = orders.map(order => ({
    ...order,
    items: getItems.all(order.id)
  }));

  res.json({ success: true, orders: enriched });
});

// ─── GET /api/orders/:id ──────────────────────────────────────────────────
// Get a specific order
router.get('/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const jwtUser = (req as any).user;
  const db = getDb();

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!order) {
    res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    return;
  }

  // Only admin or owner (by user_id or email) can view
  const isOwner = order.user_id === jwtUser.id || 
                  (order.customer_email && order.customer_email.toLowerCase() === jwtUser.email.toLowerCase());
  if (jwtUser.role !== 'admin' && !isOwner) {
    res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn hàng này.' });
    return;
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
  res.json({ success: true, order: { ...order, items } });
});

// ─── PUT /api/orders/:id/status ───────────────────────────────────────────
// Admin: update order status
router.put('/:id/status', requireAuth, (req: Request, res: Response) => {
  const jwtUser = (req as any).user;
  if (jwtUser.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Chỉ admin mới có thể cập nhật trạng thái đơn hàng.' });
    return;
  }

  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ success: false, message: `Trạng thái không hợp lệ. Chọn một trong: ${validStatuses.join(', ')}` });
    return;
  }

  const db = getDb();
  const result = db.prepare(
    "UPDATE orders SET status = ?, updated_at = datetime('now', 'localtime') WHERE id = ?"
  ).run(status, id);

  if (result.changes === 0) {
    res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    return;
  }

  res.json({ success: true, message: `Cập nhật trạng thái đơn hàng #${id} thành "${status}" thành công.` });
});

export default router;

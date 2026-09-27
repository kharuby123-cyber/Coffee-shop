import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import getDb from '../database';
import { generateToken, requireAuth } from '../auth';

const router = Router();

// ─── POST /api/auth/register ───────────────────────────────────────────────
router.post('/register', (req: Request, res: Response) => {
  const { full_name, email, phone, password } = req.body;

  if (!full_name || !email || !password) {
    res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: 'Địa chỉ email không hợp lệ.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ success: false, message: 'Mật khẩu cần ít nhất 6 ký tự.' });
    return;
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ success: false, message: 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.' });
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)'
  ).run(full_name, email, phone || null, hashedPassword);

  const userId = result.lastInsertRowid as number;
  const token = generateToken({ id: userId, email, role: 'customer' });

  res.status(201).json({
    success: true,
    message: `Chào mừng ${full_name} đến với CoffeeShop! Tài khoản đã được tạo thành công.`,
    token,
    user: { id: userId, full_name, email, phone: phone || null, role: 'customer' }
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

  if (!user) {
    res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    return;
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    return;
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  res.json({
    success: true,
    message: `Chào mừng trở lại, ${user.full_name}!`,
    token,
    user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, role: user.role }
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const jwtUser = (req as any).user;
  const db = getDb();
  const user = db.prepare('SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?').get(jwtUser.id) as any;

  if (!user) {
    res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    return;
  }

  res.json({ success: true, user });
});

// ─── PUT /api/auth/profile ────────────────────────────────────────────────
router.put('/profile', requireAuth, (req: Request, res: Response) => {
  const jwtUser = (req as any).user;
  const { full_name, phone } = req.body;

  if (!full_name) {
    res.status(400).json({ success: false, message: 'Họ tên không được để trống.' });
    return;
  }

  const db = getDb();
  db.prepare(
    "UPDATE users SET full_name = ?, phone = ?, updated_at = datetime('now', 'localtime') WHERE id = ?"
  ).run(full_name, phone || null, jwtUser.id);

  const updatedUser = db.prepare('SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?').get(jwtUser.id);
  res.json({ success: true, message: 'Cập nhật thông tin thành công.', user: updatedUser });
});

// ─── PUT /api/auth/change-password ───────────────────────────────────────
router.put('/change-password', requireAuth, (req: Request, res: Response) => {
  const jwtUser = (req as any).user;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.' });
    return;
  }

  if (new_password.length < 6) {
    res.status(400).json({ success: false, message: 'Mật khẩu mới cần ít nhất 6 ký tự.' });
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT password FROM users WHERE id = ?').get(jwtUser.id) as any;

  if (!user || !bcrypt.compareSync(current_password, user.password)) {
    res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    return;
  }

  const newHash = bcrypt.hashSync(new_password, 10);
  db.prepare(
    "UPDATE users SET password = ?, updated_at = datetime('now', 'localtime') WHERE id = ?"
  ).run(newHash, jwtUser.id);

  res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
});

export default router;

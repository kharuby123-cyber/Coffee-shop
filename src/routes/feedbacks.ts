import { Router, Request, Response } from 'express';
import getDb from '../database';
import { requireAuth, requireAdmin, optionalAuth } from '../auth';

const router = Router();

// ─── POST /api/feedbacks ──────────────────────────────────────────────────
// Submit feedback (public or authenticated)
router.post('/', optionalAuth, (req: Request, res: Response) => {
  const { name, email, phone, topic, rating, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ họ tên, email và nội dung phản hồi.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: 'Địa chỉ email không hợp lệ.' });
    return;
  }

  if (message.trim().length < 10) {
    res.status(400).json({ success: false, message: 'Nội dung phản hồi cần ít nhất 10 ký tự.' });
    return;
  }

  const ratingValue = Math.max(1, Math.min(5, parseInt(rating) || 5));
  const jwtUser = (req as any).user;

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO feedbacks (user_id, name, email, phone, topic, rating, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    jwtUser ? jwtUser.id : null,
    name.trim(),
    email.trim(),
    phone ? phone.trim() : null,
    topic || 'Góp ý chung',
    ratingValue,
    message.trim()
  );

  res.status(201).json({
    success: true,
    message: `Cảm ơn ${name}! Phản hồi của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ sớm nhất.`,
    feedback_id: result.lastInsertRowid
  });
});

// ─── GET /api/feedbacks ───────────────────────────────────────────────────
// Admin: get all feedbacks
router.get('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const feedbacks = db.prepare(`
    SELECT f.*, u.full_name as user_name
    FROM feedbacks f
    LEFT JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `).all();

  res.json({ success: true, feedbacks });
});

export default router;

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'coffeeshop_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// Middleware: require authenticated user
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để thực hiện thao tác này.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' });
  }
}

// Middleware: optional auth - populates req.user if Bearer token is provided
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      (req as any).user = decoded;
    } catch {
      // Ignore invalid or expired token for optional routes
    }
  }
  next();
}

// Middleware: require admin role
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user as JwtPayload | undefined;
  if (!user || user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập trang này.' });
    return;
  }
  next();
}

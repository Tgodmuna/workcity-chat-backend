import type { UserRole } from '../interfaces/IUser';
import { Request, Response, NextFunction } from 'express';

export const allowRoles =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ message: 'only admins are allowed' });

    next();
  };

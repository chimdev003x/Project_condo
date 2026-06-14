import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  alert('กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้');
  return router.parseUrl('/login');
};

export const packageGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasActivePackage()) {
    return true;
  }

  alert('กรุณาเลือกแพ็กเกจก่อนลงประกาศ');
  return router.parseUrl('/packages');
};

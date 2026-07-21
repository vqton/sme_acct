# Auth System

## Overview
JWT-based auth with refresh token rotation.

## Features
- [x] Login/logout
- [x] JWT (15min) + refresh token rotation
- [x] Account lockout (5 fails → 30min)
- [x] Password history (last 5)
- [x] Rate limiting (5/min per IP)
- [x] Forgot/reset password
- [x] Company switching at login
- [x] Session management dashboard
- [x] 2FA / TOTP
- [x] Multi-language (VI/EN)

## Key Files
- `server/src/application/AuthService.ts`
- `server/src/infrastructure/auth/jwt.ts`
- `server/src/presentation/controllers/authController.ts`

import {
  Controller, Post, Get, Delete, Body, Param, Req, Ip, Headers,
  UseGuards, HttpCode, HttpStatus, Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../application/AuthService.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { ThrottleGuard } from '../common/guards/throttle.guard.js';
import { Throttle } from '../common/guards/throttle.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  private context(ip: string, headers: Record<string, string | string[] | undefined>) {
    return { ipAddress: ip, userAgent: (headers['user-agent'] as string) ?? null };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(
    @Body() body: { username: string; email: string; password: string; fullName: string },
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    return this.authService.register(body, this.context(ip, req.headers));
  }

  @Post('login')
  @UseGuards(ThrottleGuard)
  @Throttle({ windowMs: 15 * 60 * 1000, maxAttempts: 5 })
  @HttpCode(HttpStatus.OK)
  login(
    @Body() body: { username: string; password: string },
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    return this.authService.login(body, this.context(ip, req.headers));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() body: { refreshToken: string }, @Ip() ip: string, @Req() req: Request) {
    return this.authService.refreshToken(body.refreshToken, this.context(ip, req.headers));
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  changePassword(
    @Req() req: Request,
    @Body() body: { oldPassword: string; newPassword: string },
    @Ip() ip: string,
  ) {
    const userId = (req as any).user.userId;
    this.authService.changePassword(userId, body.oldPassword, body.newPassword, this.context(ip, req.headers));
    return { ok: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  logout(@Req() req: Request, @Ip() ip: string) {
    const userId = (req as any).user.userId;
    this.authService.logout(userId, this.context(ip, req.headers));
    return { ok: true };
  }

  @Get('sessions')
  @UseGuards(AuthGuard)
  listSessions(@Req() req: Request) {
    const userId = (req as any).user.userId;
    const sessions = this.authService.listActiveSessions(userId);
    return { sessions };
  }

  @Delete('sessions/:id')
  @UseGuards(AuthGuard)
  revokeSession(@Req() req: Request, @Param('id') sessionId: string, @Ip() ip: string) {
    const userId = (req as any).user.userId;
    this.authService.revokeSession(userId, sessionId, this.context(ip, req.headers));
    return { ok: true };
  }

  @Delete('sessions')
  @UseGuards(AuthGuard)
  revokeAllSessions(@Req() req: Request, @Ip() ip: string) {
    const userId = (req as any).user.userId;
    this.authService.revokeAllSessions(userId, this.context(ip, req.headers));
    return { ok: true };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.CREATED)
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.CREATED)
  resetPassword(
    @Body() body: { token: string; newPassword: string },
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    this.authService.resetPassword(body.token, body.newPassword, this.context(ip, req.headers));
    return { ok: true };
  }

  @Post('select-company')
  selectCompany(@Body() body: { refreshToken: string; companyId: string }) {
    return this.authService.selectCompany(body.refreshToken, body.companyId);
  }

  @Post('2fa/setup')
  @UseGuards(AuthGuard)
  setupTwoFactor(@Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.authService.setupTwoFactor(userId);
  }

  @Post('2fa/verify')
  @UseGuards(AuthGuard)
  verifyTwoFactor(@Req() req: Request, @Body() body: { code: string }) {
    const userId = (req as any).user.userId;
    this.authService.verifyAndEnableTwoFactor(userId, body.code);
    return { ok: true };
  }

  @Post('2fa/verify-login')
  verifyTwoFactorLogin(@Body() body: { tempToken: string; code: string }) {
    return this.authService.verifyTwoFactorLogin(body.tempToken, body.code);
  }

  @Post('2fa/disable')
  @UseGuards(AuthGuard)
  disableTwoFactor(@Req() req: Request, @Body() body: { code: string }) {
    const userId = (req as any).user.userId;
    this.authService.disableTwoFactor(userId, body.code);
    return { ok: true };
  }
}

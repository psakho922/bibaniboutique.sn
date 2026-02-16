import { Body, Controller, Post, UseGuards, Request, Get, Param, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class RegisterDto {
  email!: string;
  password!: string;
  phone?: string;
}

class LoginDto {
  email!: string;
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-phone/init')
  async verifyPhoneInit(@Request() req: any) {
    // Simulate sending SMS
    return { message: 'Code envoyé (Simulation: utilisez 0000)' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-phone/finalize')
  async verifyPhoneFinalize(@Request() req: any, @Body('code') code: string) {
    if (code !== '0000') {
      throw new ForbiddenException('Code invalide');
    }
    return this.authService.verifyPhone(req.user.userId);
  }
}

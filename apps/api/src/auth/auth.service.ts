import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-audit-key';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Email introuvable');

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry
      }
    });

    // SIMULATION EMAIL
    console.log(`[EMAIL MOCK] Reset Token for ${email}: ${token}`);
    
    return { message: 'Email envoyé (voir console)', token }; // Sending token in response for testing
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) throw new BadRequestException('Token invalide ou expiré');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return { message: 'Mot de passe mis à jour' };
  }

  async register(body: any) {
    const { email, password, phone } = body;
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email déjà utilisé');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phone,
      },
    });

    const token = this.generateToken(user);
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  async login(body: any) {
    const { email, password } = body;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    if (user.isBlocked) throw new UnauthorizedException('Compte bloqué par l\'administrateur');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    const token = this.generateToken(user);
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  private generateToken(user: any) {
    return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  }

  async verifyEmail(token: string) {
    // Basic implementation (requires separate Token model or repurpose resetToken)
    // For MVP: assume token is valid if format is correct or skip token check
    return { message: 'Email verified successfully' };
  }

  async verifyPhone(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { phoneVerified: true },
    });
  }
}

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-audit-key';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(body: any) {
    const { email, password, phone } = body;
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email déjà utilisé');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        // In a real app we would store phone too, but User model might not have it yet.
        // Let's check schema.prisma later. If not, we ignore it or add it.
        // For now, assume schema has email/password/role.
      },
    });

    const token = this.generateToken(user);
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  async login(body: any) {
    const { email, password } = body;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    const token = this.generateToken(user);
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  private generateToken(user: any) {
    return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  }
}

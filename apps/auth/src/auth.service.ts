import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepo.create({ ...data, password: hashedPassword });
    await this.userRepo.save(user);
    return { message: 'User created successfully' };
  }

  async login(data: any) {
    const user = await this.userRepo.findOne({ where: { email: data.email } });

    if (!user) {
      return { error: 'User not found', status: 404 };
    }

    const isPasswordMatching = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!isPasswordMatching) {
      return { error: 'Wrong credentials', status: 401 };
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return !!payload;
    } catch (e) {
      return false;
    }
  }
}

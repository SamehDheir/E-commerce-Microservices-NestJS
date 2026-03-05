import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    try {
      const existingUser = await this.userRepo.findOne({
        where: { email: data.email },
      });
      if (existingUser) {
        return { error: 'Email already registered', status: 409 };
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = this.userRepo.create({
        email: data.email,
        password: hashedPassword,
      });

      await this.userRepo.save(user);

      return {
        message: 'User created successfully',
        userId: user.id,
      };
    } catch (error) {
      return {
        error: 'Registration failed, please try again later',
        status: 500,
      };
    }
  }

  async login(data: any) {
    try {
      const user = await this.userRepo.findOne({
        where: { email: data.email },
      });

      // 1. Verify user existence
      if (!user) {
        return { error: 'Invalid email or password', status: 401 };
      }

      // 2. Compare incoming password with hashed password in DB
      const isPasswordMatching = await bcrypt.compare(
        data.password,
        user.password,
      );
      if (!isPasswordMatching) {
        return { error: 'Invalid email or password', status: 401 };
      }

      // 3. Generate JWT payload
      const payload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
        user: { id: user.id, email: user.email },
      };
    } catch (error) {
      return { error: 'Internal server error during login', status: 500 };
    }
  }

  async validateToken(token: string) {
    try {
      // 1. Verify token signature and expiration
      const payload = this.jwtService.verify(token);

      // 2. Double check if the user still exists in the database
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) return false;

      return true;
    } catch (e) {
      // 3. Token is expired, malformed, or signature is invalid
      return false;
    }
  }
}

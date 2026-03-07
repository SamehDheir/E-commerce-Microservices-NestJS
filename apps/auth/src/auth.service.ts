import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailService } from './mail/mail.service';
import { MoreThan } from 'typeorm';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
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
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
      };
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        console.warn('Token expired at:', e.expiredAt);
      }
      // 3. Token is expired, malformed, or signature is invalid
      return null;
    }
  }

  async forgotPassword(data: ForgotPasswordDto) {
    try {
      const user = await this.userRepo.findOne({
        where: { email: data.email },
      });

      if (!user) {
        return {
          message: 'If this email exists, a reset link has been sent',
          status: 200,
        };
      }

      // 1. Generate token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // 2. Set expiration
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 15);

      // 3. Save to database
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = expires;
      await this.userRepo.save(user);

      // 4. Send Email - Wrap this specifically to catch SMTP errors
      const resetUrl = `http://localhost:3000/auth/reset-password?token=${resetToken}`;

      try {
        await this.mailService.sendPasswordResetEmail(user.email, resetUrl);
      } catch (mailError) {
        console.error('SMTP/MAIL ERROR:', mailError);
        return {
          error: 'Failed to send email, please contact support',
          status: 500,
        };
      }

      return { message: 'Reset link sent successfully', status: 200 };
    } catch (globalError) {
      console.error('FORGOT PASSWORD GLOBAL ERROR:', globalError);
      return { error: 'An unexpected error occurred', status: 500 };
    }
  }

  async resetPassword(data: ResetPasswordDto) {
    try {
      // 1. Find user with valid token AND not expired
      const user = await this.userRepo.findOne({
        where: {
          resetPasswordToken: data.token,
          resetPasswordExpires: MoreThan(new Date()), // Check if current time < expiry time
        },
      });

      // 2. If no user found, token is either wrong or expired
      if (!user) {
        return {
          error: 'The reset link is invalid or has expired',
          status: 400,
        };
      }

      // 3. Hash the new password
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);

      // 4. Update user and CLEAR reset fields (Security Best Practice)
      user.password = hashedPassword;
      user.resetPasswordToken = null; // Clear so it can't be used again
      user.resetPasswordExpires = null;

      await this.userRepo.save(user);

      return {
        message: 'Password updated successfully! You can now login',
        status: 200,
      };
    } catch (error) {
      console.error('RESET PASSWORD ERROR:', error);
      return { error: 'Internal server error', status: 500 };
    }
  }
}

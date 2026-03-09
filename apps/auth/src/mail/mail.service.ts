// apps/auth-service/src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetUrl: string) {
    const mailOptions = {
      from: `"E-commerce Support" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="direction: ltr; font-family: sans-serif;">
          <h2>Password Reset</h2>
          <p>You requested to reset your password. Click the link below:</p>
          <a href="${resetUrl}" style="display:inline-block; background:#4285f4; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
            Reset Password
          </a>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', email);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
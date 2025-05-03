import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Yandex',
      auth: {
        user: 'artyomkosyrev@yandex.ru',
        pass: 'hzciooficpuaxbbt',
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `http://localhost:3000/api/authentication/reset-password?token=${token}`;
    const mailOptions = {
      from: 'artyomkosyrev@yandex.ru',
      to,
      subject: 'Reset Password',
      html: `<p>You requested a password reset. Click the link below to reset password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
    };

    await this.transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return console.log('mail error: ' + error);
      }
      console.log('Message sent ' + info.response);
    });
  }
}

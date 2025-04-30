import User from '#models/user';
import { loginValidator, registerValidator, resetPasswordValidator, sendResetPasswordValidator, verifyEmailValidator } from '#validators/auth';
import type { HttpContext } from '@adonisjs/core/http';
import { randomUUID } from 'crypto';
import { TokenType } from '../contracts/token.js';
import Token from '#models/token';
import mail from '@adonisjs/mail/services/main';
import env from '#start/env';
import { DateTime } from 'luxon';

export default class AuthController {
  /**
   * Perform login request to authenticate an user
   * @param HttpContext
   * @returns {Promise<void>}
   * @throws {Error} If credentials are invalid
   */
  async login({ request, response, auth }: HttpContext): Promise<void> {
    const { email, password } = await request.validateUsing(loginValidator);

    const user = await User.verifyCredentials(email, password);

    // Check if the user's email is verified
    if(user.isEmailVerified === false) {
      response.badRequest({ message: 'Email not verified' });
    } else {
      await auth.use('web').login(user);
  
      response.ok({ message: 'User connected successfully', user });
    }

  }

  /**
   * Perform logout request to disconnect an user
   * @param HttpContext
   * @returns {Promise<void>}
   */
  async logout({ response, auth }: HttpContext): Promise<void> {
    auth.use('web').logout();

    response.ok({ message: 'User logout successfully' });
  }

  /**
   * Perform register request to create an user
   * @param HttpContext
   * @returns {Promise<void>}
   * @throws {Error} If user already exists
   * @throws {Error} If user creation fails because of invalid data
   */
  async register({ request, response }: HttpContext): Promise<void> {
    const { username, email, password } = await request.validateUsing(registerValidator);

    let user = await User.create({
      email,
      password,
      username,
      id: randomUUID(),
    });

    // Create a token for the user to validate the email
    const token = await Token.create({
      user_id: user.id,
      type: TokenType.EMAIL_VERIFICATION,
    });

    // Send the email to the user
    mail.send((message) => {
      message.to(user.email)
        .text(`${env.get("FRONTEND_URL")}/auth/verify-email/${token.token}`)
        .subject('Email verification');
    });

    response.ok({ message: 'User created successfully', user });
  }

  /**
   * Send a reset password email to the user and create a reset password token
   * @param HttpContext
   * @returns Promise<void>
   */
  async sendResetPassword({ request, response }: HttpContext): Promise<void> {
    const { email } = await request.validateUsing(sendResetPasswordValidator);

    const user = await User.findBy('email', email);

    if (!user) {
      response.badRequest({ message: 'User not found' });
      return;
    } else {
      const token = await Token.create({
        user_id: user.id,
        type: TokenType.RESET_PASSWORD
      });

      await mail.send((message) => {
        message
          .to(user.email)
          .text(`${env.get("FRONTEND_URL")}/auth/reset-password/${token.token}`)
          .subject('Reset password');
      });

      response.ok({ message: 'Reset password email sent successfully' });
    }
  }

  /**
   * Check if the token is valid and reset the password
   * @param HttpContext
   * @returns Promise<void>
   */
  async resetPassord({ request, response }: HttpContext): Promise<void> {
    const { token, password } = await request.validateUsing(resetPasswordValidator);

    const token_db = await Token.findBy('token', token);

    if (!token_db || token_db.type !== TokenType.RESET_PASSWORD || token_db.expiresAt < DateTime.now()) {
      response.badRequest({ message: 'Password reset request not found' });
      return;
    }

    const user = await User.findBy('id', token_db.user_id);

    user!.password = password;

    await user!.save();
    await token_db.delete();

    response.ok({ message: 'Password updated successfully' });
  }

  /**
   * Perform an email verification request
   * @param HttpContext
   * @returns Promise<void>
   */
  async verifyEmail({ request, response }: HttpContext): Promise<void> {
    const { token } = await request.validateUsing(verifyEmailValidator);

    const tokenDb = await Token.findBy('token', token);

    // We don't need to check if the token is expired, because the user will be blocked if the token is expired
    if (!tokenDb || tokenDb.type !== TokenType.EMAIL_VERIFICATION) {
      response.badRequest({ message: 'Email verification request not found' });
    } else {
      const user = await User.findBy('id', tokenDb.user_id);

      user!.isEmailVerified = true;
      await user?.save();

      await tokenDb.delete();

      response.ok({ message: 'Email verified successfully' });
    }
  }
}

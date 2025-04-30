import Token from '#models/token';
import User from '#models/user';
import env from '#start/env';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { TokenType } from '../../../app/contracts/token.js';

test.group('Auth reset password', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction());

  /**
   * Test the reset password endpoint with a bad token
   */
  test('should throw an error', async ({ client }) => {
    const response = await client.post(`${env.get("API_PREFIX")}/auth/reset-password`).json({
      password: 'newpassword',
      token: '5d4f5e28fc4dce5acf0b4af41b5862db62232c09c2a3aa6480e2e3fcda4404ed69c3d34a81336adfb823711d5f821257'
    });

    response.assertStatus(400);
    response.assertBodyContains({
      message: 'Password reset request not found'
    });
  });

  /**
   * Test the reset password endpoint with a valid token
   */
  test('should reset the password', async ({ client }) => {
    const user = await User.create({
      email: "test@gmail.com",
      password: "password",
      username: "testuser"
    });

    const token = await Token.create({
      user_id: user.id,
      type: TokenType.RESET_PASSWORD,
    });

    const response = await client.post(`${env.get("API_PREFIX")}/auth/reset-password`).json({
      password: 'newpassword',
      token: token.token
    });

    response.assertStatus(200);
    response.assertBodyContains({
      message: 'Password updated successfully'
    });
  });
});
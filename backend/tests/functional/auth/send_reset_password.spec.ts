import Token from '#models/token';
import User from '#models/user';
import env from '#start/env';
import testUtils from '@adonisjs/core/services/test_utils';
import mail from '@adonisjs/mail/services/main';
import { test } from '@japa/runner'

test.group('Auth send reset password', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction());

  /**
   * Test the send reset password endpoint with a bad email
   */
  test('should not found the user', async ({ client }) => {
    const response = await client.post(`${env.get("API_PREFIX")}/auth/send-reset-password`).json({
      email: 'unexisting@mail.com'
    });

    response.assertStatus(400);
    response.assertBodyContains({
      message: 'User not found'
    });
  })

  /**
   * Test the send reset password endpoint with a valid email
   */
  test('should send the reset password email', async ({ client, assert }) => {
    const user = await User.create({
      email: 'newuser@mail.com',
      password: 'password',
      username: 'newuser',
    })

    const { mails } = mail.fake();

    const response = await client.post(`${env.get("API_PREFIX")}/auth/send-reset-password`).json({
      email: user.email
    });

    response.assertStatus(200);
    response.assertBodyContains({
      message: 'Reset password email sent successfully'
    })

    const token = await Token.findBy('user_id', user.id);
    
    assert.isNotNull(token);
    assert.equal(token!.type, 'reset_password');

    mails.assertSentCount(1);

    mail.restore();
  })
})
import Token from '#models/token';
import User from '#models/user';
import env from '#start/env';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner'
import { TokenType } from '../../../app/contracts/token.js';

test.group('Auth verify email', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  
  /**
   * Perform an email verification request without a token
   */
  test('Should fail beacause there is no token in DB', async ({ client }) => {
    const response = await client.post(`${env.get('API_PREFIX')}/auth/verify-email`).json({
      token: "956730503a04f9551698d547cdad34b5ff1de664c6ca10d2f42b0aa16df7d4dc564128874a564292cb9899c670a8828h"
    })

    response.assertStatus(400)
    response.assertBodyContains({ message: 'Email verification request not found' })
  })

  /**
   * Perform an email verification request with a token
   */
  test('Should verify email', async ({ client, assert }) => {
    const user = await User.create({
      email: "test@mail.com",
      password: "password",
      username: "test",
    })

    const token = await Token.create({
      user_id: user.id,
      type: TokenType.EMAIL_VERIFICATION
    })

    const response = await client.post(`${env.get('API_PREFIX')}/auth/verify-email`).json({
      token: token.token
    })

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Email verified successfully' })

    console.log(user)
    assert.equal(user.isEmailVerified, true)
  })
})
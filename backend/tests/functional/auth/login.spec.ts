import User from '#models/user';
import env from '#start/env';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner'

test.group('Auth login', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction());

  /**
   * Test the login functionality with valid credentials
   */
  test('login a user with valid credentials', async ({ client }) => {
    const user = await User.create({
      email: "test@gmail.com",
      password: "password",
      username: "test",
      isEmailVerified: true,
    })

    const response = await client.post(`${env.get("API_PREFIX")}/auth/login`).json({
      email: user.email,
      password: "password"
    })

    response.assertStatus(200)

    // Check if the response contains the user object by checking the email
    response.assertBodyContains({ user: { email: user.email } })
  })

  /**
   * Test the login functionality with invalid credentials
   */
  test('login a user with wrong credentials', async ({ client }) => {
    const response = await client.post(`${env.get("API_PREFIX")}/auth/login`).json({
      email: "test@gmail.com",
      password: "password"
    });

    response.assertStatus(400);
  });
})
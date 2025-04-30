import Token from '#models/token';
import User from '#models/user';
import env from '#start/env';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { randomUUID } from 'crypto';

test.group('Auth register', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction());

  /**
   * Test to register a new user
   */
  test('should register the user', async ({ assert, client }) => {
    const user = {
      email: "test@gmail.com",
      password: "password",
      username: "testUser"
    };

    const response = await client.post(`${env.get("API_PREFIX")}/auth/register`).json(user);

    response.assertStatus(200);
    response.assertBodyContains({
      user: {
        email: user.email,
        username: user.username
      }
    })

    const userDB = await User.findBy('email', user.email);
    
    // Check if the user is created in the database
    assert.isDefined(userDB);

    // Check if a token is created for the user to validate the email
    const token = await Token.findBy('user_id', userDB?.id);

    assert.isDefined(token);
    assert.equal(token?.type, "email_verification");
  });

  /**
   * Test to register a new user but with an existing email
   */
  test('should not register the user', async ({ assert, client }) => {
    const user = await User.create({
      email: "test@gmail.com",
      password: "password",
      username: "testUser",
      id: randomUUID()
    });

    const response = await client.post(`${env.get("API_PREFIX")}/auth/register`).json({
      email: user.email,
      password: "password",
      username: "testUser2"
    });

    response.assertStatus(422);

    // Check if the user is created in the database
    assert.isNull(await User.findBy('username', "testUser2"));
  });
});
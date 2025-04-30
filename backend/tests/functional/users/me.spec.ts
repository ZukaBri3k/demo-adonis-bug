import User from '#models/user';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner'
import { randomUUID } from 'crypto';

test.group('Users me', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction());

  /**
   * Test retreive the current connected user
   */
  test('should return the current connected user', async ({ client }) => {
    const user = await User.create({
      id: randomUUID(),
      email: "test@mail.com",
      password: "password",
      username: "test",
    })

    const response = await client.get('/api/v0/user/me').loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      }
    })
  })

  /**
   * Test retreive the current guest user
   */
  test('should return null', async ({ client }) => {
    const response = await client.get('/api/v0/user/me');
    response.assertStatus(200);
    response.assertBodyContains({
      user: null
    });
  });
})
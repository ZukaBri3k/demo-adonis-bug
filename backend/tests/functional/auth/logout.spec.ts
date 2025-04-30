import env from '#start/env';
import { test } from '@japa/runner'

test.group('Auth logout', () => {
  /**
   * Test the logout fonctionality
   */
  test('example test', async ({ client }) => {
    const response = await client.get(`${env.get("API_PREFIX")}/auth/logout`)

    response.assertStatus(200)
  })
})
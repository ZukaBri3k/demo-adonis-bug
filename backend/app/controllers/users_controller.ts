import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  /**
   * Return the current authenticated user
   * @param HttpContext
   * @returns Promise<void>
   */
  async me({response, auth}:HttpContext) {
    const user = auth.user ?? null

    response.ok({message: user ? "User found successfully" : "User not connected", user})
  }
}
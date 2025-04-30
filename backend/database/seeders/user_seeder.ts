import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await UserFactory.createMany(10)
    
    await User.create({
      email: "kyrilldumerchat@gmail.com",
      password: "azerty",
      username: "ZukaBriek",
      isEmailVerified: true
    })
  }
}
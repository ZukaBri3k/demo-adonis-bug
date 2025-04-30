import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table.string('token').unsigned().notNullable()
      table.string('type').unsigned().notNullable()
      table.timestamp('expires_at')

      table.primary(['user_id', 'token'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
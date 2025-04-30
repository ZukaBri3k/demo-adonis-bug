import { DateTime } from 'luxon';
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm';
import { TokenType } from '../contracts/token.js';
import User from './user.js';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import { randomBytes } from 'crypto';

export default class Token extends BaseModel {
  @column({ isPrimary: true })
  declare user_id: string;

  @column()
  declare type: TokenType;

  @column({ isPrimary: true })
  declare token: string;

  @column.dateTime()
  declare expiresAt: DateTime;

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>;

  @beforeCreate()
  public static generateToken(token: Token) {
    token.token = randomBytes(48).toString('hex');
  }

  @beforeCreate()
  public static setExpiration(token: Token) {
    token.expiresAt = DateTime.now().plus({ hours: 3 });
  }
}
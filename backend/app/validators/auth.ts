import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(5).maxLength(40),
  })
)

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().unique({ table: 'users', column: 'email' }),
    password: vine.string().trim().minLength(5).maxLength(40),
		username: vine.string().trim().minLength(3).unique({table: "users", column: "username"})
  })
)

export const sendResetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email()
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    password: vine.string().trim().minLength(5).maxLength(40),
    token: vine.string().trim().maxLength(96).minLength(96),
  })
)

export const verifyEmailValidator = vine.compile(
  vine.object({
    token: vine.string().trim().maxLength(96).minLength(96),
  })
)

/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware'),
  silentAuth: () => import('#middleware/silent_auth_middleware'),
})

const AuthController = () => import("#controllers/auth_controller")
const UsersController = () => import("#controllers/users_controller")

router.group(() => {
  router.get('/', async () => {
    return {
      hello: 'world',
    }
  }).use(middleware.auth())

  router.group(() => {
    router.post('/login', [AuthController, 'login'])
    router.get('/logout', [AuthController, "logout"])
    router.post('/register', [AuthController, "register"])
    router.post('/send-reset-password', [AuthController, "sendResetPassword"])
    router.post('/reset-password', [AuthController, "resetPassord"])
    router.post('/verify-email', [AuthController, "verifyEmail"])

  }).prefix("auth")

  router.group(() => {
    router.get('/me', [UsersController, 'me']).use(middleware.silentAuth())
  }).prefix("user")

}).prefix("/api/v0")

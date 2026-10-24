import app from '@adonisjs/core/services/app'

export const commands = await app.container.make('ace').getCommands()

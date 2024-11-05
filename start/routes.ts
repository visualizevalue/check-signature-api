/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => ({ check: 'signatures', version: 'v1' }))

Route.group(() => {

  Route.group(() => {
    Route.get('/:account',                  'AccountsController.show')
    Route.get('/:account/signatures',       'SignaturesController.forAccount')
  }).prefix('/accounts')

  Route.group(() => {
    Route.post('/',                         'SignaturesController.create')
    Route.get('/',                          'SignaturesController.list')
    Route.get('/:cid',                      'SignaturesController.show')
  }).prefix('/signatures')

  Route.group(() => {
    Route.get('/',                          'HandwrittenMarksController.list')
  }).prefix('/handwritten-marks')

}).prefix('/v1')

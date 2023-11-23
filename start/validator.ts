/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
import { validator } from '@ioc:Adonis/Core/Validator'
import { isAddress } from 'ethers'

validator.rule('address', (value, _, options) => {
  if (typeof value !== 'string') {
    return
  }

  if (!isAddress(value)) {
    options.errorReporter.report(
      options.pointer,
      'address',
      'address validation failed',
      options.arrayExpressionPointer
    )
  }
})

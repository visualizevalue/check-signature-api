import { test } from '@japa/runner'
import proxyAddr from 'proxy-addr'

test('display welcome page', async ({ client }) => {
  const response = await client.get('/')

  response.assertStatus(200)
  response.assertBodyContains({ check: 'signatures', version: 'v1' })
})

test('does not trust unrelated IPv4 addresses through an IPv6 mapped subnet', ({ assert }) => {
  const trust = proxyAddr.compile('::ffff:10.0.0.0/8')
  assert.isFalse(trust('203.0.113.7', 0))
})

test('does not parse unsupported multipart fields', async ({ assert, client }) => {
  const property = 'signatureBodyparserPolluted'

  try {
    const response = await client
      .post('/v1/signatures')
      .header('Accept', 'application/json')
      .field(`user.__proto__.${property}`, 'polluted')
      .field('signer', '0x0000000000000000000000000000000000000001')

    response.assertStatus(422)
    assert.isFalse(Object.prototype.hasOwnProperty.call(Object.prototype, property))
    assert.isTrue(response.body().errors.some((error) => error.field === 'signer'))
  } finally {
    delete Object.prototype[property]
  }
})

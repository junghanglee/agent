import { createHash, randomBytes } from 'node:crypto'

const password = process.argv[2]

if (!password) {
  const generated = randomBytes(18).toString('base64url')
  console.log('Generated password:')
  console.log(generated)
  console.log('\nADMIN_PASSWORD_HASH:')
  console.log(createHash('sha256').update(generated).digest('hex'))
  process.exit(0)
}

console.log(createHash('sha256').update(password).digest('hex'))

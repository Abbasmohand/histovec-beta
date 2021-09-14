import crypto from 'crypto'


export const base64Encode = (text) => {
  return Buffer.from(text, 'binary').toString('base64')
}

export const base64Decode = (text) => {
  return Buffer.from(text, 'base64').toString('binary')
}

export const urlSafeEncode = (text) => {
  // Equivalent to replace(/\+/g, '-').replace(/\//g, '_') but faster
  return text.replace(/[+/]/g, char => char === '+' ? '-' : '_')
}

export const urlSafeDecode = (text) => {
  // Equivalent to replace(/\-/g, '+').replace(/_/g, '/') but faster
  return text.replace(/[\-_]/g, char => char === '-' ? '+' : '/')
}

export const urlSafeBase64Encode = (text) => {
  const base64Encoded = base64Encode(text)

  return urlSafeEncode(base64Encoded)
}

export const urlSafeBase64Decode = (text) => {
  const base64Encoded = urlSafeDecode(text)

  return base64Decode(base64Encoded)
}

export const hash = (text) => crypto.createHash('sha256').update(text).digest()

// weak encryption (used for encryptedImmat)
export const decryptXOR = (encrypted, key) => String.fromCharCode(
  ...Buffer.from(encrypted, 'base64')
    .map((char, index) => char ^ key.charCodeAt(index % key.length))
)

/*
  Equivalent of dataprep Python function :

  def encrypt_string(key, string):
    padded = pad(string)
    iv = Random.new().read(AES.block_size)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    return base64.urlsafe_b64encode(iv + cipher.encrypt(padded))

  encrypt_string(hash(key), data)

  --------------
  Inspirations :
  https://www.semicolonworld.com/question/46424/encrypting-and-decrypting-with-python-and-nodejs#comment-21
  https://nodejs.org/en/knowledge/cryptography/how-to-use-crypto-module/#ciphers

  Algorithm   Key (generated by frontend)   IV
  aes256cbc   32 byte (256 bits)            16 byte (128 bits)
*/
const AES_ALGORITHM = 'aes-256-cbc'
const AES_BLOCK_SIZE = 16

const encrypt = (input, key) => {
  const iv = crypto.randomBytes(AES_BLOCK_SIZE)
  const bufferedKey = Buffer.from(key, 'base64')

  const cipher = crypto.createCipheriv(AES_ALGORITHM, bufferedKey, iv)

  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(input, 'utf8')),
    cipher.final(),
  ])

  const urlSafeBase64EncodedIvAndEncrypted = urlSafeBase64Encode(Buffer.concat([iv, encrypted]))

  return urlSafeBase64EncodedIvAndEncrypted
}

const decrypt = (urlSafeBase64EncodedIvAndEncrypted, key) => {
  const bufferedKey = Buffer.from(key, 'binary')
  const ivAndEncrypted = urlSafeBase64Decode(urlSafeBase64EncodedIvAndEncrypted)
  const iv = Buffer.from(ivAndEncrypted.slice(0, AES_BLOCK_SIZE), 'binary')
  const encrypted = Buffer.from(ivAndEncrypted.slice(AES_BLOCK_SIZE), 'binary')

  const decipher = crypto.createDecipheriv(AES_ALGORITHM, bufferedKey, iv)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])

  return decrypted
}

export const encryptJson = (json, key) => {
  const stringifiedJson = JSON.stringify(json)
  const encryptedJson = encrypt(stringifiedJson, key)

  return encryptedJson
}

export const decryptJson = (encryptedJson, key) => {
  const stringifiedJson = decrypt(encryptedJson, key)
  const json = JSON.parse(stringifiedJson)

  return json
}

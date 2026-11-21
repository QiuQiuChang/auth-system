import JSEncrypt from 'jsencrypt';
import axios from 'axios';

let cachedPublicKey = null;

async function getPublicKey() {
  if (cachedPublicKey) return cachedPublicKey;
  const res = await axios.get('/api/auth/public-key');
  cachedPublicKey = res.data.data.publicKey;
  return cachedPublicKey;
}

export async function encryptPassword(password) {
  const publicKey = await getPublicKey();
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  const encrypted = encrypt.encrypt(password);
  if (!encrypted) throw new Error('密码加密失败');
  return encrypted;
}

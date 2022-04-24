import CryptoJS from 'crypto-js'

const key = CryptoJS.enc.Hex.parse('8829403b456f41e7b07e1782d4a8a4d3')

/**
 * AES加密方法
 * @param content 要加密的字符串
 * @returns {string} 加密结果
 */
export function aesEncrypt(content) {
  let src = CryptoJS.enc.Utf8.parse(content);
  let encrypted = CryptoJS.AES.encrypt(src, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}

/**
 * 解密方法
 * @param encryptStr 密文
 * @returns {string} 明文
 */
export function aesDecrypt(encryptStr) {
  let decrypt = CryptoJS.AES.decrypt(encryptStr, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

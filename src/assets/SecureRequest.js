/*
    Simple encryption & decryption functions compatible with our server.
*/
var CryptoJS = require('crypto-js');

export default class SecureRequest {
    constructor(key) {
        this.key = `${key}'`;
    }
    patched_key() {
        var proper_key = '';
        this.key.includes("b'") ? proper_key = this.key : proper_key = `b'${this.key}`;
        return proper_key;
    }
    encrypt(text) {
        try {
            return JSON.stringify({ cipher: CryptoJS.AES.encrypt(JSON.stringify(text), this.patched_key()).toString() });
        } catch (e) {
            throw Error('Encryption algorithm faced an error');
        }
    }
    async decrypt(cipher) {
        try {
            return JSON.parse(CryptoJS.AES.decrypt(cipher, this.patched_key()).toString(CryptoJS.enc.Utf8));
        } catch (e) {
            console.error(e);
            throw Error('This request might have been tampered with or might have went through a man-in-the-middle attack');
        }
    }
}

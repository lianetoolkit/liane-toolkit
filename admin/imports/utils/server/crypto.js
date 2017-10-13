const crypto = require("crypto"),
  algorithm = "aes-256-ctr",
  password = "?U/7kCk;K9Z)_\Zb[.jmR$3rNQ=hZ:U/";

export function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, password);
  var crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

export function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, password);
  var dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

// var hw = encrypt("hello world")
// // outputs hello world
// console.log(decrypt(hw));


export function validateEmail(email){
  var re;
  re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
};

export function validateBitcoin(address){
  if(address.length < 25 || address.length > 34){
    return false
  }
  if(_.first(address) != 1) {
    return false
  }
  return true
};

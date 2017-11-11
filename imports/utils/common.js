import humanize from "humanize-plus"

export const getStatusColor = status => {
  if (status === 'completed') {
    return 'green';
  } else if (status === 'running') {
    return 'aqua';
  } else if (status === 'ready') {
    return 'light-blue';
  } else if (status === 'waiting') {
    return 'grey';
  } else if (status === 'validating') {
    return 'yellow';
  } else if (status === 'rejected') {
    return 'red';
  } else {
    return 'yellow';
  }
};

export const getRoleColor = role => {
  if (role === 'free-trial') {
    return 'blue';
  } else if (role === 'unsubscribed') {
    return 'olive';
  } else if (role === 'subscribed') {
    return 'green';
  } else if (role === 'admin') {
    return 'red';
  } else if (role === 'staff') {
    return 'orange';
  }
};

export const truncateText = (text, length) => {

  if (text.length > length) {
    let truncatedText = text.substring(0,length);
    truncatedText += '...';
    return truncatedText;
  }

  return text;
};

export const validateEmail = email => {
  const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
};

export const getRandomLoremPixel = function(lastDigit) {
  const options = ['sports', 'people', 'animals', 'nature', 'abstract', 'food', 'fashion', 'transport', 'nightlife', 'technics'];
  return `http://lorempixel.com/400/400/${options[lastDigit]}`;
};

export const roundFloat = value =>
  parseFloat(
    (
      Math.round(value * 100) / 100
    ).toFixed(2)
  )
;

const compactNumber = value => humanize.compactInteger(value, 1);

const pluralize = function(n, thing) {
  // fairly stupid pluralizer
  if (n === 0) {
    return '';
  }
  if (typeof n === 'undefined') {
    return '';
  }
  if (n === 1) {
    return `1 ${thing}`;
  } else {
    return n + ' ' + thing + 's';
  }
};

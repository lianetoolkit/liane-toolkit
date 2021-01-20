import moment from "moment";
require("moment/locale/es");
require("moment/locale/pt-br");
require("iframe-resizer/js/iframeResizer.contentWindow.js");

import { registerLocale, setDefaultLocale } from "react-datepicker";
import { enUS, es, ptBR } from "date-fns/esm/locale";
registerLocale("en", enUS);
registerLocale("es", es);
registerLocale("pt-BR", ptBR);

updateDepsLocales = (locale) => {
  if (locale) {
    moment.locale(locale.toLowerCase());
    setDefaultLocale(locale);
  }
};


// Set iframe class
if(window.self !== window.top) {
  const body = document.getElementsByTagName("BODY")[0]
  body.className += " iframe";
}

import moment from "moment";
require("moment/locale/es");
require("moment/locale/pt-br");

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

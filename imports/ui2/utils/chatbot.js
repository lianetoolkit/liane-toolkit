import { get } from "lodash";

export const isModuleActive = (chatbot, module) => {
  return get(chatbot, `extra_info.${module}.active`);
};

export default {
  isModuleActive
};

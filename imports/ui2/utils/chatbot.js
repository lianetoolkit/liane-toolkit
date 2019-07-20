import { get } from "lodash";

export const isModuleActive = (chatbot, customModules, module) => {
  switch (module) {
    case "notifications":
    case "proposals":
      return customModules && customModules[module];
    default:
      return get(chatbot, `extra_info.${module}.active`);
  }
};

export default {
  isModuleActive
};

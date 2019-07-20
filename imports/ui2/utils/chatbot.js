import { get } from "lodash";

export const isModuleActive = (chatbot, customModules, module) => {
  switch (module) {
    case "proposals":
      return customModules && customModules.proposals;
    default:
      return get(chatbot, `extra_info.${module}.active`);
  }
};

export default {
  isModuleActive
};

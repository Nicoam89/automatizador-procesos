import { resolveConfig } from "./utils.js";

const setContextExecutor = async (node, context) => {
  const { values = {} } = node.data.config || {};

  return {
    success: true,
    ...resolveConfig(values, context),
  };
};

export default setContextExecutor;

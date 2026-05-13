import { resolveConfig } from "./utils.js";

const transformExecutor = async (node, context) => {
  const { fields = {} } = node.data.config || {};

  const transformed = resolveConfig(fields, context);

  return {
    success: true,
    data: transformed,
  };
};

export default transformExecutor;

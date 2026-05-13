import { resolveTemplate } from "./utils.js";

const logExecutor =
  async (
    node,
    context
  ) => {

    const message =
      resolveTemplate(
        node.data.config.message,
        context
      );

    console.log(message);

    return {
      success: true,
      message,
    };
  };

export default logExecutor;

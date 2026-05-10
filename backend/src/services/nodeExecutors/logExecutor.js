const logExecutor =
  async (
    node,
    context
  ) => {

    const message =
      replaceVariables(
        node.data.config.message,
        context
      );

    console.log(message);

    return {
      success: true,
      message,
    };
  };

const replaceVariables =
  (text, context) => {

    return text.replace(
      /\{\{(.*?)\}\}/g,

      (_, variable) => {

        const path =
          variable
            .trim()
            .split(".");

        let value =
          context;

        for (const key of path) {

          value =
            value?.[key];
        }

        return value || "";
      }
    );
  };

export default logExecutor;
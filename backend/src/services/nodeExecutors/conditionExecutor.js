const conditionExecutor =
  async (
    node,
    context
  ) => {

    const {
      left,
      operator,
      right,
    } = node.data.config;

    const leftValue =
      resolveVariable(
        left,
        context
      );

    const rightValue =
      resolveVariable(
        right,
        context
      );

    let result = false;

    switch (operator) {

      case "==":

        result =
          leftValue ==
          rightValue;

        break;

      case "!=":

        result =
          leftValue !=
          rightValue;

        break;

      case ">":

        result =
          leftValue >
          rightValue;

        break;

      case "<":

        result =
          leftValue <
          rightValue;

        break;

      case ">=":

        result =
          leftValue >=
          rightValue;

        break;

      case "<=":

        result =
          leftValue <=
          rightValue;

        break;

      default:

        result = false;
    }

    return {
      success: true,
      result,
    };
  };

const resolveVariable =
  (value, context) => {

    if (
      typeof value !==
      "string"
    ) {
      return value;
    }

    const match =
      value.match(
        /\{\{(.*?)\}\}/
      );

    if (!match) {
      return value;
    }

    const path =
      match[1]
        .trim()
        .split(".");

    let result =
      context;

    for (const key of path) {

      result =
        result?.[key];
    }

    return result;
  };

export default conditionExecutor;
import { resolveTemplate } from "./utils.js";

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
      resolveTemplate(
        left,
        context
      );

    const rightValue =
      resolveTemplate(
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
         const conditionExecutor =
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

export default conditionExecutor;

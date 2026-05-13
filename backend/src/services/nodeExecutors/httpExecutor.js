import axios from "axios";
import { resolveConfig, resolveTemplate } from "./utils.js";

const httpExecutor =
  async (
    node,
    context
  ) => {
    const {
      url,
      method,
      body,
      headers,
    } = node.data.config;

    const resolvedUrl =
      resolveTemplate(
        url,
        context
      );

    const resolvedBody =
      resolveConfig(
        body || {},
        context
      );

    const resolvedHeaders =
      resolveConfig(
        headers || {},
        context
      );

    const response =
      await axios({
        url: resolvedUrl,
        method:
          method || "GET",
        headers:
          resolvedHeaders,
        data:
          resolvedBody,
      });

    return {
      success: true,
      data:
        response.data,
    };
  };

export default httpExecutor;

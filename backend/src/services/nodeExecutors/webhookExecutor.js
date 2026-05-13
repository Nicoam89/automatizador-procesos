import axios from "axios";
import { resolveConfig, resolveTemplate } from "./utils.js";

const webhookExecutor = async (node, context) => {
  const { url, method = "POST", headers = {}, body = {} } = node.data.config || {};

  const resolvedUrl = resolveTemplate(url, context);
  const resolvedHeaders = resolveConfig(headers, context);
  const resolvedBody = resolveConfig(body, context);

  const response = await axios({
    url: resolvedUrl,
    method,
    headers: resolvedHeaders,
    data: resolvedBody,
  });

  return {
    success: true,
    status: response.status,
    data: response.data,
  };
};

export default webhookExecutor;

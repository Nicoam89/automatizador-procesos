import axios from "axios";

const httpExecutor =
  async (
    node,
    context
  ) => {

    const {
      url,
      method,
      body,
    } = node.data.config;

    const response =
      await axios({
        url,
        method:
          method || "GET",
        data: body || {},
      });

    return {
      success: true,

      data:
        response.data,
    };
  };

export default httpExecutor;
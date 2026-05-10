const delayExecutor =
  async (node) => {

    const duration =
      node.data.config.duration ||
      3000;

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          duration
        )
    );

    return {
      success: true,
    };
  };

export default delayExecutor;
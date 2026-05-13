export const resolveTemplate = (value, context = {}) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/\{\{(.*?)\}\}/g, (_, variable) => {
    const path = variable.trim().split(".");
    let result = context;

    for (const key of path) {
      result = result?.[key];
    }

    return result ?? "";
  });
};

export const resolveConfig = (input, context = {}) => {
  if (Array.isArray(input)) {
    return input.map((item) => resolveConfig(item, context));
  }

  if (input && typeof input === "object") {
    return Object.entries(input).reduce((acc, [key, value]) => {
      acc[key] = resolveConfig(value, context);
      return acc;
    }, {});
  }

  return resolveTemplate(input, context);
};

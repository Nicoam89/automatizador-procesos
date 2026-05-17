import { resolveTemplate } from "./utils.js";

const textParserExecutor = async (node, context) => {
  const config = node.data.config || {};
  const input = resolveTemplate(config.input || "", context);
  const mode = config.mode || "json";

  if (mode === "json") {
    const parsed = JSON.parse(input);
    return { success: true, mode, parsed };
  }

  if (mode === "regex") {
    const pattern = config.pattern || "";
    const flags = config.flags || "";
    const regex = new RegExp(pattern, flags);
    const matches = Array.from(input.matchAll(regex)).map((match) => ({
      fullMatch: match[0],
      groups: match.slice(1),
      index: match.index,
    }));

    return { success: true, mode, matches };
  }

  if (mode === "kv") {
    const delimiter = config.delimiter || "=";
    const lineSeparator = config.lineSeparator || "\n";
    const parsed = input
      .split(lineSeparator)
      .map((line) => line.trim())
      .filter(Boolean)
      .reduce((acc, line) => {
        const idx = line.indexOf(delimiter);
        if (idx === -1) return acc;
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + delimiter.length).trim();
        acc[key] = value;
        return acc;
      }, {});

    return { success: true, mode, parsed };
  }

  throw new Error(`textParserExecutor: modo no soportado '${mode}'`);
};

export default textParserExecutor;

import vm from "node:vm";
import { resolveConfig } from "./utils.js";

const codeExecutor = async (node, context) => {
  const config = resolveConfig(node.data.config || {}, context);
  const code = config.code;

  if (!code || typeof code !== "string") {
    throw new Error("codeExecutor: 'code' debe ser un string no vacío");
  }

  const sandbox = {
    input: config.input ?? {},
    context,
    output: null,
  };

  const script = new vm.Script(code);
  const vmContext = vm.createContext(sandbox);
  script.runInContext(vmContext, { timeout: Number(config.timeoutMs || 1000) });

  return {
    success: true,
    output: vmContext.output,
  };
};

export default codeExecutor;

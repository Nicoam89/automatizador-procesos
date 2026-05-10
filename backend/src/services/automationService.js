import Automation from "../models/Automation.js";

import Execution from "../models/Execution.js";

export const executeAutomationService =
  async (automationId) => {

    const automation =
      await Automation.findById(
        automationId
      );

    if (!automation) {
      throw new Error(
        "Automatización no encontrada"
      );
    }

    const execution =
      await Execution.create({
        automation: automation._id,
        status: "running",
        logs: ["Iniciando automatización"],
      });

    try {

      for (const action of automation.actions) {

        execution.logs.push(
          `Ejecutando acción: ${action}`
        );

        await execution.save();

        await simulateAction(action);

        execution.logs.push(
          `Acción completada: ${action}`
        );

        await execution.save();
      }

      execution.status = "completed";

      execution.logs.push(
        "Automatización finalizada"
      );

      await execution.save();

      return execution;

    } catch (error) {

      execution.status = "failed";

      execution.logs.push(
        `Error: ${error.message}`
      );

      await execution.save();

      throw error;
    }
  };

const simulateAction = async (
  action
) => {

  return new Promise((resolve) => {

    setTimeout(() => {
      resolve();
    }, 1000);

  });
};
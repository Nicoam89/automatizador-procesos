import cron from "node-cron";

import Automation from "../models/Automation.js";

import {
  enqueueAutomationExecution,
} from "../queues/automationQueue.js";

const activeJobs = {};

export const loadSchedulers =
  async () => {

    const automations =
      await Automation.find({
        trigger: "cron",
        status: "active",
      });

    for (const automation of automations) {

      startAutomationJob(
        automation
      );
    }
  };

export const startAutomationJob =
  (automation) => {

    if (!automation.schedule) {
      return;
    }

    if (
      activeJobs[automation._id]
    ) {

      activeJobs[
        automation._id
      ].stop();
    }

    const job = cron.schedule(
      automation.schedule,

      async () => {

        console.log(
          `Ejecutando automation: ${automation.name}`
        );

        try {

          await enqueueAutomationExecution({
            automationId: String(automation._id),
            source: "cron",
          });



        } catch (error) {

          console.error(error);

        }
      }
    );

    activeJobs[
      automation._id
    ] = job;

    console.log(
      `Job iniciado: ${automation.name}`
    );
  };

export const stopAutomationJob =
  (automationId) => {

    if (
      activeJobs[automationId]
    ) {

      activeJobs[
        automationId
      ].stop();

      delete activeJobs[
        automationId
      ];

      console.log(
        `Job detenido: ${automationId}`
      );
    }
  };
import logExecutor
  from "./logExecutor.js";

import delayExecutor
  from "./delayExecutor.js";

import httpExecutor
  from "./httpExecutor.js";

import conditionExecutor
  from "./conditionExecutor.js";


const nodeExecutors = {

  log: logExecutor,

  delay: delayExecutor,

  http: httpExecutor,

  condition: conditionExecutor,
};

export default nodeExecutors;
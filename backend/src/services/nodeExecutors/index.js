import logExecutor
  from "./logExecutor.js";

import delayExecutor
  from "./delayExecutor.js";

import httpExecutor
  from "./httpExecutor.js";

import conditionExecutor
  from "./conditionExecutor.js";

import webhookExecutor
  from "./webhookExecutor.js";

import transformExecutor
  from "./transformExecutor.js";

import setContextExecutor
  from "./setContextExecutor.js";


import mailExecutor
  from "./mailExecutor.js";

import textParserExecutor
  from "./textParserExecutor.js";

import codeExecutor
  from "./codeExecutor.js";

const nodeExecutors = {

  log: logExecutor,

  delay: delayExecutor,

  http: httpExecutor,

  condition: conditionExecutor,

  webhook: webhookExecutor,

  transform: transformExecutor,

  setContext: setContextExecutor,

  mail: mailExecutor,

  textParser: textParserExecutor,

  code: codeExecutor,
};

export default nodeExecutors;

const { Worker, isMainThread, parentPort,workerData } = require('worker_threads');
const tankslogic = require('./static/scripts/tankslogic');

  if (isMainThread) {
    module.exports = function(script) {
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: script
        });
        worker.on('message', function(s){resolve(s)});
        worker.on('error', function(s){reject(s)});
        worker.on('exit', (code) => {
          if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`));
        });
      });
    };
  } else {
    states = workerData;
    tanks = states[0];
    bullets = states[1];
    returns = [];
    for (i=2;i<states.length;i++){
      tankslogic.updateone(states[i]);
      returns.push([tanks[i],bullets[i],i]);
    }
    parentPort.postMessage(returns);
  }
  
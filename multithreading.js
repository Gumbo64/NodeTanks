const { Worker, isMainThread, parentPort,workerData } = require('worker_threads');

  if (isMainThread) {
    module.exports = function(script) {
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: script
        });
        worker.on('message', function(s){resolve(s)});
        worker.on('error', function(s){console.log(s);reject(s)});
        worker.on('exit', (code) => {
          if (code !== 0)
            console.log(s)
            reject(new Error(`Worker stopped with exit code ${code}`));
        });
      });
    };
  } else {
    const tankslogic = require('./static/scripts/tankslogic');
    states = workerData;
    tanks = states[0];
    bullets = states[1];
    returns = [];
    console.log(states)
    for (i=2;i<states.length;i++){
      console.log(states[i])
      tankslogic.updateone(states[i]);
      console.log('ddassads')
      returns.push([tanks[states[i]],bullets[states[i]],states[i]]);
      console.log('bassel')
    }
    parentPort.postMessage(returns);
    console.log('closed', returns, "end")
  }
  
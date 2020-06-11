const { Worker, isMainThread, parentPort,workerData } = require('worker_threads');
workerid = require('worker_threads').threadId;
console.log(workerid)
  if (isMainThread) {
    module.exports = function(script) {
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: script
        });
        worker.once('message', function(s){resolve(s)});
        worker.once('error', function(s){console.log(s);reject(s)});
        worker.once('exit', (code) => {
          if (code !== 0)
            console.log(code)
            reject(new Error(`Worker stopped with exit code ${code}`));
        });
      });
    };
  } else {
    const tankslogic = require('./static/scripts/tankslogic');
    (async () => {
      clonedata = [ workerData ]
      clonedata=clonedata[0]
      // console.log(clonedata)
      tanks =  clonedata[0];
      // console.log(clonedata)
      bullets = clonedata[1];
      const colours = clonedata.slice(2)
      // console.log(colours)
      returns = [];
      lengtho = colours.length;
      for (i=0;i<lengtho;i++){
        // console.log(colours, 'all')
        // console.log(colours[i], 'one')
        tankslogic.updateone(colours[i]);
        returns.push([tanks[colours[i]],bullets[colours[i]],colours[i]]);
        // console.log('bassel')
      }
      // console.log(tanks)
      parentPort.postMessage(returns);
      
      // console.log('closed', returns, "end")
    })();
  }
  
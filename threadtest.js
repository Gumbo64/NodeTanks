const {
    Worker, isMainThread, parentPort, workerData
  } = require('worker_threads');
  const tankslogic = require('./static/scripts/tankslogic');
  number = 2

      
  if (isMainThread) {
    function workering(script) {
      return new Promise((resolve, reject) => {  
        const worker = new Worker(__filename);
        worker.once('message', function(a){resolve(a)});
        worker.once('error',reject)
        worker.once('exit',reject)
        worker.postMessage(script);
      })
    };
    value = true
    // (async function(){
      setTimeout(async function a() {
        value = await workering(value);
        console.log(value)
        setTimeout(a, 0);
      }, 100);
    // })
    
  } else {
    parentPort.on('message',function(a){
      parentPort.postMessage(!a);
    })
    
  }
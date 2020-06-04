const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
    // Main Thread

    // Makes the worker
    const worker = new Worker(__filename);
    const worker2 = new Worker(__filename);
    

    // What reaction to have when u recieve a postmessage from worker
    worker.on('message', (message) => {
        console.log(message);  // Prints 'Hello, world!'.
    });
    // What reaction to have when u recieve a postmessage from worker2
    worker2.on('message', (message) => {
        console.log(message);  // Prints 'Hello, world!'.
    });
    // tell worker to do it
    worker.postMessage(13231);
    worker.postMessage(3);
    worker2.postMessage(20);

} else {
    // Secondary Threads
    // When a message from the parent thread is received, send it back:
    parentPort.on('message', (message) => {
        result = message ** 2;
        parentPort.postMessage(result);
    });
}
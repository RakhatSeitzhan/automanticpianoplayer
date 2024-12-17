function connectSerial(options){
    return new Promise(async (res, rej) => {
        try {
            const serialPort = await navigator.serial.requestPort();
            await serialPort.open(options);
            res(serialPort) 
          } catch (error) {
            rej(error)
            // console.error('Error connecting to serial port:', error);
          }
    })
}
async function sendDataOverSerial(port, data){
  // let played = false
  // while (!played){
    try {
      if (!port) {
        console.error('Serial port is not open');
        return;
      }
      const writer = port.writable.getWriter();
      var enc = new TextEncoder();
      
      await writer.write(enc.encode(data));
      await writer.releaseLock();
      // played = true
    } catch (error) {
      console.error('Error sending data:', error);
      // if (!port) {
      //   console.error('Serial port is not open');
      //   return;
      // }
      // const writer = port.writable.getWriter();
      // var enc = new TextEncoder();
      
      // await writer.write(enc.encode(data));
      // await writer.releaseLock();
      // console.error('Error sending data:', error);
    }
  // }
    
};

export { connectSerial, sendDataOverSerial }
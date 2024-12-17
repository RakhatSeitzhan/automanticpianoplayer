import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';

function SerialCommunication() {
  const [port, setPort] = useState(null);
  const [outputData, setOutputData] = useState('');
  const [inputData, setInputData] = useState('');
  useEffect(() => {
    const readData = async () => {
      try {
        if (!port) return;

        const reader = port.readable.getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            console.log('Reader has been released.');
            break;
          }
          const textDecoder = new TextDecoder();
          const decodedString = textDecoder.decode(value); // Decode incoming bytes to string
          setInputData(prev => prev + decodedString);
        }
      } catch (error) {
        console.error('Error reading data:', error);
      }
    };

    readData();

    return () => {
      if (port) {
        port.close();
        setPort(null);
      }
    };
  }, [port]);

  // Function to connect to the serial port
  const connectSerial = async () => {
    try {
      const serialPort = await navigator.serial.requestPort();
      await serialPort.open({ baudRate: 19200 });
      setPort(serialPort);
    } catch (error) {
      console.error('Error connecting to serial port:', error);
    }
  };

  // Function to send data through the serial port
  const sendData = async () => {
    try {
      if (!port) {
        console.error('Serial port is not open');
        return;
      }
      const writer = port.writable.getWriter();
      var enc = new TextEncoder();
      
      await writer.write(enc.encode(outputData));
      await writer.releaseLock();
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  return (
    <div>
      <Button onClick={connectSerial}>Connect to Serial Port</Button>
      <input
        type="text"
        value={outputData}
        onChange={(e) => setOutputData(e.target.value)}
        placeholder="Data to send"
      />
      <Button onClick={sendData}>Send Data</Button>
    </div>
  );
}

export default SerialCommunication;
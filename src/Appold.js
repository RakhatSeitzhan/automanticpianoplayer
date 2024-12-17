import { useState, useEffect, createContext } from 'react';
import './App.css';
import convertAudioToMidi from './Converter.js';
import { connectToDevice, MidiPlay, AudioPlay } from './MidiSender.js';
import MidiParser from 'midi-parser-js';
import WebMscore from 'webmscore'
import { CircularProgress } from '@mui/material';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import { AvailableSongs } from './components/AvailabeSongs.js';


function App() {
  const bluetoothContext = createContext()
  

  const [fileLoading, setFileLoading] = useState(false)
  const [bluetooth, setBluetooth] = useState()
  const [midiData, setMidiData] = useState()
  const [audioData, setAudioData] = useState()
  const [fileType, setFileType] = useState()
  const [alert, setAlert] = useState()
  const allowedFileTypes = ['.midi','.mid', '.mp3', '.ogg', '.wav', '.flac']
  const MIDI_SERVICE_UUID = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
  const MIDI_CHARACTERISTIC_UUID = '7772e5db-3868-4112-a1a9-f2669d106bf3';

  const getSheetData = () => {
    return new Promise((resolve, reject) => {
      fetch("/convertimage")
      .then(res => res.json())
      .then(binaryString => {
        var WINDOWS_1252 = '\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\b\t\n\u000b\f\r\u000e\u000f\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~€�‚ƒ„…†‡ˆ‰Š‹Œ�Ž��‘’“”•–—˜™š›œ�žŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ';
        var text = '';
        for (var i = 0; i < binaryString.midi.length; i++) {
            text += WINDOWS_1252.charAt(binaryString.midi.charCodeAt(i));
        }
        const midiBuffer = new Uint8Array(text)
        resolve(midiBuffer)
      })
      .catch(err => reject(err))
    })
  }

  const handleConnect = () => {
    connectToDevice(MIDI_SERVICE_UUID, MIDI_CHARACTERISTIC_UUID).then(bl => {
      if (bl){
        setAlert({type: 'success', message: 'Successfully connected to the bluetooth device!'})
        setBluetooth(bl)
      } else {
        setAlert({type: 'warning', message: 'Please connect to a bluetooth device from the list!'})
      }
      
    })
  }
  const startMidiPlay = () => {
    if (bluetooth){
      if (fileType == 'midi' || fileType == 'mid'){
        MidiPlay(bluetooth, midiData, timing)
      } else {
        AudioPlay(bluetooth, audioData)
      }
    } else {
      setAlert({type: 'error', message: 'Bluetooth device is not connected!'})
    }
  }
  const readMidiFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const midiArrayBuffer = new Uint8Array(e.target.result);
      console.log('Converting the midi file into JSON...')
      const parsedData = MidiParser.parse(midiArrayBuffer);
      console.log(parsedData)
      parsedData.track.forEach(track => {
        track.event.forEach(event => {
          if (event.type == 11){
            if (event.data[0] == 64){
              console.log(event)
            }
          }
          
        })
      })
      setMidiData(parsedData);
      setFileLoading(false)
      setAlert({type: 'success', message: 'Successfully converted into midi file!'})
    };
    reader.readAsArrayBuffer(file);
  }
  const readAudioFile = (file) => {
    convertAudioToMidi(file).then(([notes, fileData]) => {
      setAudioData(notes)
      // const parsedData = MidiParser.parse(fileData);
      // console.log(parsedData)
      setFileLoading(false)
      setAlert({type: 'success', message: 'Successfully converted into midi file!'})
    })
  }
  const readSheetMusicFile = (file) => {
    WebMscore.ready.then(async () => {
      const score = await WebMscore.load('mscz', file)
      console.log(score)
      setFileLoading(false)
      setAlert({type: 'success', message: 'Successfully converted into midi file!'})
    })
  }
  const handleFileChange = (event) => {
    setAlert({type: 'info', message: 'Converting the given input file into midi...'})
    setFileLoading(true)
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (file){
      const fileExtension = file.name.split('.').slice(-1)
      setFileType(fileExtension)
      if (fileExtension == 'mid' || fileExtension == 'midi'){
        readMidiFile(file)
      } else if (fileExtension == 'mscz'){
        readSheetMusicFile(file)
      } else {
        readAudioFile(file)
      }
      
    }
  };
  const handleReadSheet = () => {
    getSheetData().then(midiBuffer => {
      const parsedData = MidiParser.parse(midiBuffer);
      setMidiData(parsedData);
      setFileLoading(false)
      console.log(parsedData)
      setAlert({type: 'success', message: 'Successfully converted into midi file!'})
    })
  }
  const sendSomeData = async() => {
    for (var i = 0; i < 10; i++){
      const msg1 = new Uint32Array([9, 50, 127, 0]).buffer
      const msg2 = new Uint32Array([8, 50, 0, 2000]).buffer
      // console.log(msg1)
      await bluetooth.midiCharacteristic.writeValue(msg1)
      await bluetooth.midiCharacteristic.writeValue(msg2)
    }
  }
  const StartPlay = () => {
    const msg = new Uint32Array([1, 0, 0, 0])
    bluetooth.midiCharacteristic.writeValue(msg)
  }
  const StopPlay = () => {
    const msg = new Uint32Array([0, 0, 0, 0]).buffer
    bluetooth.midiCharacteristic.writeValue(msg)
  }
  const sendSongMidiData = () =>  {
    console.log(midiData)
  }
  const test = () =>{
    let events = []
    for (var i = 0; i < 500; i++){
      const note = Math.floor(i%30+20)
      const deltaTime = 200
      events.push({type: 9, data: [note, 127], deltaTime: 0})
      events.push({type: 9, data: [note+2, 127], deltaTime: 0})
      events.push({type: 8, data: [note, 127], deltaTime: deltaTime})
      events.push({type: 8, data: [note+2, 127], deltaTime: 0})
    }
    const testMidi = {track: [{event: events}]}
    MidiPlay(bluetooth, testMidi)
  }
  const [timing, setTiming] = useState(1)
  const handleTiming = (e) => {
    setTiming(Number(e.target.value))
  }


  return (
    <div className="App">
      {/* <Player/> */}
      {alert && <Alert severity={alert.type}>{alert.message} {fileLoading && <CircularProgress />}</Alert>}
      <div className='ButtonContainer'>
        <div className='TextContainer'>
          <div>Connect to bluetooth device</div>
          <Button variant='outlined' onClick={handleConnect}>Connect</Button>
        </div>
      </div>
      <div className='ButtonContainer'>
        <div className='TextContainer'>
          <div>Upload your file</div>
          <Input onChange={handleFileChange} type='file' inputProps={{accept:allowedFileTypes.join(', ')}}></Input>
        </div>
      </div>
      <AvailableSongs></AvailableSongs>
      <div className='ButtonContainer'>
        <div className='TextContainer'>
          <div>Play the music on your piano!</div>
          <Button onClick={startMidiPlay} variant="contained">Play</Button>
        </div>
      </div>
      <button onClick={sendSomeData}>Send some data</button>
      <button onClick={StartPlay}>Start Play</button>
      <button onClick={StopPlay}>Stop Play</button>
      <button onClick={sendSongMidiData}>Send Song data</button> 
      {/* <Button onClick={handleReadSheet} variant="contained">Read sheet music</Button> */}
      <button onClick={test}>test</button>
      <input onChange={handleTiming}></input>
    </div>
  );
}

export default App;

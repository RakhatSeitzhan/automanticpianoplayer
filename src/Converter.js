import {BasicPitch, noteFramesToTime, addPitchBendsToNoteEvents, outputToNotesPoly} from '@spotify/basic-pitch'
// import { generateFileData } from "@spotify/basic-pitch/src/toMidi";
import { useState } from 'react';
import { Midi } from '@tonejs/midi';
export default function convertAudioToMidi(file){
  const audioCtx = new AudioContext({ sampleRate: 22050, numberOfChannels: 1, channelCount:1});
  const reader = new FileReader();
  const predictNotes = new Promise((resolve, reject) => {
    reader.onload = (e) => {
      audioCtx.decodeAudioData(
        e.target.result, 
        (audioBuffer) => resolve(predict(convertStereoToMono(audioBuffer))), 
        (error) => reject(error)
      )
    };
    reader.readAsArrayBuffer(file);
  })
  return predictNotes.then(notes => {
    const fileData = generateFileData(notes)
    const noteOnOff = []
    notes.forEach(note => {
      const noteOff = {...note, startTimeSeconds: note.startTimeSeconds + note.durationSeconds, amplitude:0}
      noteOnOff.push(note)
      noteOnOff.push(noteOff)
    });
    const sortedByStartTime = noteOnOff.sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
    const maxAmplitude = 1
    const maxVelocity = 127
    const noteEvents = sortedByStartTime.map((note, index) => {
      const deltaTimeSeconds = index != 0 ? note.startTimeSeconds - sortedByStartTime[index-1].startTimeSeconds : note.startTimeSeconds
      const type = note.amplitude == 0 ? 8 : 9
      const velocity = note.amplitude/maxAmplitude*maxVelocity
      return {pitch: note.pitchMidi, type: type, velocity: Math.floor(velocity), deltaTime: Math.floor(deltaTimeSeconds*1000)}
    })
    console.log('Note detection completed!')
    
    return [noteEvents, fileData]
  })
}
function convertStereoToMono(stereoBuffer) {
  console.log('Converting the loaded audio into mono AudioBuffer...')
  const channels = stereoBuffer.numberOfChannels;
  const length = stereoBuffer.length;
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const monoBuffer = context.createBuffer(1, length, stereoBuffer.sampleRate);
  let monoData = monoBuffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    let sum = 0;
    for (let j = 0; j < channels; j++) {
      sum += stereoBuffer.getChannelData(j)[i];
    }
    monoData[i] = sum / channels;
  }
  monoBuffer.copyFromChannel(monoData, 0, 0);
  return monoBuffer;
}
async function predict(audioBuffer){
  
  let frames = [], onsets = [], contours = []
  let pct
  console.log('Loading TensorFlow model...')
  const basicPitch = new BasicPitch('model.json');
  console.log('Detecting pitch from audio file...')
  await basicPitch.evaluateModel(
    audioBuffer,
    (f, o, c) => {
      frames.push(...f);
      onsets.push(...o);
      contours.push(...c);
    },
    (p) => {
      pct = p;
    },
  );
  const notes = noteFramesToTime(
  addPitchBendsToNoteEvents(
      contours,
      outputToNotesPoly(frames, onsets, 0.25, 0.25, 5),
    ),
  );
  return notes
}
function generateFileData(notes) {
  const midi = new Midi();
  const track = midi.addTrack();
  notes.forEach(note => {
    track.addNote({
      midi: note.pitchMidi,
      time: note.startTimeSeconds,
      duration: note.durationSeconds,
      velocity: note.amplitude,
    });
    if (note.pitchBends !== undefined && note.pitchBends !== null) {
      note.pitchBends.forEach((bend, i) => {
        track.addPitchBend({
          time:
            note.startTimeSeconds + (i * note.durationSeconds) / note.pitchBends?.length,
          value: bend,
        });
      });
    }
  });
  return new Uint8Array(midi.toArray());
}
// export default function Converter(){
//   const [audioBuffer, setAudioBuffer] = useState()
//   const readFile = (file) => {
//     const audioCtx = new AudioContext({ sampleRate: 22050, numberOfChannels: 1, channelCount:1});
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const success = (data) => {
//         const monoBuffer = convertStereoToMono(data)
//         setAudioBuffer(monoBuffer)
        
//         console.log('Read array buffer successfully')
//       }
//       const error = (error) => {
//         console.error(error)
//       }
//       audioCtx.decodeAudioData(e.target.result, success, error)
//     };
//     reader.readAsArrayBuffer(file);
//   }
//   function convertToMidi(){
    
//     loadAIModel()
//   }
//   // function ensureBytesMultipleOfFour(audioBuffer) {
//   //   const multOfFourctx = new AudioContext()
//   //   const newLength = Math.floor(audioBuffer.length / 4)*4
//   //   const offset = audioBuffer.length - Math.floor(audioBuffer.length / 4)*4
//   //   const multOfFourBuffer = multOfFourctx.createBuffer(1, newLength, audioBuffer.sampleRate)
//   //   multOfFourBuffer.copyFromChannel(audioBuffer.getChannelData(0),0,offset)
//   //   return multOfFourBuffer;
//   // }
  
//   function convertStereoToMono(stereoBuffer) {
//     const channels = stereoBuffer.numberOfChannels;
//     const length = stereoBuffer.length;
//     const context = new (window.AudioContext || window.webkitAudioContext)();
//     const monoBuffer = context.createBuffer(1, length, stereoBuffer.sampleRate);
//     let monoData = monoBuffer.getChannelData(0);
//     for (let i = 0; i < length; i++) {
//       let sum = 0;
//       for (let j = 0; j < channels; j++) {
//         sum += stereoBuffer.getChannelData(j)[i];
//       }
//       monoData[i] = sum / channels;
//     }
//     monoBuffer.copyFromChannel(monoData, 0, 0);
//     return monoBuffer;
//   }
//   async function loadAIModel(){
//     let frames = [], onsets = [], contours = []
//     let pct
//     const basicPitch = new BasicPitch('model.json');
//     await basicPitch.evaluateModel(
//       audioBuffer,
//       (f, o, c) => {
//         frames.push(...f);
//         onsets.push(...o);
//         contours.push(...c);
//       },
//       (p) => {
//         pct = p;
//       },
//     );
//     const notes = noteFramesToTime(
//     addPitchBendsToNoteEvents(
//         contours,
//         outputToNotesPoly(frames, onsets, 0.25, 0.25, 5),
//       ),
//     );
//     console.log(notes)
//   }
//   const handleInput = (e) => {
//     readFile(e.target.files[0])
//   }
//   const handleClick = () => {
//     convertToMidi()
//   }
//   const handleInput2 = (e) => {
//     const file = e.target.files[0]
//     convertAudioToMidi(file).then(notes => console.log(notes))
//   }
//   return (
//   <div>
//     Input your audio file
//     <input onChange={handleInput} type='file' ></input>
//     <button onClick={handleClick}>Convert</button>
//     <input onChange={handleInput2} type='file' ></input>
//   </div>)
// }
import { useEffect, useState } from "react";
import MidiParser from 'midi-parser-js';

export async function connectToDevice(MIDI_SERVICE_UUID, MIDI_CHARACTERISTIC_UUID){
    let bluetooth
    try {
        const device = await navigator.bluetooth.requestDevice({
        //   filters: [{name: "MIDI device"}],
            filters: [{services: ['03b80e5a-ede8-4b33-a751-6ce34ec4c700']}],
          optionalServices: ['03b80e5a-ede8-4b33-a751-6ce34ec4c700'],
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(MIDI_SERVICE_UUID);
        const midiCharacteristic = await service.getCharacteristic(MIDI_CHARACTERISTIC_UUID);
        bluetooth = {device, server, service, midiCharacteristic}
    } catch (error) {
        console.error('Bluetooth connection error:', error);
    }
    return bluetooth
}

function getTimestampBytes(){
    const d = Date.now().toString(2).split('').reverse();
    const byte0 = ['1', '0', d[12], d[11], d[10], d[9], d[8], d[7]];
    const byte1 = ['1', d[6], d[5], d[4], d[3], d[2], d[1], d[0]];
    return {
        header: parseInt(byte0.join(''), 2),
        messageTimestamp: parseInt(byte1.join(''), 2)
    }
}
function sendPacket(bluetooth, midiEvent){
    return new Promise((resolve, reject) => {
        if (!bluetooth.midiCharacteristic) {
            return Promise.resolve('Cannot send packet without characteristic');
        }
        const { header, messageTimestamp } = getTimestampBytes();
        const midiStatus = midiEvent.channel & 0x0f | midiEvent.type;
        const midiOne = midiEvent.note & 0x7f;
        const midiTwo = midiEvent.velocity & 0x7f;
        const packet = new Uint8Array([
            header,
            messageTimestamp,
            midiStatus,
            midiOne,
            midiTwo
        ]);
        bluetooth.midiCharacteristic.writeValue(packet).then(res => resolve('sentmidi'))
    })
};
function rescursiveMidiPlay(index, events, timeScale, bluetooth){
    // console.log(events)
    const timeoutId = setTimeout(async () => {
        clearTimeout(timeoutId)
        if (index != events.length-1) {    
            const midiEvent = {
                type: events[index].type == 9 ? 0x90 : 0x80, 
                note: events[index].data[0], 
                channel:1, 
                velocity: events[index].data[1]
            }               
            await sendPacket(bluetooth, midiEvent)
            // console.log('Sent the note: ', events[index].data[0], ' with the result: ', res)
            rescursiveMidiPlay(index+1, events, timeScale, bluetooth)
        }
    }, events[index].deltaTime*timeScale)
}
export function MidiPlay(bluetooth, midiData, timing){
    let events = []
    midiData.track.forEach(track => {
        events.push(...track.event)
    });
    // const events = midiData.track[0].event
    // const timing = 1 // time scale factor
    const noteDurationLimit = 2000
    const onlyNoteOnOffevents = events.filter(item => item.type == 8 || item.type == 9)
    const startTimeFormatted = convertDeltaTimeToStartTime(onlyNoteOnOffevents)
    const limited = limitNoteDuration(startTimeFormatted, noteDurationLimit)
    const notesToBeSent = convertStartTimeToDeltaTime(limited)
    
    rescursiveMidiPlay(0, notesToBeSent, timing, bluetooth)
    // stackMidiPlay(bluetooth,notesToBeSent)
}
function min(a,b){
    return a > b ? b : a
}
function shiftEachNote(notes, shiftvalue){
    return notes.map(note => {
        return {...note, data:[note.data[0]-shiftvalue, note.data[1]]}
    })
    // return 
}
const delay = ms => new Promise(res => setTimeout(res, ms));
async function stackMidiPlay(bluetooth, notes){
    const noteCapacity = 500// !!!! important! this is the size of stack in arduino board
    const noteSendAfter = 200
    console.log(notes)
    let timeSum = 0;
    // await sendNoteOverBle(bluetooth, 9, 50, 127, 2000)
    // await sendNoteOverBle(bluetooth, 9, 52, 127, 0)
    // await sendNoteOverBle(bluetooth, 9, 54, 127, 0)
    // await sendNoteOverBle(bluetooth, 9, 55, 127, 0)
    // await sendNoteOverBle(bluetooth, 9, 57, 127, 0)

    // await sendNoteOverBle(bluetooth, 8, 50, 127, 2000)
    // await sendNoteOverBle(bluetooth, 8, 52, 127, 0)
    // await sendNoteOverBle(bluetooth, 8, 54, 127, 0)
    // await sendNoteOverBle(bluetooth, 8, 55, 127, 0)
    // await sendNoteOverBle(bluetooth, 8, 57, 127, 0)

    // await sendNoteOverBle(bluetooth, 9, 50, 127, 2000)
    // await sendNoteOverBle(bluetooth, 9, 52, 127, 0)
    // await sendNoteOverBle(bluetooth, 9, 54, 127, 0)
    // await sendNoteOverBle(bluetooth, 9, 55, 127, 0)
    // await sendNoteOverBle(bluetooth, 9, 57, 127, 0)

    // await sendNoteOverBle(bluetooth, 8, 50, 127, 2000)
    // await sendNoteOverBle(bluetooth, 8, 52, 127, 0)
    // await sendNoteOverBle(bluetooth, 8, 54, 127, 0)
    // await sendNoteOverBle(bluetooth, 8, 55, 127, 0)
    // await sendNoteOverBle(bluetooth, 8, 57, 127, 0)

    // for (var i = 0; i < notes.length; i++){
    // for (var i = 0; i < min(notes.length,noteCapacity); i++){
    //     // console.log('sending...')
    //     await sendNoteOverBle(bluetooth, notes[i].type, notes[i].data[0], notes[i].data[1], notes[i].deltaTime)
    //     timeSum += notes[i].deltaTime
    // }
    // await sendNoteOverBle(bluetooth, 1, 0, 0, 0)
    
    // for (var k = 1; k < Math.ceil( notes.length / noteSendAfter); k++){
    //     await new Promise((res, rej) => {
    //         setTimeout(() => {
    //             res()
    //         }, timeSum)
    //     })
    //     console.log("sending new packet")
    //     timeSum = 0
    //     for (var i = noteCapacity+(k-1)*noteSendAfter; i < min(noteCapacity+(k-1)*noteSendAfter+noteSendAfter, notes.length); i++){
    //         await sendNoteOverBle(bluetooth, notes[i].type, notes[i].data[0], notes[i].data[1], notes[i].deltaTime)
    //         timeSum += notes[i].deltaTime
    //     }
    // }
    // for (var i = 0; i < min(notes.length,noteCapacity); i++){
    //     // console.log('sending...')
    //     await sendNoteOverBle(bluetooth, notes[i].type, notes[i].data[0], notes[i].data[1], notes[i].deltaTime)
    //     timeSum += notes[i].deltaTime
    // }
    
    let previousTimeSum = 0
    const patchShift = 100
    for (var k = 0; k < Math.ceil( notes.length / noteSendAfter); k++){
        timeSum = 0
        for (var i = k*noteSendAfter; i < min(k*noteSendAfter+noteSendAfter, notes.length); i++){
            await sendNoteOverBle(bluetooth, notes[i].type, notes[i].data[0], notes[i].data[1], notes[i].deltaTime)
        }
        for (var i = 0; i <  notes.length; i++){
            if (i > k*noteSendAfter-patchShift &&  i < k*noteSendAfter+noteSendAfter-patchShift){
                timeSum += notes[i].deltaTime
            }
        }
        if (k == 0){
            await sendNoteOverBle(bluetooth, 1, 0, 0, 0)
        }
        console.log("sent new packet. next packet is in ", timeSum, " secs")
        // await new Promise((res, rej) => {
        //     setTimeout(() => {
        //         res()
        //     }, timeSum)
        // })
        await delay(timeSum)
    }
}
async function sendNoteOverBle(bluetooth, type, note, velocity, deltaTime){
    const buffer = new Uint32Array([type, note, velocity, deltaTime]).buffer
    await bluetooth.midiCharacteristic.writeValue(buffer)
}
function convertDeltaTimeToStartTime(events){
    let res = []
    let noteOns = []
    let totalTime = 0

    for (var i = 0; i < events.length; i++){
        totalTime+=events[i].deltaTime
        if (events[i].type == 8){
            const similarNoteIndex = noteOns.findIndex(noteOn => noteOn.note == events[i].data[0])
            if (similarNoteIndex != -1){
                noteOns[similarNoteIndex].duration = totalTime-noteOns[similarNoteIndex].startTime
                res.push(noteOns[similarNoteIndex])
                noteOns.splice(similarNoteIndex,1) 
            } else {
                // error, this type of shit should not happen :(
            }
        } else if (events[i].type == 9){
            noteOns.push({note: events[i].data[0], velocity: events[i].data[1], startTime: totalTime})
        }
    }
    // in case there are notes that are pressed and not released
    // they will be released in 1 second 
    const unreleasedNoteDuration = 1000
    noteOns.forEach(noteOn => {
        res.push({...noteOn, duration: unreleasedNoteDuration})
    })
    return res
}
function limitNoteDuration(notes, limit){
    // this function is needed to prevent solenoids from overheating
    // limit is in milliseconds

    return notes.map(note => {
        if (note.duration > limit){
            return {...note, duration: limit}
        }
        return note
    })
}

function convertStartTimeToDeltaTime(notes){
    const noteOnOffs = []
    notes.forEach(note => {
      const noteOff = {...note, startTime: note.startTime + note.duration, velocity:0}
      noteOnOffs.push(note)
      noteOnOffs.push(noteOff)
    });
    const sortedByStartTime = noteOnOffs.sort((a, b) => a.startTime - b.startTime)
    const noteEvents = sortedByStartTime.map((note, index) => {
      const deltaTime = index != 0 ? note.startTime - sortedByStartTime[index-1].startTime : note.startTime
      const type = note.velocity == 0 ? 8 : 9
      return {data: [note.note, note.velocity], type: type, deltaTime: deltaTime}
    //   return {pitch: note.pitchMidi, type: type, velocity: Math.floor(velocity), deltaTime: Math.floor(deltaTimeSeconds*1000)}
    })
    return noteEvents
}

function NotePressEndIndex(index, noteEvents){
    let totalDuration = 0
    for (var i = index+1; i < noteEvents.length; i++){
        totalDuration += noteEvents[i].deltaTime
        if (noteEvents[i].data[0] == noteEvents[index].data[0]){
            return [i, totalDuration]
        }
    }
    return [-1, 0]
}
function rescursiveAudioPlay(index, notes, timeScale, bluetooth){
    const timeoutId = setTimeout(async () => {
        clearTimeout(timeoutId)
        if (index != notes.length-1) {    
            const midiEvent = {
                type: notes[index].type == 9 ? 0x90 : 0x80, 
                note: notes[index].pitch, 
                channel:1, 
                velocity: notes[index].velocity
            }               
            await sendPacket(bluetooth, midiEvent)
            rescursiveAudioPlay(index+1, notes, timeScale, bluetooth)
        }
    }, notes[index].deltaTime*timeScale)
}
export function AudioPlay(bluetooth, audioData){
    const timing = 1 // time scale factor
    rescursiveAudioPlay(0,audioData, timing, bluetooth)
    // const onlyNoteOnOffevents = events.filter(item => item.type == 8 || item.type == 9)
    // rescursivePlay(0, audioData, timing, bluetooth)
}
// export default function MidiSender(){
//     const [bluetooth, setBluetooth] = useState()
//     const [midi, setMidi] = useState()
//     useEffect(() =>{
//         initMidi() 
//     },[])
//     const initMidi = () => {
//         const channel = 1
//         const velocity = 100
//         setMidi({channel, velocity})
//     }
//     const handleConnect = async () => {
//         try {
//             const device = await navigator.bluetooth.requestDevice({
//               filters: [{name: "MIDI device"}],
//               optionalServices: ['03b80e5a-ede8-4b33-a751-6ce34ec4c700'],
//             });
//             const server = await device.gatt.connect();
//             const service = await server.getPrimaryService(MIDI_SERVICE_UUID);
//             const midiCharacteristic = await service.getCharacteristic(MIDI_CHARACTERISTIC_UUID);
//             setBluetooth ({device, server, service, midiCharacteristic})
//         } catch (error) {
//             console.error('Bluetooth connection error:', error);
//             // return
//         }
//     }
//     const getTimestampBytes = () => {
//         const d = Date.now().toString(2).split('').reverse();
//         const byte0 = ['1', '0', d[12], d[11], d[10], d[9], d[8], d[7]];
//         const byte1 = ['1', d[6], d[5], d[4], d[3], d[2], d[1], d[0]];
//         return {
//           header: parseInt(byte0.join(''), 2),
//           messageTimestamp: parseInt(byte1.join(''), 2)
//         };
//     };
    
//     const sendPacket = async (note, type) => {
//         const characteristic = bluetooth.midiCharacteristic;
//         if (!characteristic) {
//           return Promise.resolve('Cannot send packet without characteristic');
//         }
//         const channel = midi.channel;
//         const velocity = midi.velocity;
//         const { header, messageTimestamp } = getTimestampBytes();
//         const midiStatus = channel & 0x0f | type;
//         const midiOne = note & 0x7f;
//         const midiTwo = velocity & 0x7f;
//         const packet = new Uint8Array([
//           header,
//           messageTimestamp,
//           midiStatus,
//           midiOne,
//           midiTwo
//         ]);
//         return await bluetooth.midiCharacteristic.writeValue(packet)
//       };
//     const handleSend = () => {
//         sendPacket(20, 0x90)
//     }
//     const [midiData, setMidiData] = useState(null);

//     const handleFileChange = (event) => {
//         const fileInput = event.target;
//         const file = fileInput.files[0];
    
//         if (file) {
//           const reader = new FileReader();
//           reader.onload = (e) => {
//             const midiArrayBuffer = new Uint8Array(e.target.result);
//             const parsedData  = MidiParser.parse(midiArrayBuffer);
//             setMidiData(parsedData);
            
//           };
//           reader.readAsArrayBuffer(file);
//         }
//     };
//     const rescursivePlay = (index, events, timeScale) => {
//         const timeoutId = setTimeout(async () => {
//             clearTimeout(timeoutId)
//             if (index != events.length-1) {                   
//                 await sendPacket(events[index].data[0], events[index].type == 9 ? 0x90 : 0x80)
//                 // console.log('Sent the note: ', events[index].data[0], ' with the result: ', res)
//                 rescursivePlay(index+1, events, timeScale)
//             }
//         }, events[index].deltaTime*timeScale)
        
//     }
//     const startMidiPlay = () => {
//         const events = midiData.track[0].event
//         const timing = 1 // time scale factor ??? 
//         const onlyNoteOnOffevents = events.filter(item => item.type == 8 || item.type == 9)
//         rescursivePlay(0, onlyNoteOnOffevents, timing)
//     }
//     return (
//     <div>
//         <button onClick={handleConnect}>Connect</button>
//         <button onClick={handleSend}>Send Midi</button>
//         <button onClick={startMidiPlay}>Start playing midi file</button>
//         <div>
//             <input type="file" onChange={handleFileChange} accept=".midi, .mid" />
//             {midiData && (
//                 <div>
//                     <h3>Parsed MIDI Data:</h3>
//                     <pre>{JSON.stringify(midiData, null, 2)}</pre>
//                 </div>
//             )}
//         </div>
//     </div>
//     )
// }
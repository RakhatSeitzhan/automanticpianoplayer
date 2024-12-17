function filterByEventType(events){
    let res = []
    events.forEach(event => {
        // if (event.type == 8 || event.type == 9 || event.type == 11 || event.type == 12) res.push(event)
        if (event.type == 8 || event.type == 9) res.push(event)
    })
    return res
}
const filterPlayableNotes = (events) => {
    // midi note numbers range from 0-127
    // while piano can only play from 21-108
    let res = []
    for(var i = 0; i < events.length; i++){
        if (events[i].type == 8 || events[i].type == 9){
            if (events[i].data[0] >= 21 && events[i].data[0] <= 108){
                res.push({...events[i], data: [events[i].data[0]-21, events[i].data[1]]})
            }
        } else {
            res.push(events[i])
        }
    }
    return res
}
export function processMidiData(data){
    const noteDurationLimit = 2000
    const midiData = applyTempo(data)
    // const midiData = data
    const tempo = midiData.timeDivision
    // const events = extractEvents(midiData)
    let events = []
    let totalTime = 0
    midiData.track.map(track => {
        const [converted, time] = convertToStartTimeFormat(track.event)
        totalTime+=time
        events.push(...converted)
    })
    const filtered = filterByEventType(covertZeroVelToReleaseType(events))
    
    const resp = accountResponseTime(fixNoteRepetition(filtered))
    const pedalAddedEvents = addPedalEvents(resp, totalTime, tempo, midiData)
    const limited = limitNoteDuration(pedalAddedEvents, noteDurationLimit)
    const sordtedByStartTime = limited.sort((a, b) => a.startTime - b.startTime)
    const eventsToSend = filterPlayableNotes(convetToDeltaFormat(sordtedByStartTime)) 
    return [eventsToSend, totalTime, sordtedByStartTime]
}
const covertZeroVelToReleaseType = (events) => {
    // in some midi files key release 
    // events are sent as 0 velocity with type 9 events
    return events.map( event => {
        if (event.type == 9 && event.data[1] == 0){
            return {...event, type: 8}
        } else {
            return event
        }  
    })
    
}
// function parseTempo(data) {
//     // Extract 3 bytes from the integer data
//     const byte1 = (data >> 16) & 0xFF;
//     const byte2 = (data >> 8) & 0xFF;
//     const byte3 = data & 0xFF;
//     // Tempo is a 3-byte value
//     return (byte1 << 16) + (byte2 << 8) + byte3;
// }
function ticksToMilliseconds(ticks, ticksPerQuarterNote, tempo) {
    return (ticks * tempo) / (ticksPerQuarterNote * 1000);
}
const applyTempo = (midiData) => {
    let tempo = 500000;
    let res = structuredClone(midiData)
    let ticksPerQuarterNote = midiData.timeDivision;
    res.track.forEach(track => {
        track.event.forEach(event => {
            if (event.metaType == 81){
                tempo = event.data
            } 
            event.deltaTime = ticksToMilliseconds(event.deltaTime, ticksPerQuarterNote, tempo);
        })
    });
    return res
}
const fixNoteRepetition = (events) => {
    // sometimes when a key is not released
    // a new note press event is fired
    // this might be because of the merged tracks
    let res = [...events]
    let noteOns = []
    for(var i = 0; i < events.length; i++){
        if (events[i].type == 9){
            noteOns.push(events[i].data[0])
            const id = noteOns.findIndex(i => i == events[i].data[0])
            // if there is the same note in note ons,
            // it means that the note on event is repeated
            // without the relase event
            if (id != -1) {
                console.log('repetition!')
                res.push({...events[i], type: 8, data: [events[i].data[0], 0], startTime: events[i].startTime-1})
            }
        } else if (events[i].type == 8){
            const id = noteOns.findIndex(i => i == events[i].data[0])
            if (id != -1) noteOns.splice(id,1)
        }
    }
    return res
}
const accountResponseTime = (events) => {
    const PRESS_TIME = 10 //ms
    const RELESASE_TIME = 15+PRESS_TIME //ms
    let dict = []
    for (var i = 0; i < events.length-1; i++){
        const {type, startTime, data} = events[i]
        const [note, velocity] = data
        const indexInDict = dict.findIndex(item => item.note == note)
        if (indexInDict == -1){
            dict.push({note: note, events: [{type: type, startTime: startTime, note: note, velocity: velocity}]})
        } else {
            dict[indexInDict].events.push({type: type, startTime: startTime, note: note, velocity: velocity})
        }
    }
    let dict2 = [...dict]
    dict.forEach((item, itemIndex) => {
        for (var i = 0; i < item.events.length-1; i++){
            if (item.events[i].type == 8){
                let k = i+1
                while (true){
                    if (item.events[k].type == 9){
                        if (item.events[k].startTime - item.events[i].startTime < RELESASE_TIME){
                            const correctionTime =  RELESASE_TIME - (item.events[k].startTime - item.events[i].startTime)
                            dict2[itemIndex].events[i].startTime = item.events[i].startTime - correctionTime
                        }
                        break
                    }
                    k++
                    if (k >= item.events.length) break
                }
            }
        }
        
    })
    let res = []
    dict2.forEach(item => {
        res.push(...item.events.map(event => ({type: event.type, startTime: event.startTime, data: [event.note, event.velocity]})))
    })
    return res
}
const addPedalEvents = (eventsConverted, totalTime, tempo, midiData) => {

    const pedalPressInterval = tempo * 4
    const pedalPressEventType = 12
    const pedalReleaseEventType = 11
    const pedalReleaseDuration = 200

    let res = [...eventsConverted]
    const numOfPeadlPresses = Math.floor(totalTime / pedalPressInterval)
    for (var i = 0; i < numOfPeadlPresses; i++){
        const pedalPressStartTime = i * pedalPressInterval
        // adding release event
        res.push({type: pedalReleaseEventType, startTime: pedalPressStartTime, data: [0, 0]})
        // adding press event after pedalReleaseDuration
        res.push({type: pedalPressEventType, startTime: pedalPressStartTime + pedalReleaseDuration, data: [0, 0]})
    }
    return res
}
function convertToStartTimeFormat(events){
    let res = []
    let totalTime = 0
    for (var i = 0; i < events.length; i++){
        totalTime+=events[i].deltaTime
        res.push({type: events[i].type, data: events[i].data, startTime: totalTime})
    }
    return [res, totalTime]
}
function convetToDeltaFormat(events){
    return events.map((event, index) => {
        const deltaTime = index != 0 ? event.startTime - events[index-1].startTime : event.startTime
        return {data: event.data, type: event.type, deltaTime: deltaTime}
    })
}

function limitNoteDuration(events, limit){
    let noteOns = [] // keeps track of press events that are not released
    let res = [...events]
    for (var i = 0; i < events.length; i++){
        if (events[i].type == 8){
            // console.log(noteOns)
            const similarNoteIndex = noteOns.findIndex(item => item.event.data[0] == events[i].data[0])
            if (similarNoteIndex != -1){
                // calculating time difference between press and release events of same notes
                const delta = events[i].startTime - noteOns[similarNoteIndex].event.startTime
                if (delta > limit){
                    res[i].startTime = noteOns[similarNoteIndex].event.startTime + limit
                }
                noteOns.splice(similarNoteIndex,1) 
            } else {
                // error, this type of shit should not happen :(
            }
        } else if (events[i].type == 9){
            noteOns.push({index: i, event: events[i]})
        } 
    }
    return res
}
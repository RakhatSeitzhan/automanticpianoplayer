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
        } else {
            res.push({})
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
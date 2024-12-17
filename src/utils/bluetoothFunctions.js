export async function connectBluetooth(MIDI_SERVICE_UUID, MIDI_CHARACTERISTIC_UUID){
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

export async function sendNoteOverBle(bluetooth, type, note, velocity, deltaTime){
    const buffer = new Uint32Array([type, note, velocity, deltaTime]).buffer
    await bluetooth.midiCharacteristic.writeValue(buffer)
}
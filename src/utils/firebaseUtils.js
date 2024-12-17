import { ref, getStorage, getBytes} from 'firebase/storage'

function getStorageFileBytes(src){
    const storage = getStorage();
    const fileRef = ref(storage, src)
    return getBytes(fileRef)
}

export { getStorageFileBytes }
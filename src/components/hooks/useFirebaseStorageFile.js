import React, { useEffect, useState } from 'react'
import { db } from '../../firerbase'
import { getDownloadURL, ref, getStorage } from 'firebase/storage'

function useFirebaseStorageFile(){
    const [ loadState, setLoadState ] = useState(false)
    const [ loadedData, setLoadedData ] = useState()
    const loadPicFile = (song) => {
        const storage = getStorage();
        const fileRef = ref(storage, 'coverpics/'+song.title+'-'+song.artist+'.jpg')
        return getDownloadURL(fileRef)
    }  
    useEffect(() => {

    }, [])

    return [ loadedData, loadState ]
}
export { useFirebaseStorageFile }

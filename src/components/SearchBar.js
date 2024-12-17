import React from 'react'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

function SearchBar({ setFilter }) {

    return (
        <div className='flex w p-2 bg-gray-100 gap-x-2 rounded-lg items-center content-center'>
            <SearchRoundedIcon/>
            <input onChange={e => setFilter(state=> ({...state, text: e.target.value}))} placeholder='Search' className='border-none bg-gray-100 outline-none' />
        </div>
    )
}

export default SearchBar

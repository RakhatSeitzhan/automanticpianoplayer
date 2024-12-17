import React, { useContext } from 'react'
import { CurrentItemContext, DispatchContext } from './Carousel'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
function CarouselNavigation({ children }) {
    const current = useContext(CurrentItemContext);
    const dispatch = useContext(DispatchContext)
    const handleChange = (e, newValue) => {
        if (newValue != null)
            dispatch({value: newValue, type: 'CHANGE'})
    }
    return (
        <ToggleButtonGroup
            value={current}
            exclusive
            onChange={handleChange}
            aria-label="text alignment"
        >
            {children.map((element, index) => {
                return <ToggleButton value = {index}>{element}</ToggleButton>
            })}
        </ToggleButtonGroup>
    )
}

export default CarouselNavigation

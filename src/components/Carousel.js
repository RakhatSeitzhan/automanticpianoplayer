import React, { createContext, useEffect, useReducer } from 'react'


const CurrentItemContext = createContext();
const DispatchContext = createContext();

function reducer(state, action){
    if (action.type == 'CHANGE'){
        return action.value 
    } else if (action.type == 'INCREMENT'){
        if (state + 1 == action.maxValue) return 0
        else return state + 1 
    } else {
        new Error('There is no such action type!')
    }
}

function Carousel({ children, ...props}) {
    const [ current, dispatch ] = useReducer (reducer, 0);
    const intervalDuration = props.interval | 4000
    const container = React.Children.toArray(children).find(
        (child) => child.type && child.type.name === 'CarouselContainer'
    );
    const carouselItems = container ? React.Children.toArray(container.props.children) : [];
    const numberOfItems = carouselItems.length;

    useEffect(() => {
        let interval 
        if (props.autoplay){
            interval = setInterval(() => {
                dispatch({type: 'INCREMENT', maxValue: numberOfItems})
            }, intervalDuration)
        }
        return () => {
            if (props.autoplay) clearInterval(interval)
        }
    }, [])
    
    
    return (
        <CurrentItemContext.Provider value = {current}>
            <DispatchContext.Provider value = {dispatch}>
                <div className={props.className}>
                    {children}
                </div>
            </DispatchContext.Provider>
        </CurrentItemContext.Provider>
    )
}


export {Carousel, CurrentItemContext, DispatchContext}

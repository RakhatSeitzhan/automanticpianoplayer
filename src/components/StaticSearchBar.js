import React from 'react'
import KeyboardIcon from '@mui/icons-material/Keyboard';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MuiAccordion from '@mui/material/Accordion';
// import AccordionActions from '@mui/material/AccordionActions';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { styled } from '@mui/material/styles';
const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
  ))(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    '&::before': {
      display: 'none',
    },
  }));
  const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
      expandIcon={<ExpandMoreIcon sx={{ fontSize: '0.9rem' }} />}
      {...props}
    />
  ))(() => ({
    backgroundColor: 'rgb(255, 255, 255)',
    // '& .MuiAccordionSummary-content': {
    //   marginLeft: theme.spacing(1),
    // },
  }));
  
  const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    // padding: theme.spacing(2),
  }));
function StaticSearchBar() {
    const iconStyle = {
        width: 32,
        height: 32
    }
  return (
    <div>
        <div className='flex content-center shadow-lg border border-gray-50 px-7 py-3 rounded-full'>
            <span className='grow font-medium'>
                automatic piano player buy
            </span>
            <span className='mr-2'>
                <ClearIcon iconStyle={iconStyle}/>
            </span>
           
            <div className='flex gap-2 border-l border-gray-300 pl-3'>
                <KeyboardIcon iconStyle={iconStyle}/>
                <span className='w-7'>
                    <svg class="goxjub" focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#4285f4" d="m12 15c1.66 0 3-1.31 3-2.97v-7.02c0-1.66-1.34-3.01-3-3.01s-3 1.34-3 3.01v7.02c0 1.66 1.34 2.97 3 2.97z"></path><path fill="#34a853" d="m11 18.08h2v3.92h-2z"></path><path fill="#fbbc05" d="m7.05 16.87c-1.27-1.33-2.05-2.83-2.05-4.87h2c0 1.45 0.56 2.42 1.47 3.38v0.32l-1.15 1.18z"></path><path fill="#ea4335" d="m12 16.93a4.97 5.25 0 0 1 -3.54 -1.55l-1.41 1.49c1.26 1.34 3.02 2.13 4.95 2.13 3.87 0 6.99-2.92 6.99-7h-1.99c0 2.92-2.24 4.93-5 4.93z"></path></svg>
                </span>
                <span className='w-7'>
                    <svg class="Gdd5U" focusable="false" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="192" width="192"></rect><g><circle fill="#34a853" cx="144.07" cy="144" r="16"></circle><circle fill="#4285f4" cx="96.07" cy="104" r="24"></circle><path fill="#ea4335" d="M24,135.2c0,18.11,14.69,32.8,32.8,32.8H96v-16l-40.1-0.1c-8.8,0-15.9-8.19-15.9-17.9v-18H24V135.2z"></path><path fill="#fbbc05" d="M168,72.8c0-18.11-14.69-32.8-32.8-32.8H116l20,16c8.8,0,16,8.29,16,18v30h16V72.8z"></path><path fill="#4285f4" d="M112,24l-32,0L68,40H56.8C38.69,40,24,54.69,24,72.8V92h16V74c0-9.71,7.2-18,16-18h80L112,24z"></path></g></svg>
                </span>
                <span className='text-blue-500'>
                    <SearchIcon iconStyle={iconStyle}/>
                </span>
            </div>
            
        </div>
        
        <h1 className='text-xl text-gray-700 mt-8 mb-4'>Questions on <MoreVertIcon/></h1>
        <Accordion>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
            >
                How much does it cost to install an automatic playing piano?
            </AccordionSummary>
            <AccordionDetails>
                What do self-playing piano systems cost? The cost of self-playing system installation is 
                <span className="bg-blue-100">$15,500 on compatible Blüthner grand piano and baby grand piano models </span>
                (also select uprights). Whatever self-playing bundle you decide on will include an iPad with all the necessary apps.
            </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2-content"
            id="panel2-header"
            >
                How much does a player piano system cost?
            </AccordionSummary>
            <AccordionDetails>
                A full conversion of an acoustic piano to a player piano <span className="bg-blue-100">usually costs between $6,000–$7,000.</span> If you already have a player piano and just want to get the PNOmation 
                upgrade to give it wireless capability, then that is about $2,800.
            </AccordionDetails>
        </Accordion>


    </div>
  )
}

export default StaticSearchBar

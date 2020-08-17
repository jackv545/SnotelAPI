import React, { useState, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { Tooltip, IconButton, CssBaseline } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Brightness4, BrightnessHigh } from '@material-ui/icons';

import Routes from './components/Routes'

function App() {
    const [prefersDarkMode, setPrefersDarkMode] = useState(
        window.matchMedia("(prefers-color-scheme: dark)").matches
    );
    const buttonRef = useRef(null);

    const theme = createMuiTheme({
        palette: {
            type: prefersDarkMode ? 'dark' : 'light',
            background: {
                paper: prefersDarkMode ? '#212121' : '#fff',
                default: prefersDarkMode ? '#121212' : '#eeeeee'
            },
            primary: {
                light: '#3A5674',
                main: '#293d52',
                contrastText: '#fff'
            },
            secondary: {
                main: prefersDarkMode ? '#2196f3' : '#E57700',
                contrastText: '#fff'
            }
        }
    });

    const darkModeButton = (
        <Tooltip
            title="Toggle light/dark theme"
            aria-label="toggle light/dark theme" leaveDelay={100}
        >
            <IconButton color="inherit" ref={buttonRef}
                onClick={() => setPrefersDarkMode(prefersDarkMode =>
                    !prefersDarkMode)}
            >
                {prefersDarkMode ? <BrightnessHigh /> : <Brightness4 />}
            </IconButton>
        </Tooltip>
    );

    const setDarkModeFocus = () => {
        buttonRef.current.focus();
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes
                    prefersDarkMode={prefersDarkMode}
                    darkModeButton={darkModeButton}
                    setDarkModeFocus={setDarkModeFocus}
                />
            </Router>
        </ThemeProvider>
    );
}

export default App;

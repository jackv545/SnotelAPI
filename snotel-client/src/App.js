import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { Tooltip, IconButton, CssBaseline } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Brightness4, BrightnessHigh } from '@material-ui/icons';

import Snotel from './components/Snotel'

function App() {
    const [prefersDarkMode, setPrefersDarkMode] = useState(false);

    const theme = createMuiTheme({
        palette: {
            type: prefersDarkMode ? 'dark' : 'light',
            background: {
                default: prefersDarkMode ? '#757575' : '#eeeeee'
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
            <IconButton color="inherit"
                onClick={() => setPrefersDarkMode(prefersDarkMode =>
                    !prefersDarkMode)}
            >
                {prefersDarkMode ? <BrightnessHigh /> : <Brightness4 />}
            </IconButton>
        </Tooltip>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Snotel
                    prefersDarkMode={prefersDarkMode}
                    darkModeButton={darkModeButton}
                />
            </Router>
        </ThemeProvider>
    );
}

export default App;

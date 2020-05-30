import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Tooltip, IconButton, CssBaseline } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Brightness4, BrightnessHigh } from '@material-ui/icons';


import Navigation from './components/Navigation';
import Home from './components/Home';
import { sendServerRequestWithBody } from './api/restfulAPI';
import WorldMap from './components/WorldMap';

function App() {
    const [selectedStation, setSelectedStation] = useState(null);
    const [stations, setStations] = useState([]);

    const [prefersDarkMode, setPrefersDarkMode] = useState(true);

    useEffect(() => {
        sendServerRequestWithBody({requestType: 'stations', requestVersion: 1})
        .then((response => {
            if (response.statusCode >= 200 && response.statusCode <= 299) {
                setStations(response.body.stations)
            } else {
                console.error("Response code: ", response.statusCode, response.statusText);
            }
        }));
    }, []);

    const theme = createMuiTheme({
        palette: {
            type: prefersDarkMode ? 'dark' : 'light',
            background: {
                default: prefersDarkMode ? '#757575' : '#eeeeee'
            },
            primary: {
                main: '#90caf9'
            },
            secondary: {
                main: prefersDarkMode ? '#2196f3' : '#0d47a1'
            }
        }
    });

    const darkModeButton = (
        <Tooltip title="Toggle light/dark theme" aria-label="toggle light/dark theme" leaveDelay={100}>
            <IconButton color="inherit" onClick={() => setPrefersDarkMode(prefersDarkMode => !prefersDarkMode)}>
                {prefersDarkMode ? <BrightnessHigh /> : <Brightness4 />}
            </IconButton>
        </Tooltip>
    )

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Navigation
                    prefersDarkMode={prefersDarkMode} darkModeButton={darkModeButton}
                    selectedStation={selectedStation} setSelectedStation={setSelectedStation}
                    stations={stations} theme={theme}
                />
                <Switch>
                    <Route path="/worldMap">
                        <WorldMap prefersDarkMode={prefersDarkMode}/>
                    </Route>
                    <Route path="/">
                        <Home 
                            theme={theme} prefersDarkMode={prefersDarkMode}
                            selectedStation={selectedStation}
                            setSelectedStation={setSelectedStation}
                        />
                    </Route>
                </Switch>
            </Router>
        </ThemeProvider>
    );
}

export default App;

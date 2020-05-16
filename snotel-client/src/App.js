import React, { useState } from 'react';

import { Container, Tooltip, IconButton, CssBaseline, Grid } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Brightness4, BrightnessHigh } from '@material-ui/icons';


import Navigation from './components/Navigation';
import Menu from './components/Menu';
import TopSnowPack from './components/TopSnowPack';

function App() {
  const [prefersDarkMode, setPrefersDarkMode] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

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
          {prefersDarkMode ? <BrightnessHigh/> : <Brightness4/>}
        </IconButton>
    </Tooltip>
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Navigation 
        prefersDarkMode={prefersDarkMode} darkModeButton={darkModeButton}
        selectedStation={selectedStation} setSelectedStation={setSelectedStation}
      />
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Menu theme={theme}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TopSnowPack theme={theme}/>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;

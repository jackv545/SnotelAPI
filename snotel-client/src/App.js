import React, { useState } from 'react';

import { Container, Tooltip, IconButton, CssBaseline } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Brightness4, BrightnessHigh } from '@material-ui/icons';

import Navigation from './components/Navigation';

function App() {
  const [prefersDarkMode, setPrefersDarkMode] = useState(true);

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
      <Container maxWidth="md">
        <Navigation prefersDarkMode={prefersDarkMode} darkModeButton={darkModeButton}/>
      </Container>
    </ThemeProvider>
  );
}

export default App;

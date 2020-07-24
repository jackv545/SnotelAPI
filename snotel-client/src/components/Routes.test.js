import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Routes from './Routes';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

test('component renders with generic theme', () => {
    render(
        <ThemeProvider theme={createMuiTheme()}>
            <MemoryRouter>
                <Routes/>
            </MemoryRouter>
        </ThemeProvider>
    );
});

test('page not found message appears if given bad route', () => {
    const { getByText } = render(
        <ThemeProvider theme={createMuiTheme()}>
            <MemoryRouter initialEntries={["/bad-route"]}>
                <Routes/>
            </MemoryRouter>
        </ThemeProvider>
    );
    expect(getByText('This page could not be found.')).toBeInTheDocument();
});

import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import StateInfo from './StateInfo';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

test('component renders a switch to map button', () => {
    const { getByText } = render(
        <ThemeProvider theme={createMuiTheme()}>
            <MemoryRouter>
                <StateInfo/>
            </MemoryRouter>
        </ThemeProvider>
    );

    expect(getByText('Switch to Map')).toBeInTheDocument();
});

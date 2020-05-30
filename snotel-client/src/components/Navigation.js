import React from 'react';

import { AppBar, Toolbar, Grid, TextField } from '@material-ui/core';
import { AcUnit } from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/styles';

import LinkButton from '../utils/LinkButton';

const useStyles = makeStyles({
    homeButton: {
        textTransform: 'none'
    },
    noHover: props => ({
        '&:hover': {
            backgroundColor: props.prefersDarkMode ? props.theme.palette.background.paper
                : props.theme.palette.primary.main
        }
    })
})

export default function Navigation(props) {
    const search = (
        <Autocomplete
            options={props.stations}
            getOptionLabel={(station) => station.name}
            value={props.selectedStation}
            onChange={(event, newValue) => {
                props.setSelectedStation(newValue)
            }}
            style={{ width: 300 }}
            renderInput={(params) => <TextField {...params} color="secondary"
                placeholder="Search for a Mountain" variant="outlined" />}
        />
    );

    const classes = useStyles(props);

    return (
        <AppBar position="static" color={props.prefersDarkMode ? "inherit" : "primary"}>
            <Toolbar>
                <Grid container justify="space-between" alignItems="center">
                    <Grid item>
                        <LinkButton 
                            to="/" size="large" startIcon={<AcUnit />} disableRipple
                            classes={{ label: classes.homeButton, root: classes.noHover }}
                        >
                            Snotel
                        </LinkButton>
                    </Grid>
                    <Grid item>
                        {search}
                    </Grid>
                    <Grid item>
                        {props.darkModeButton}
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar>
    );
}

import React, { useState, useEffect } from 'react';

import { AppBar, Toolbar, Grid, Typography, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { sendServerRequestWithBody } from '../api/restfulAPI';

export default function Navigation(props) {
    const [stations, setStations] = useState([]);

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

    const search = (
        <Autocomplete
            options={stations}
            getOptionLabel={(station) => station.name}
            value={props.selectedStation}
            onChange={(event, newValue) => {
                props.setSelectedStation(newValue)
            }}
            style={{ width: 300 }}
            renderInput={(params) => <TextField {...params} color="secondary" 
            placeholder="Search for a Mountain" variant="outlined"/>}
        />
    );

    return(
        <AppBar position="static" color={props.prefersDarkMode ? "inherit" : "primary"}>
            <Toolbar>
                <Grid container justify="space-between" alignItems="center">
                    <Grid item>
                        <Typography variant="h6">
                            Snotel
                        </Typography>
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

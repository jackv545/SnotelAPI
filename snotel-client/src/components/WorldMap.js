import React, { useState, useEffect } from 'react';

import { Container, Grid, Collapse, Paper, Typography, IconButton } 
    from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';
import { Close } from '@material-ui/icons';

import StationMap from './StationMap';
import { sendServerRequestWithBody } from '../api/restfulAPI';
import LinkButton from '../utils/LinkButton';

const useStyles = makeStyles((theme) => ({
    markerInfo: {
        padding: theme.spacing(1),
        marginTop: theme.spacing(1)
    }
}));

export default function WorldMap(props) {
    const [stations, setStations] = useState([]);
    const [stationSelected, setStationSelected] = useState(false);
    const [selectedStationMarker, setSelectedStationMarker] = useState(null);

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

    const deselectStation = () => {
        setStationSelected(false);
        setSelectedStationMarker(null);
    }

    const classes = useStyles();

    const stationNameAndLocation = (
        <Typography>
            {selectedStationMarker === null
            ? <Skeleton width="15ch"/> 
            : `${selectedStationMarker.name}, ${selectedStationMarker.state}`}
        </Typography>
    );

    const stationLatLng = (
        <Typography variant="body2">
            {selectedStationMarker === null 
            ? <Skeleton width="15ch"/>
            : `(${selectedStationMarker.lat}, ${selectedStationMarker.lng})`}
        </Typography>
    );

    const markerInfo = (
        <Grid container direction="column" spacing={1}>
            <Grid item>
                {stationNameAndLocation}
            </Grid>
            <Grid item>
                {stationLatLng}
            </Grid>
            <Grid item>
                <LinkButton 
                    // onClick={() => props.setSelectedStation(selectedStationMarker)}
                    variant="contained" color="secondary" 
                    to={`/${selectedStationMarker ? selectedStationMarker.urlName : ''}`}
                >
                    Snow Report
                </LinkButton>
            </Grid>
        </Grid>
    );

    const markerCollapse = (
        <Collapse in={stationSelected}>
            <Paper className={classes.markerInfo}>
                <Grid container alignItems="flex-start" justify="space-between">
                    <Grid item>
                        {markerInfo}
                    </Grid>
                    <Grid item>
                        <IconButton onClick={deselectStation} size="small">
                            <Close/>
                        </IconButton>
                    </Grid>
                </Grid>
            </Paper>
        </Collapse>
    );
    
    return(
        <Container maxWidth="md">
            <StationMap 
                all stations={stations} prefersDarkMode={props.prefersDarkMode}
                setStationSelected={setStationSelected}
                selectedStationMarker={selectedStationMarker}
                setSelectedStationMarker={setSelectedStationMarker}
            />
            {markerCollapse}
        </Container>
    );
}
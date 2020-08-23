import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Container, Grid, Collapse, Paper, Typography, IconButton, Button } 
    from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';
import { Close } from '@material-ui/icons';

import StationMap from './StationMap';
import { sendServerRequest, sendServerRequestWithBody } from '../api/restfulAPI';
import StateSelect from './map/StateSelect';

const useStyles = makeStyles((theme) => ({
    markerInfo: {
        padding: theme.spacing(1),
        marginTop: theme.spacing(1)
    },
    mt2smUp: {
        [theme.breakpoints.up('sm')]: {
            marginTop: theme.spacing(2)
        }
    },
    mt3: {
        marginTop: theme.spacing(3)
    }
}));

export const SELECTED_STATE_DEFAULT = {key: 'all', name: 'All'};
const BOUNDS_DEFAULT = [[70.37, -164.29], [32.92, -103.79]];

export default function WorldMap(props) {
    const [stations, setStations] = useState([]);
    const [stateInfo, setStateInfo] = useState({});
    const [stationSelected, setStationSelected] = useState(false);
    const [selectedStationMarker, setSelectedStationMarker] = useState(null);
    const [bounds, setBounds] = useState(BOUNDS_DEFAULT);

    let urlParams = useParams();

    useEffect(() => {
        if(urlParams.state) {
            sendServerRequest(`state?state=${urlParams.state}&includeStationBounds=true`)
                .then((response => {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        setStateInfo(
                            (({ state, stateName }) => ({ state, stateName }))(response.body)
                        );
                        setBounds(response.body.stationBounds);
                    } else {
                        console.error("Response code: ", response.statusCode, response.statusText);
                    }
                })
            );
        } else {
            setStateInfo({
                state: SELECTED_STATE_DEFAULT.key,
                stateName: SELECTED_STATE_DEFAULT.name
            });
            setBounds(BOUNDS_DEFAULT);
        }

        const stationsHeader = { requestType: 'stations', requestVersion: 1 };
        const search = urlParams.state 
            ? { searchField: 'state', searchTerm: urlParams.state} : null;
        sendServerRequestWithBody({...stationsHeader, ...search})
            .then((response => {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    setStations(response.body.stations)
                } else {
                    console.error("Response code: ", response.statusCode, response.statusText);
                }
            })
        );
    }, [urlParams]);

    useEffect(() => {
        if(Object.keys(stateInfo).length > 0) {
            if(stateInfo.state !== SELECTED_STATE_DEFAULT.key) {
                document.title = `${stateInfo.stateName} Map | Snotel`;
            } else {
                document.title = 'World Map | Snotel';
            }
        } 
    }, [stateInfo]);

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
                <Button
                    variant="contained" color="secondary" 
                    component={Link} to={selectedStationMarker 
                        ? `/location/${selectedStationMarker.urlName}` : ''}
                >
                    Snow Report
                </Button>
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
        <Container maxWidth="lg">
            <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={3} className={classes.mt3}>
                    <StateSelect state={stateInfo.state}/>
                </Grid>
                <Grid item xs={12} sm={12} md={9} className={classes.mt2smUp}>
                    <StationMap 
                        all bounds={bounds}
                        stations={stations} prefersDarkMode={props.prefersDarkMode}
                        setStationSelected={setStationSelected}
                        selectedStationMarker={selectedStationMarker}
                        setSelectedStationMarker={setSelectedStationMarker}
                    />
                    {markerCollapse}
                </Grid>
            </Grid>
        </Container>
    );
}
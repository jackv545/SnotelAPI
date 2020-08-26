import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Container, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequest, sendServerRequestWithBody } from '../../api/restfulAPI';
import { VIEW_OPTION_KEYS, useQuery, ViewTabs } from '../margins/ViewTabs';
import StationMap from './StationMap';
import StateSelect from './StateSelect';

const useStyles = makeStyles((theme) => ({
    markerInfo: {
        padding: theme.spacing(1),
        marginTop: theme.spacing(1)
    },
    mt1: {
        marginTop: theme.spacing(1)
    },
    mt1mt2mdUp: {
        marginTop: theme.spacing(1),
        [theme.breakpoints.up('md')]: {
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
    const [selectedView, setSelectedView] = useState(null);

    let query = useQuery();

    //set selected view based on url search parameter
    useEffect(() => {
        if(query.get('tab')) {
            setSelectedView(query.get('tab'));
        } else if(!selectedView) {
            setSelectedView(VIEW_OPTION_KEYS[1]);
        }
    }, [query, selectedView]);

    const [state, setState] = useState('');
    const [stateName, setStateName] = useState('');
    const [region, setRegion] = useState(-1);
    const [bounds, setBounds] = useState(BOUNDS_DEFAULT);

    let urlParams = useParams();

    useEffect(() => {
        const boundsParameters = () => {
            const stations = `&includeStationBounds=${selectedView === VIEW_OPTION_KEYS[1]}`;
            const skiAreas = `&includeSkiAreaBounds=${selectedView === VIEW_OPTION_KEYS[0]}`;
            return `${stations}${skiAreas}`;
        }

        if(urlParams.state && selectedView) {
            sendServerRequest(`state?state=${urlParams.state}${boundsParameters()}`)
                .then((response => {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        setState(response.body.state);
                        setStateName(response.body.stateName);
                        setRegion(response.body.region);
                        if(selectedView === VIEW_OPTION_KEYS[0]) {
                            setBounds(response.body.skiAreaBounds);
                        } else if(selectedView === VIEW_OPTION_KEYS[1]) {
                            setBounds(response.body.stationBounds);
                        }
                    } else {
                        console.error("Response code: ", response.statusCode, response.statusText);
                    }
                })
            );
        } else if(!urlParams.state) {
            setState(SELECTED_STATE_DEFAULT.key);
            setStateName(SELECTED_STATE_DEFAULT.name);
            setRegion(0);
            setBounds(BOUNDS_DEFAULT);
        }
    }, [urlParams, selectedView]);

    //set document title
    useEffect(() => {
        if(stateName.length > 0) {
            if(state !== SELECTED_STATE_DEFAULT.key) {
                document.title = `${stateName} Map | Snotel`;
            } else {
                document.title = 'World Map | Snotel';
            }
        } 
    }, [state, stateName]);

    const [stations, setStations] = useState([]);

    useEffect(() => {
        const dependenciesSet = state.length > 0 && region > -1; //ensure request is only sent once

        if(selectedView === VIEW_OPTION_KEYS[0] && dependenciesSet) {
            sendServerRequest(region ? `skiAreas?region=${region}` : 'skiAreas')
                .then((response => {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        setStations(response.body.skiAreas)
                    } else {
                        console.error("Response code: ", response.statusCode, response.statusText);
                    }
                })
            );
        } else if (selectedView === VIEW_OPTION_KEYS[1] && dependenciesSet) {
            const stationsHeader = { requestType: 'stations', requestVersion: 1 };
            const search = state !== SELECTED_STATE_DEFAULT.key
                ? { searchField: 'state', searchTerm: state} : null;

            sendServerRequestWithBody({...stationsHeader, ...search})
                .then((response => {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        setStations(response.body.stations)
                    } else {
                        console.error("Response code: ", response.statusCode, response.statusText);
                    }
                })
            );
        }
        
    }, [selectedView, state, region]);

    const classes = useStyles();

    return(
        <Container maxWidth="lg">
            <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={3}>
                    <Grid container spacing={1} >
                        <ViewTabs variant="map" state={state} selectedView={selectedView}/>
                    </Grid>
                    <StateSelect state={state} className={classes.mt1mt2mdUp}/>
                </Grid>
                <Grid item xs={12} sm={12} md={9} className={classes.mt1}>
                    <StationMap 
                        all bounds={bounds}
                        stations={stations} prefersDarkMode={props.prefersDarkMode}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Container, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequest } from '../../api/restfulAPI';
import { VIEW_OPTION_KEYS, useQuery, ViewTabs } from '../margins/ViewTabs';
import StationMap from './StationMap';
import StateSelect from './StateSelect';
import ListButton from './ListButton';
import PageNotFound from '../margins/PageNotFound';

const useStyles = makeStyles((theme) => ({
    mt1: {
        marginTop: theme.spacing(1)
    },
    mt1mt2mdUp: {
        marginTop: theme.spacing(1),
        [theme.breakpoints.up('md')]: {
            marginTop: theme.spacing(2)
        }
    },
    mt2mdUp: {
        [theme.breakpoints.up('md')]: {
            marginTop: theme.spacing(2)
        }
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
        } else {
            setSelectedView(VIEW_OPTION_KEYS[0]);
        }
    }, [query]);

    const [state, setState] = useState('');
    const [bounds, setBounds] = useState(BOUNDS_DEFAULT);

    const setDefaultState = () => {
        setState(SELECTED_STATE_DEFAULT.key);
        setBounds(BOUNDS_DEFAULT);
        document.title = 'World Map | Snotel';
    }

    let urlParams = useParams();
    const [stateNotFound, setStateNotFound] = useState(false);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        if(selectedView) {
            const selectedState = urlParams.state ? urlParams.state : SELECTED_STATE_DEFAULT.key;
            sendServerRequest(`map/${selectedView}?state=${selectedState}`)
                .then((response => {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        setStateNotFound(false);
                        if(selectedState !== SELECTED_STATE_DEFAULT.key) {
                            setState(response.body.stateInfo.state);
                            setBounds(response.body.stateInfo.bounds);
                            document.title = `${response.body.stateInfo.stateName} Map | Snotel`;
                        } else {
                            setDefaultState();
                        }
                        setLocations(response.body.locations[
                            selectedView === VIEW_OPTION_KEYS[0] ? 'skiAreas' : 'stations'
                        ]);
                    } else {
                        setStateNotFound(true);
                    }
                })
            );
        }
    }, [selectedView, urlParams]);

    const classes = useStyles();

    return(
        <Container maxWidth="lg">
            {stateNotFound ? <PageNotFound/>
                : <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={3}>
                        <Grid container spacing={1} >
                            <ViewTabs variant="map" state={state} selectedView={selectedView}/>
                            <Grid item xs={6} sm={6} md={12}>
                                <StateSelect state={state} className={classes.mt2mdUp}/>
                            </Grid>
                            <Grid item xs={6} sm={6} md={12}>
                                <ListButton state={state} className={classes.mt2mdUp}/>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={12} md={9} className={classes.mt1}>
                        <StationMap 
                            all bounds={bounds}
                            stations={locations} prefersDarkMode={props.prefersDarkMode}
                        />
                    </Grid>
                </Grid>
            }
        </Container>
    );
}
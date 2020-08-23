import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Link, Grid, Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequestWithBody } from '../../api/restfulAPI';
import { commasInNumber } from '../../utils/NumberCommas';
import ListSkeleton from './ListSkeleton';

const useStyles = makeStyles((theme) => ({
    link: {
        fontWeight: 'bold',
        '&:hover': {
            textDecoration: 'none'
        }
    },
    mt2: {
        marginTop: theme.spacing(2)
    }
}));

export default function BackcountryStations(props) {
    useEffect(() => {
        if(props.stateName.length > 0) {
            document.title = `Backcountry | ${props.stateName} | Snotel`;
        }
        
    }, [props.stateName]);
    
    const [stations, setStations] = useState([]);

    //get stations from state url param
    useEffect(() => {
        let isMounted = true;
        
        const reqHeader = { requestType: 'stations', requestVersion: 1 };
        const search = { searchField: 'state', searchTerm: props.state };

        sendServerRequestWithBody({ ...reqHeader, ...search, orderBy: props.selectedSort })
            .then((response => {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    if (isMounted) {
                        setStations(response.body.stations);
                    }
                } else {
                    console.error("Response code: ", response.statusCode, response.statusText);
                }
            })
        );
        return () => { isMounted = false };
    }, [props.state, props.selectedSort]);

    const classes = useStyles();

    const stationInfo = (station) => (
        <Grid container spacing={1} className={classes.mt2}>
            {[station.snowDepth, station.elevation].map((value, i) => (
                <Grid 
                    item xs={12} key={i === 0 ? 'snowDepth' : 'elevation'}
                >
                    <Grid container>
                        <Grid item xs={6}>
                            <Typography variant="body2">
                                {`${i === 0 ? 'Snow Depth:' : 'Elevation:'}`}
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="body2">
                                {`${commasInNumber(value)}${i === 0 ? '"' : '\''}`}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            ))}
        </Grid>
    );
    
    return (
        <Grid container spacing={1}>
            {stations.length > 0 
            ? stations.map((station) => (
                <Grid item xs={12} sm={12} md={6} lg={4} key={station.urlName}>
                    <Card>
                        <CardContent>
                            <Link
                                component={RouterLink} className={classes.link}
                                to={`/location/${station.urlName}`} color="secondary"
                            >
                                {station.name}
                            </Link>
                            {stationInfo(station)}
                        </CardContent>
                    </Card>
                </Grid>
            ))
            : <ListSkeleton/>}
        </Grid>
    );
}

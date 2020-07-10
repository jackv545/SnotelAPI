import React, { useState, useEffect } from 'react';

import { Grid, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { Place, ChevronRight } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequestWithBody } from '../api/restfulAPI';
import LinkButton from '../utils/LinkButton';

const useStyles = makeStyles((theme) => ({
    label: {
        textTransform: 'none',
        justifyContent: 'left'
    },
    endIcon: {
        marginLeft: 'auto'
    },
    menuText: {
        marginTop: theme.spacing(3)
    }
}));

export default function TopSnowPack(props) {
    const classes = useStyles();

    const [topStations, setTopStations] = useState([]);

    useEffect(() => {
        sendServerRequestWithBody({requestType: 'stations', requestVersion: 1, limit: 5, orderBySnowdepth: true})
        .then((response => {
            if (response.statusCode >= 200 && response.statusCode <= 299) {
                setTopStations(response.body.stations);
            } else {
                console.error("Response code: ", response.statusCode, response.statusText);
            }
        }));
    }, []);

    const stationList = (
        topStations.map((station, i) => (
            <Grid item key={i.toString()} xs={12}>
                <LinkButton 
                    classes={{label: classes.label, endIcon: classes.endIcon}} 
                    color="secondary" fullWidth={true} variant="contained"  
                    startIcon={<Place/>} endIcon={<ChevronRight/>}
                    to={`/location/${station.urlName}`}
                >
                    {`${station.name} ${station.state} ${station.snowDepth}"`}
                </LinkButton>
            </Grid>
        ))
    );

    const listSkeleton = (
        [...Array(5)].map((val, i) => (
            <Grid item xs={12} key={i.toString()}>
                <Skeleton height={36}/>
            </Grid>
        ))
    );

    return(
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <Typography className={classes.menuText} variant="h6">
                    Top 5 Deepest Snowpack
                </Typography>
            </Grid>
            {topStations.length > 0 ? stationList : listSkeleton}
        </Grid>
    )
}

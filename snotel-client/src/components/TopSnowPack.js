import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Button, Grid, Typography, Chip } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { Place } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequest } from '../api/restfulAPI';

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
    },
    chip: {
        backgroundColor: theme.palette.type === 'light' 
            ? theme.palette.grey[400] : theme.palette.grey[700]
    }
}));

export default function TopSnowPack(props) {
    const classes = useStyles();

    const [topStations, setTopStations] = useState([]);

    useEffect(() => {
        sendServerRequest(`stations?limit=5&orderBy=snowDepth`)
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
                <Button 
                    classes={{ label: classes.label }} 
                    fullWidth={true} variant="outlined"
                    startIcon={<Place/>}
                    component={Link} to={`/location/${station.urlName}`}
                >
                    {`${station.name}, ${station.state}`}
                    <Chip 
                        className={classes.endIcon} size="small"
                        label={`${station.snowDepth}"`} classes={{ root: classes.chip }}
                    />
                </Button>
            </Grid>
        ))
    );

    const listSkeleton = (
        [...Array(5)].map((val, i) => (
            <Grid item xs={12} key={i.toString()}>
                <Skeleton variant="rect" height={36}/>
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

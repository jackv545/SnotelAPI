import React, { useState, useEffect } from 'react';

import { Button, Grid, Typography } from '@material-ui/core';
import { Place, ChevronRight } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequestWithBody } from '../api/restfulAPI';

const useStyles = makeStyles({
    label: {
        justifyContent: 'left'
    },
    endIcon: {
        marginLeft: 'auto'
    },
    menuText: props => ({
        marginTop: props.theme.spacing(1)
    })
})

export default function TopSnowPack(props) {
    const classes = useStyles(props);

    const [topStations, setTopStations] = useState([]);

    useEffect(() => {
        sendServerRequestWithBody('stations', {requestType: 'stations', requestVersion: 1, limit: 5, orderBySnowdepth: true})
        .then((response => {
            if (response.statusCode >= 200 && response.statusCode <= 299) {
                setTopStations(response.body.stations)
            } else {
                console.error("Response code: ", response.statusCode, response.statusText);
            }
        }));
    }, []);

    return(
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <Typography className={classes.menuText} variant="h6">
                    Top 5 Deepest Snowpack
                </Typography>
            </Grid>
            {topStations.map((station, i) => (
                <Grid item key={i} xs={12}>
                    <Button 
                        classes={{label: classes.label, endIcon: classes.endIcon}} color="secondary" 
                        fullWidth={true} variant="contained"  
                        startIcon={<Place/>} endIcon={<ChevronRight/>}
                    >
                        {`${station.name} ${station.snowdepth}"`}
                    </Button>
                </Grid>
            ))}
        </Grid>
    )
}

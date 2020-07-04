import React, { useState, useEffect } from 'react';

import { Container, Grid, Card, CardContent, CardActions, Button, Typography } 
    from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequest, sendServerRequestWithBody } from '../api/restfulAPI';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(1)
    },
    button: {
        textTransform: 'none'
    },
    info: {
        marginBottom: theme.spacing(2)
    }
}));

export default function States(props) {
    const [stateInfo, setStateInfo] = useState({});

    useEffect(() => {
        sendServerRequest('states')
        .then((response => {
            if (response.statusCode >= 200 && response.statusCode <= 299) {
                setStateInfo(response.body.states);
            } else {
                console.error("Response code: ", response.statusCode, response.statusText);
            }
        }));
    }, []);

      

    const onStationButtonClick = (name) => {
        const reqHeader = {requestType: 'stations', requestVersion: 1}  

        sendServerRequestWithBody({...reqHeader, searchField: 'name', searchTerm: name})
        .then((response => {
            if (response.statusCode >= 200 && response.statusCode <= 299) {
                props.setSelectedStation(response.body.stations[0]);
            } else {
                console.error("Response code: ", response.statusCode, response.statusText);
            }
        }));
    }

    const classes = useStyles();

    const stationButton = (name, snowDepth) => {
        return(
            snowDepth !== 0
            ? <Grid item>
                <Button 
                    className={classes.button} 
                    onClick={() => onStationButtonClick(name)}
                >
                    {name}
                </Button>
            </Grid>
            : null
        );
    };

    const cardHeader = (stateName) => {
        return(
            <Grid container justify="space-between" alignItems="stretch">
                <Grid item>
                    <Typography  className={classes.info}>
                        {stateName}
                    </Typography>
                </Grid>
                <Grid item>
                    <img src="" alt=""/>
                </Grid>
            </Grid>
        );
    }
    
    return(
        <Container maxWidth="md" className={classes.container}>
            <Grid container spacing={1}>
                {Object.keys(stateInfo).map((state) => (
                    <Grid item xs={12} sm={6} md={4} key={state}>
                        <Card className={classes.card}>
                            <CardContent>
                                {cardHeader(stateInfo[state].stateName)}
                                <Typography variant="caption">
                                    Top Snowpack
                                </Typography>
                                <Grid container justify="space-between" alignItems="center">
                                    <Grid item>
                                        <Typography variant="h5" component="h2">
                                            {`${stateInfo[state].snowDepth}"`}
                                        </Typography>
                                    </Grid>
                                    {stationButton(stateInfo[state].name, stateInfo[state].snowDepth)}
                                </Grid>
                            </CardContent>
                            <CardActions>
                                <Button className={classes.button} color="secondary">
                                    {`Compare ${stateInfo[state].count} Mountains`}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

import React, { useState, useEffect } from 'react';

import { Container, Grid, Card, CardContent, CardActions, Typography, Button } 
    from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequest } from '../api/restfulAPI';
import LinkButton from '../utils/LinkButton';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(1)
    },
    button: {
        textTransform: 'none'
    },
    media: {
        borderRadius: '3px'
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

    const classes = useStyles();

    const stationButton = (name, snowDepth, urlName) => {
        return(
            snowDepth > 0
            ? <Grid item>
                <LinkButton className={classes.button} to={`/${urlName}`}>
                    {name}
                </LinkButton>
            </Grid>
            : null
        );
    };

    const cardHeader = (state, stateName) => {
        return(
            <Grid container spacing={1} alignItems="stretch">
                <Grid item>
                    <img 
                        src={`https://raw.githubusercontent.com/jackv545/SnotelAPI/master/snotel-client/src/images/stateFlags/${state.toLowerCase()}.png`} 
                        alt="" className={classes.media}
                    />
                </Grid>
                <Grid item>
                    <Typography  className={classes.info}>
                        {stateName}
                    </Typography>
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
                                {cardHeader(state, stateInfo[state].stateName)}
                                <Typography variant="caption">
                                    Top Snowpack
                                </Typography>
                                <Grid container justify="space-between" alignItems="center">
                                    <Grid item>
                                        <Typography variant="h5" component="h2">
                                            {`${stateInfo[state].snowDepth}"`}
                                        </Typography>
                                    </Grid>
                                    {stationButton(
                                        stateInfo[state].name, stateInfo[state].snowDepth,
                                        stateInfo[state].urlName
                                    )}
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

import React, { useState, useEffect } from 'react';

import { Grid, Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequest } from '../../api/restfulAPI';
// import { commasInNumber } from '../../utils/NumberCommas';
import ListSkeleton from './ListSkeleton';

const useStyles = makeStyles((theme) => ({
    name: {
        fontWeight: 'bold'
    }
}));

export default function SkiAreas(props) {
    useEffect(() => {
        if(props.stateName.length > 0) {
            document.title = `Ski Areas | ${props.stateName} | Snotel`;
        }
        
    }, [props.stateName]);

    const [skiAreas, setSkiAreas] = useState();

    //get stations from stateID
    useEffect(() => {
        let isMounted = true;

        sendServerRequest(`skiAreas?region=${props.regionID}`)
            .then((response => {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    if(isMounted) {
                        setSkiAreas(response.body.skiAreas);
                    }
                } else {
                    console.error("Response code: ", response.statusCode, response.statusText);
                }
            })
        );
        return () => { isMounted = false };
    }, [props.regionID]);

    const classes = useStyles();
    
    return (
        <Grid container spacing={1}>
            {skiAreas 
                ? skiAreas.length > 0 
                    ? skiAreas.map((skiArea) => (
                        <Grid item xs={12} sm={12} md={6} key={skiArea.name}>
                            <Card>
                                <CardContent>
                                    <Typography 
                                        variant="inherit" color="secondary" 
                                        className={classes.name}
                                    >
                                        {skiArea.name}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                    : null
                : <ListSkeleton/>
            }
        </Grid>
    );
}

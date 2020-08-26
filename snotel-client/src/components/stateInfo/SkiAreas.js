import React, { useState, useEffect } from 'react';

import { Grid, Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequest } from '../../api/restfulAPI';
import { commasInNumber } from '../../utils/NumberCommas';
import ListSkeleton from './ListSkeleton';

const useStyles = makeStyles((theme) => ({
    name: {
        fontWeight: 'bold'
    },
    mt2: {
        marginTop: theme.spacing(2)
    },
    mt4: {
        marginTop: theme.spacing(4)
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

        const orderBy = props.selectedSort 
            ? props.selectedSort === 'alphabetical' ? 'name' : props.selectedSort
            : null;

        sendServerRequest(`skiAreas?region=${props.regionID}&orderBy=${orderBy}`)
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
    }, [props.regionID, props.selectedSort]);

    const classes = useStyles();

    const skiAreaInfo = (skiArea) => (
        skiArea.topElevation !== 0 
            ? <Grid container spacing={1} className={classes.mt2}>
                {[skiArea.topElevation, skiArea.verticalDrop].map((value, i) => (
                    <Grid 
                        item xs={12} key={i === 0 ? 'elevation' : 'vertical drop'}
                    >
                        <Grid container>
                            <Grid item xs={6}>
                                <Typography variant="body2">
                                    {`${i === 0 ? 'Top Elevation:' : 'Vertical Drop:'}`}
                                </Typography>
                            </Grid>
                            <Grid item xs>
                                <Typography variant="body2">
                                    {`${commasInNumber(value)} m`}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                ))}
            </Grid>
            : <Typography className={classes.mt4} variant="caption" paragraph>
                No elevation information available.
            </Typography>
        
    );
    
    return (
        <Grid container spacing={1}>
            {skiAreas 
                ? skiAreas.length > 0 
                    ? skiAreas.map((skiArea) => (
                        <Grid item xs={12} sm={12} md={6} lg={4} key={skiArea.name}>
                            <Card>
                                <CardContent>
                                    <Typography 
                                        variant="inherit" color="secondary" 
                                        className={classes.name}
                                    >
                                        {skiArea.name}
                                    </Typography>
                                    {skiAreaInfo(skiArea)}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                    : null
                : <ListSkeleton count={12} height={128}/>
            }
        </Grid>
    );
}

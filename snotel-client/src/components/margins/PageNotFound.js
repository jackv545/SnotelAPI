import React from 'react';

import {Grid, Typography, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    message: {
        margin: theme.spacing(24, 0, 24, 0)
    }
}));

export default function PageNotFound(props) {
    React.useEffect(() => {
        document.title = '404: Page Not Found'
    });

    const classes = useStyles();

    return(
        <Grid 
            container justify="center" alignItems="center"
            spacing={3} className={classes.message}
        >
            <Grid item>
                <Typography variant="h6" component="h1">
                    404
                </Typography>
            </Grid>
            <Divider flexItem={true} orientation="vertical"/>
            <Grid item>
                <Typography variant="body2">
                    This page could not be found.
                </Typography>
            </Grid>
        </Grid>
    )
}
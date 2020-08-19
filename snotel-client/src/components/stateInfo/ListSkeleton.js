import React from 'react';

import { Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

export default function ListSkeleton(props) {
    return (
        [...Array(20)].map((val, i) => (
            <Grid item xs={12} sm={12} md={6} key={i.toString()}>
                <Skeleton variant="rect" height={80}/>
            </Grid>
        ))
    );
}

import React from 'react';

import { Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

export default function ListSkeleton(props) {
    const gridProps = () => {
        if(props.variant === 'states') {
            return { xs: 12, sm: 6, md: 4, lg: 3 };
        } else {
            return { xs: 12, sm: 12, md: 6, lg: 4 };
        }
    }

    return (
        [...Array(props.count)].map((val, i) => (
            <Grid item {...gridProps()} key={i.toString()}>
                <Skeleton variant="rect" height={props.height}/>
            </Grid>
        ))
    );
}

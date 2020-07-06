import React from 'react';

import { Container, Grid } from '@material-ui/core';

import Menu from './Menu';
import TopSnowPack from './TopSnowPack';

export default function Home(props) {
    return (
        <Container maxWidth="md">
            <Grid container spacing={2}>
                <Grid item sm={12} md={8}>
                    <Menu/>
                </Grid>
                <Grid item sm={12} md={4}>
                    <TopSnowPack
                        setSelectedStation={props.setSelectedStation}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}

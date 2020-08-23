import React from 'react';

import { Container, Grid } from '@material-ui/core';

import Menu from './Menu';
import TopSnowPack from './TopSnowPack';

export default function Home(props) {
    React.useEffect(() => {
        document.title = 'Snotel';
    }, []);

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={8}>
                    <Menu prefersDarkMode={props.prefersDarkMode}/>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                    <TopSnowPack
                        prefersDarkMode={props.prefersDarkMode}
                        setSelectedStation={props.setSelectedStation}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}

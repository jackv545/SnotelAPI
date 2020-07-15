import React from 'react';

import { Container, Grid } from '@material-ui/core';

import Menu from './Menu';
import TopSnowPack from './TopSnowPack';

export default function Home(props) {
    React.useEffect(() => {
        document.title = 'Snotel';
    }, []);

    return (
        <Container maxWidth="md">
            <Grid container spacing={2}>
                <Grid item sm={12} md={8}>
                    <Menu prefersDarkMode={props.prefersDarkMode}/>
                </Grid>
                <Grid item sm={12} md={4}>
                    <TopSnowPack
                        prefersDarkMode={props.prefersDarkMode}
                        setSelectedStation={props.setSelectedStation}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}

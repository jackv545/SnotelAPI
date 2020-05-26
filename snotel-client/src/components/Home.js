import React from 'react';

import { Container, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import Menu from './Menu';
import TopSnowPack from './TopSnowPack';
import StationInfo from './StationInfo';
import StationMap from './StationMap';

const useStyles = makeStyles({
  header: props => ({
      marginTop: props.theme.spacing(3)
  })
})

export default function Home(props) {
    const classes = useStyles(props);

    if(props.selectedStation === null) {
        return(
            <Container maxWidth="md">
                <Grid container spacing={2}>
                    <Grid item sm={12} md={8}>
                        <Menu theme={props.theme} />
                    </Grid>
                    <Grid item sm={12} md={4}>
                        <TopSnowPack theme={props.theme} setSelectedStation={props.setSelectedStation}/>
                    </Grid>
                </Grid>
            </Container>
        );
    } else {
        return(
            <Container maxWidth="md">
                <Grid container className={classes.header}>
                    <Grid item sm={12} md={4}>
                        <Typography variant="h4" component="h1">
                            {props.selectedStation.name}</Typography>
                        <Typography variant="body2">
                            {`${props.selectedStation.state}, United States`}</Typography>
                    </Grid>
                    <Grid item sm={12} md={8}>
                        <StationInfo selectedStation={props.selectedStation}/>
                    </Grid>
                    <Grid item sm={12} md={4}>
                        
                    </Grid> 
                    <Grid item sm={12} md={8}>
                        <StationMap 
                            prefersDarkMode={props.prefersDarkMode}
                            selectedStation={props.selectedStation}
                        />
                    </Grid>
                </Grid>
            </Container>
        );
    }
}
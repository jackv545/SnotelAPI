import React from 'react';
import { Link } from 'react-router-dom';

import { Button, Grid, Typography } from '@material-ui/core';
import { Public, ChevronRight, FilterHdr } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    label: {
        textTransform: 'none',
        justifyContent: 'left'
    },
    endIcon: {
        color: theme.palette.secondary.main,
        marginLeft: 'auto'
    },
    menuText: {
        marginTop: theme.spacing(3)
    }
}));

export default function Menu(props) {
    const classes = useStyles();

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <Typography className={classes.menuText} variant="h6">
                    Explore Mountains or Regions
                </Typography>
            </Grid>
            {['World Map', 'State / Regions'].map((text, i) => (
                <Grid item key={i.toString()} xs={12}>
                    <Button
                        component={Link} to={i === 0 ? "/map" : "/explore"} 
                        fullWidth={true} variant="outlined"
                        classes={{ label: classes.label, endIcon: classes.endIcon }} 
                        startIcon={i === 0 ? <Public /> : <FilterHdr />} 
                        endIcon={<ChevronRight />}
                    >
                        {text}
                    </Button>
                </Grid>
            ))}
        </Grid>
    )
}

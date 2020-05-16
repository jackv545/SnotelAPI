import React from 'react';

import { Button, Grid, Typography } from '@material-ui/core';
import { Public, ChevronRight, FilterHdr } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  label: {
    textTransform: 'none',
    justifyContent: 'left'
  },
  endIcon: {
    marginLeft: 'auto'
  },
  menuText: props => ({
      marginTop: props.theme.spacing(1)
  })
})

export default function Menu(props) {
    const classes = useStyles(props);

    return(
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <Typography className={classes.menuText} variant="h6">
                    Explore Mountains or Regions
                </Typography>
            </Grid>
            {['World Map', 'State / Regions'].map((text, i) => (
                <Grid item key={i} xs={12}>
                    <Button 
                        classes={{label: classes.label, endIcon: classes.endIcon}} color="secondary" 
                        fullWidth={true} variant="contained"
                        startIcon={i === 0 ? <Public/> : <FilterHdr/>} endIcon={<ChevronRight/>}
                    >
                        {text}
                    </Button>
                </Grid>
            ))}
        </Grid>
    )
}
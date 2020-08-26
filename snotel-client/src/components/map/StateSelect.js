import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Button, Menu, MenuItem, Typography, Grid, useMediaQuery, Hidden } 
    from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { ArrowDropDown, List, Flag } from '@material-ui/icons';

import { SELECTED_STATE_DEFAULT } from './WorldMap.js';
import { useQuery } from '../margins/ViewTabs';
import { sendServerRequest } from '../../api/restfulAPI';

const useStyles = makeStyles((theme) => ({
    label: {
        textTransform: 'none',
        justifyContent: 'left'
    },
    endIcon: {
        marginLeft: 'auto'
    }
}));

export default function StateSelect(props) {
    const [states, setStates] = useState({});

    useEffect(() => {
        sendServerRequest('states')
            .then((response => {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    setStates({...response.body.states, 
                        [SELECTED_STATE_DEFAULT.key]: {stateName: SELECTED_STATE_DEFAULT.name}
                    });
                } else {
                    console.error("Response code: ", response.statusCode, response.statusText);
                }
            })
        );
    }, []);

    const [selectedStateName, setSelectedStateName] = useState('');

    useEffect(() => {
        if(Object.keys(states).length > 0 && props.state) {
            setSelectedStateName(states[props.state].stateName)
        }
    }, [props.state, states]);

    const classes = useStyles();

    let query = useQuery();
    const [listLink, setListLink] = useState(''); 

    useEffect(() => {
        if(props.state.length > 0) {
            if(query.get('tab') && props.state !== SELECTED_STATE_DEFAULT.key) {
                setListLink(`/explore/${props.state}?tab=${query.get('tab')}`);
            } else if(props.state !== SELECTED_STATE_DEFAULT.key) {
                setListLink(`/explore/${props.state}`);
            } else {
                setListLink(`/explore`)
            }
        }
    }, [query, props.state]);

    const listButton = (
        <Button
            fullWidth variant="outlined" startIcon={<List/>}
            classes={{ label: classes.label }} component={Link} 
            to={listLink}
        >
            Switch to List
        </Button>
    );

    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const mdUp = useMediaQuery(theme => theme.breakpoints.up('md'));

    const stateMenu = (
        <React.Fragment>
            <Button
                fullWidth variant="outlined" aria-controls="sort-menu"
                aria-haspopup="true"
                classes={{ label: classes.label, endIcon: classes.endIcon }}
                onClick={handleClick} endIcon={<ArrowDropDown/>}
                startIcon={mdUp ? null : <Flag/>}
            >
                {selectedStateName}
            </Button>
            <Menu
                id="state-menu" anchorEl={anchorEl} keepMounted
                open={Boolean(anchorEl)} onClose={handleClose}
                getContentAnchorEl={null} className={classes.menuItem}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
                {Object.keys(states).map((state) => (
                    <MenuItem
                        onClick={handleClose} component={Link} 
                        to={state !== SELECTED_STATE_DEFAULT.key 
                            ? `/map/${state}` : '/map'
                        }
                        selected={state === props.state} key={state}
                    >
                        {states[state].stateName}
                    </MenuItem>
                ))}
            </Menu>
        </React.Fragment>
    );

    return(
        <Grid container spacing={1} className={props.className}>
            <Grid item xs={6} sm={6} md={12}>
                <Hidden smDown>
                    <Typography variant="caption">
                        State:
                    </Typography>
                </Hidden>
                {stateMenu}
            </Grid>
            <Grid item xs={6} sm={6} md={12}>
                {listButton}
            </Grid>
        </Grid> 
    );
}

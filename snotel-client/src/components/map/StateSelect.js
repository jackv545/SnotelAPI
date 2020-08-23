import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Button, Menu, MenuItem, Typography, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { ArrowDropDown, List } from '@material-ui/icons';

import { SELECTED_STATE_DEFAULT } from '../WorldMap.js';
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

    const listButton = (
        <Button
            fullWidth variant="outlined" startIcon={<List/>}
            classes={{ label: classes.label }} component={Link} 
            to={`/explore${props.state === SELECTED_STATE_DEFAULT.key 
                ? '' : `/${props.state}`}`
            }
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

    const stateMenu = (
        <React.Fragment>
            <Button
                fullWidth variant="outlined" aria-controls="sort-menu"
                aria-haspopup="true"
                classes={{ label: classes.label, endIcon: classes.endIcon }}
                onClick={handleClick} endIcon={<ArrowDropDown/>}
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
                        onClick={handleClose}
                        component={Link} 
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
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <Typography variant="caption">
                    State:
                </Typography>
                {stateMenu}
            </Grid>
            <Grid item>
                {listButton}
            </Grid>
        </Grid> 
    );
}

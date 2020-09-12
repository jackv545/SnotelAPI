import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { List } from '@material-ui/icons';

import { SELECTED_STATE_DEFAULT } from './WorldMap.js';
import { useQuery } from '../margins/ViewTabs';

const useStyles = makeStyles((theme) => ({
    label: {
        textTransform: 'none',
        justifyContent: 'left'
    }
}));

export default function ListButton(props) {
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

    const classes = useStyles();

    return(
        <Button
            fullWidth variant="outlined" startIcon={<List/>}
            className={props.className} classes={{ label: classes.label }} 
            component={Link} to={listLink}
        >
            Switch to List
        </Button>
    );
}

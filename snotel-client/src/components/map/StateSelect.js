import React, { useState, useEffect } from 'react';

import { Select } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    mt2smUp: {
        [theme.breakpoints.up('sm')]: {
            marginTop: theme.spacing(2)
        }
    },
    mt3: {
        marginTop: theme.spacing(3)
    }
}));

export default function StateSelect(props) {
    useEffect(() => {

    }, []);

    return(

    );
}
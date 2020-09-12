import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

import { Grid, ButtonBase, Chip, useMediaQuery } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { makeStyles, useTheme } from '@material-ui/styles';
import { fade } from '@material-ui/core/styles';

import { sendServerRequest } from '../../api/restfulAPI';

const useStyles = makeStyles((theme) => ({ 
    tab: {
        ...theme.typography.button,
        textTransform: 'none',
        padding: '5px 15px',
        width: '100%',
        transition: theme.transitions.create(['background-color'], {
            duration: theme.transitions.duration.short,
        }),
        borderRadius: theme.shape.borderRadius,
        justifyContent: 'left',
        border: `1px solid ${
            theme.palette.type === 'light' 
            ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)'
        }`,
        '&:hover': {
            backgroundColor: 
                fade(theme.palette.text.primary, theme.palette.action.hoverOpacity),
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
                backgroundColor: 'transparent',
            }
        }
    },
    listBorderRadius: {
        [theme.breakpoints.down('xs')]: {
            borderRadius: theme.spacing(2),
            justifyContent: 'center'
        }
    },
    mapBorderRadius: {
        [theme.breakpoints.down('sm')]: {
            borderRadius: theme.spacing(2),
            justifyContent: 'center'
        },
    },
    chip: {
        backgroundColor: theme.palette.type === 'light' 
            ? theme.palette.grey[400] : theme.palette.grey[700]
    },
    endIcon: {
        marginLeft: 'auto'
    },
    mt2smUp: {
        [theme.breakpoints.up('sm')]: {
            marginTop: theme.spacing(2)
        }
    },
    mt2: {
        marginTop: theme.spacing(2)
    }
}));

export const VIEW_OPTIONS = {'ski-areas': 'Ski Areas', backcountry: 'Backcountry'};
export const VIEW_OPTION_KEYS = Object.keys(VIEW_OPTIONS);

// A custom hook that builds on useLocation to parse the query string
export function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export function ViewTabs(props) {
    const viewTabChip = (count) => {
        return (count > -1
            ? <Chip 
                size="small" label={count} className={classes.endIcon}
                classes={{root: classes.chip}}
            />
            : <Skeleton 
                variant="circle" width={32} height={24} 
                className={classes.endIcon}
            />
        );
    };

    const [skiAreaCount, setSkiAreaCount] = useState(-1);
    const [backcountryStationCount, setBackcountryStationCount] = useState(-1);

    useEffect(() => {
        if(props.state.length > 0) {
            sendServerRequest(`count?state=${props.state}`)
                .then((response => {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        setSkiAreaCount(response.body.count.skiAreas);
                        setBackcountryStationCount(response.body.count.backcountry);
                    } else {
                        console.error("Response code: ", response.statusCode, response.statusText);
                    }
                })
            );
        }
    }, [props.state]);

    const classes = useStyles();
    const theme = useTheme();
    const smDown = useMediaQuery(theme => theme.breakpoints.down('sm'));

    const gridProps = (i) => {
        if(props.variant === 'map') {
            return { xs: 6, sm: 6, md: 12, className: i === 0 || smDown ? classes.mt2 : null };
        } else {
            return { xs: 6, sm: 12, className: i === 0 ? classes.mt2smUp : null };
        }
    }

    const tabClassName = () => {
        if(props.variant === 'map') {
            return `${classes.tab} ${classes.mapBorderRadius}`;
        } else {
            return `${classes.tab} ${classes.listBorderRadius}`;
        }
    }

    return (
        VIEW_OPTION_KEYS.map((viewOption, i) => (
            <Grid 
                item {...gridProps(i)} key={viewOption}
            >
                <ButtonBase 
                    focusRipple classes={{root: tabClassName()}} 
                    component={Link} to={`?tab=${viewOption}`}
                    style={viewOption === props.selectedView ? { 
                        backgroundColor: 
                            fade(
                                theme.palette.secondary.main, 
                                theme.palette.action.activatedOpacity
                            ),
                        pointerEvents: 'none'
                    } : null}
                >
                    {VIEW_OPTIONS[viewOption]}
                    {viewTabChip(
                        viewOption === VIEW_OPTION_KEYS[0] 
                            ? skiAreaCount : backcountryStationCount
                    )}
                </ButtonBase>
            </Grid>
        ))
    );
}
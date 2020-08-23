import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Paper, Container, Grid, Typography, Link, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    footer: props => ({
        backgroundColor: props.prefersDarkMode ? theme.palette.background.paper
            : theme.palette.primary.main,
        marginTop: theme.spacing(8)
    }),
    container: {
        padding: theme.spacing(4)
    },
    divider: {
        margin: theme.spacing(1, 0, 1, 0),
        backgroundColor: 'rgba(255, 255, 255, 0.12)'
    },
    text: {
        color: theme.palette.primary.contrastText
    }
}));

export default function Footer(props) {
    const classes = useStyles(props);

    return(
        <Paper component="footer" className={classes.footer}>
            <Container maxWidth="lg" className={classes.container}>
                <Divider className={classes.divider}/>
                <Grid container alignItems="center" justify="space-evenly">
                    <Grid item>
                        <Typography variant="caption" className={classes.text}>
                            © 2020 <Link
                                href="https://jackvisser.com" color="inherit"
                            >
                                Jack Visser
                            </Link> 
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Link 
                            variant="caption" className={classes.text}
                            to="/contact" component={RouterLink}
                        >
                            Contact
                        </Link>
                    </Grid>
                    <Grid item>
                        <Typography variant="caption" className={classes.text}>
                            <Link 
                                href="https://github.com/jackv545/SnotelAPI"
                                target="_blank" rel="noopener" color="inherit"
                            >
                                GitHub
                            </Link>
                        </Typography>
                    </Grid>
                </Grid>
            </Container>
        </Paper>
    );
}

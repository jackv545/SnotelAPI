import React from 'react';

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
    }
}));

export default function Footer(props) {
    const classes = useStyles(props);

    return(
        <Paper component="footer" className={classes.footer}>
            <Container maxWidth="md" className={classes.container}>
                <Grid container direction="column" spacing={1}>
                    <Grid item>
                        <Typography variant="body2">
                            <Link 
                                href="https://github.com/jackv545/SnotelAPI"
                                target="_blank" rel="noopener" color="inherit"
                            >
                                GitHub Respository
                            </Link>
                        </Typography>
                    </Grid>
                    <Divider/>
                    <Grid item>
                        <Typography variant="subtitle">
                            © 2020 <Link 
                                href="https://jackvisser.com"
                                target="_blank" rel="noopener" color="inherit"
                            >
                                Jack Visser
                            </Link> 
                        </Typography>
                    </Grid>
                </Grid>
            </Container>
        </Paper>
    );
}

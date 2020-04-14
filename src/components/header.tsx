import React from 'react';
import { createStyles, Theme, makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    header: {
      padding: theme.spacing(2),
      height: 'calc(4vh)',
      width: '100%',
      backgroundColor: '#000',
      color: 'white'
    },
  }),
);

export default function Header (props: any) {
  const classes = useStyles();

  return <Grid item xs={12} className={classes.header}><strong>Twiliofy</strong></Grid>;
}
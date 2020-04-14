import React from 'react';
import { createStyles, Theme, makeStyles} from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Grid from '@material-ui/core/Grid';
import Fab from '@material-ui/core/Fab';
import Videocam from '@material-ui/icons/Videocam';

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    root: {
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'space-around',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.paper
    },
    gridList: {
      backgroundColor: '#222',
      height: 'calc(100vh)',
      width: 'calc(100%)',
      transform: 'translateZ(0)'
    },
    gridListTile: {
      height: 'calc(100vh)',
      width: 'calc(100%)',
      'object-fit': 'contain'
    },
    titleBar: {
      background:
        'linear-gradient(to bottom, rgba(0,0,0,1.0) 0%, ' +
        'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)'
    },
    icon: {
      height: '100%',
      width: '100%'
    },
    buttonGrid: {
      position: 'absolute',
      top: 'calc(40vh)'
    },
    extendedButton: {
      margin: theme.spacing(1),
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    }
  })
);

export default function JoinGrid(props: any) {
  const { gridHeight, joinRoom, roomId } = props;
  const cellHeight: number = (gridHeight - 10);

  const classes = useStyles();

  // From GridListTileBar:
  // title={'GUEST ROOM'}

  return (
    <div className={classes.root}>
      <GridList cellHeight={cellHeight} spacing={1} cols={1} className={classes.gridList}>
          <GridListTile key={'join-tile'} className={classes.gridListTile} cols={1} rows={1}>
            <GridListTileBar
              titlePosition='top'
              className={classes.titleBar}
            />
          </GridListTile>
      </GridList>
      <Grid container className={classes.buttonGrid} spacing={2}>
        <Grid item xs={12}>
          <Grid container justify="center">
            <Grid key={'end-call'} item>
              <Fab variant={'extended'} size={'medium'} color={'primary'} arial-label={`leave room`} className={classes.extendedButton} onClick={joinRoom}>
                <Videocam className={classes.extendedIcon} />
                JOIN CALL
              </Fab>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
            
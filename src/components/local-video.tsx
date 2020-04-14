import React from 'react';
import { createStyles, Theme, makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import PersonIcon from '@material-ui/icons/Person';
import Mic from '@material-ui/icons/Mic';
import MicOff from '@material-ui/icons/MicOff';
import VideoCamOff from '@material-ui/icons/VideocamOff';
import VideoCam from '@material-ui/icons/Videocam';
import { UserVideoTile } from './video-container';
import Fab from '@material-ui/core/Fab';
import CallEndRounded from '@material-ui/icons/CallEndRounded';

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'space-around',
      overflow: 'hidden',
      backgroundColor: '#222',
    },
    gridList: {
      backgroundColor: '#222',
      height: 'calc(60vh)',
      width: 'calc(100%)',
      // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
      transform: 'translateZ(0)',
    },
    gridListTile: {
      height: 'calc(100vh)',
      width: 'calc(100%)'
    },
    titleBar: {
      background:
        'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
        'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
    icon: {
      color: 'white',
      height: '100%',
      width: '100%'
    },
    video: {
      height: 'calc(100%)',
      width: 'calc(100%)',
      'object-fit': 'contain'
    },
    buttonGrid: {
      position: 'absolute',
      paddingTop: '20px',
      top: 'calc(27vh)',
      margin: theme.spacing(1),
    },
    extendedButton: {
      margin: theme.spacing(1),
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    }
  })
);

const getLocalUserTile = (localUserTile: UserVideoTile, isPrimary: boolean, classes: any) => {
  const localUserString: string = `video-${localUserTile.participantId}`;
  return (
    <GridListTile key={`grid-list-tile-${localUserTile.participantId}`} className={classes.gridListTile} cols={isPrimary ? 12 : 4} rows={isPrimary ? 12 : 3}>
      <GridListTileBar
        title={'My Video'}
        titlePosition='top'
        actionIcon={
          <IconButton aria-label={`avatar ${localUserTile.participantId}`} className={classes.icon}>
            <PersonIcon />
          </IconButton>
        }
        actionPosition='left'
        className={classes.titleBar}
      />
      <video className={classes.video} id={localUserString} ref={localUserTile.ref} />
      <audio id={'audio-local-media'} />
    </GridListTile>
  );
}

/*
const getDominantSpeakerTile = (dominantSpeakerTile: UserVideoTile, classes: any) => {
  const dominantSpeakerString: string = `video-${dominantSpeakerTile.participantId}`;
  return (
    <GridListTile key={`dominant-speaker-${dominantSpeakerTile.participantId}`} className={classes.gridListTile} cols={12} rows={9}>
      <GridListTileBar
        title={'Active Speaker'}
        titlePosition='top'
        actionIcon={
          <IconButton aria-label={`avatar ${dominantSpeakerTile.participantId}`} className={classes.icon}>
            <StarIcon />
          </IconButton>
        }
        actionPosition='left'
        className={classes.titleBar}
      />
      <video className={classes.video} id={dominantSpeakerString} ref={dominantSpeakerTile.ref} />
      <audio id={`audio-${dominantSpeakerTile.participantId}`} />

    </GridListTile>
  );
}

const getRemoteUserTile = (userVideoTile: UserVideoTile, classes: any) => {
  const remoteUserString: string = `video-${userVideoTile.participantId}`;
  return (
    <GridListTile key={userVideoTile.participantId} className={classes.gridListTile} cols={4} rows={3}>
      <GridListTileBar
        title={'Guest Video'}
        titlePosition={'top'}
        actionIcon={
          <IconButton aria-label={`avatar ${userVideoTile.participantId}`} className={classes.icon}>
            <StarIcon />
          </IconButton>
        }
        actionPosition='left'
        className={classes.titleBar}
      />
      <video className={classes.video} id={remoteUserString} ref={userVideoTile.ref} />
      <audio id={`audio-${userVideoTile.participantId}`} />
    </GridListTile>
  );
}


const getAllUserTiles = (localUserTile: UserVideoTile, dominantSpeakerTile: UserVideoTile, remoteUserTiles: UserVideoTile[], classes: any, leaveRoom: any, isAudioMuted: boolean, audioToggle: any, isVideoMuted: boolean, videoToggle: any) => {
  let allUserTiles: JSX.Element[] = [];
  let isPrimary: boolean = false;
  if (!dominantSpeakerTile && remoteUserTiles.length === 0) {
    // only local user if no dominant speaker and no remote users
    isPrimary = true;
    allUserTiles.push(getLocalUserTile(localUserTile, isPrimary, classes));
  }
  else if (dominantSpeakerTile) {
    // dominant speaker, local user and potentially remote users
    isPrimary = false;
    allUserTiles.push(getDominantSpeakerTile(dominantSpeakerTile, classes));
    allUserTiles.push(getLocalUserTile(localUserTile, isPrimary, classes));
    if (remoteUserTiles && remoteUserTiles.length) {
      remoteUserTiles.forEach((remoteUserTile: UserVideoTile) => {
        allUserTiles.push(getRemoteUserTile(remoteUserTile, classes));
      });
    }
  }
  else {
    // no dominant speaker, but potentially remote participants present
    isPrimary = false;
    allUserTiles.push(getDominantSpeakerTile(remoteUserTiles[0], classes));
    allUserTiles.push(getLocalUserTile(localUserTile, isPrimary, classes));
    remoteUserTiles.forEach((remoteUserTile: UserVideoTile, index: number) => {
      if (index > 0) {
        // Ignore index 0, since we already added user to primary video slot
        allUserTiles.push(getRemoteUserTile(remoteUserTile, classes));
      }
    });
  }
  return allUserTiles;
}
*/

/*
{(anyParticipantsPresent) ? getAllUserTiles(localUserTile, dominantSpeakerTile, participantTiles, classes, leaveRoom, isAudioMuted, audioToggle, isVideoMuted, videoToggle) : 
          getLocalUserTile(localUserTile, true, classes) 
        }
*/

export default function LocalVideo(props: any) {
  const { height, localUserTile, leaveRoom, isAudioMuted, audioToggle, isVideoMuted, videoToggle } = props;
  const optimizedHeight: number = (height - 5) / 12;
  // const isDominantSpeakerTilePresent: boolean = dominantSpeakerTile ? true : false;

  // const remoteParticipantsPresent: boolean = (participantTiles && participantTiles.length > 0) ? true : false;
  // const anyParticipantsPresent: boolean = (isDominantSpeakerTilePresent || remoteParticipantsPresent);
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <GridList cellHeight={optimizedHeight} spacing={2} cols={12} className={classes.gridList}>
        { getLocalUserTile(localUserTile, true, classes) }
      </GridList>
      
      <Grid container className={classes.buttonGrid} spacing={0}>
          <Grid item xs={12}>
            <Grid container justify="center">
              <Grid key={'end-call'} item>
                <Fab variant={'extended'} size={'small'} color={'primary'} arial-label={`leave room`} className={classes.extendedButton} onClick={leaveRoom}>
                  <CallEndRounded className={classes.extendedIcon} />
                  END
                </Fab>
              </Grid>
              <Grid key={'mute-audio'} item>
                <Fab variant={'extended'} size={'small'} color={ isAudioMuted ? 'secondary' : 'primary' } arial-label={isAudioMuted ? 'Un-Mute Audio' : 'Mute Audio'} className={classes.extendedButton} onClick={audioToggle}>
                  { isAudioMuted ? <Mic className={classes.extendedIcon} /> : <MicOff className={classes.extendedIcon} /> }
                  { isAudioMuted ? 'UNMUTE' : 'MUTE'}
                </Fab>
              </Grid>
              <Grid key={'mute-video'} item>
                <Fab variant={'extended'} size={'small'} color={ isVideoMuted ? 'secondary' : 'primary' } arial-label={isVideoMuted ? 'Un-Mute Video' : 'Mute Video'} className={classes.extendedButton} onClick={videoToggle}>
                  { isVideoMuted ? <VideoCam className={classes.extendedIcon} /> : <VideoCamOff className={classes.extendedIcon} /> }
                  { isVideoMuted ? 'UNMUTE' : 'MUTE'}
                </Fab>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
    </div>
  );
}

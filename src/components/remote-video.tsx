import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { UserVideoTile } from './video-container';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    remoteVideoList: {
      padding: theme.spacing(1),
      height: 'calc(96vh)',
      width: 'calc(100%)',
      backgroundColor: '#222',
      color: '#fff'
    },
    remoteVideo: {
      height: 'calc(100%)',
      width: 'calc(100%)',
      'object-fit': 'contain'
    },
  }),
);

const getRemoteUserTile = (userVideoTile: UserVideoTile, classes: any) => {

  // const remoteUserString: string = `video-${userVideoTile.participantId}`;
  return (
    <Grid item xs={12} key={`grid-item-${userVideoTile.participantId}`}>
      <video className={classes.remoteVideo} id={`video-${userVideoTile.participantId}`} ref={userVideoTile.ref} />
      <audio id={`audio-${userVideoTile.participantId}`} />
    </Grid>
  );
}


const getRemoteUserVideos = (remoteUserTiles: UserVideoTile[], classes: any) => {
  let allUserTiles: JSX.Element[] = [];
  if (remoteUserTiles && remoteUserTiles.length) {
    remoteUserTiles.forEach((remoteUserTile: UserVideoTile) => {
      allUserTiles.push(getRemoteUserTile(remoteUserTile, classes));
    });
  }
  return allUserTiles;
}

export default function RemoteVideo(props: any) {
  const { remoteUserTiles } = props;
  const classes: any = useStyles();

  const remoteUserVideoTiles: JSX.Element[] = getRemoteUserVideos(remoteUserTiles, classes);
  console.error('RemoteVideo is rendering now');
  console.error('with ' + remoteUserVideoTiles.length + ' remote users');
  return (
    <Grid item xs={12} className={classes.remoteVideoList}>
      {remoteUserVideoTiles}
    </Grid>
  );
}
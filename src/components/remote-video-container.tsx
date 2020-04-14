import React from 'react';
import { connect } from 'react-redux';
import { RemoteParticipant } from 'twilio-video';
import Grid from '@material-ui/core/Grid';
import RemoteVideo from './remote-video';
import { UserVideoTile } from './video-container';

export interface RemoteVideoContainerProps {
  participants: Map<string, RemoteParticipant>;
  participantNumber: number;
}

export interface RemoteVideoContainerState {
}

class RemoteVideoContainer extends React.Component <RemoteVideoContainerProps, RemoteVideoContainerState> {
  private remoteMedia: Map<string, React.RefObject<HTMLVideoElement>> = new Map<string, React.RefObject<HTMLVideoElement>>();

  constructor(props: RemoteVideoContainerProps) {
    super(props);
  }

  getRemoteParticipantVideoTiles = () => {
    let userVideoTiles: UserVideoTile[] = [] as UserVideoTile[];
    let remoteParticipantIndex: number = 0;

    if (this.props.participants && this.props.participants.size > 0) {
      this.props.participants.forEach((participant: RemoteParticipant, key: string) => {
        if (key && participant.videoTracks.size > 0) {
          console.error('addingRemoteVideoTile with index ' + remoteParticipantIndex + ' key ' + key + ' and identity ' + participant.identity);
          console.error('participant.sid is ' + participant.sid);
          const remoteRef: React.RefObject<HTMLVideoElement> = React.createRef();
          this.remoteMedia.set(key, remoteRef);
          const remoteUserTile = {
            participantId: participant.identity,
            isLocal: false,
            isDominantSpeaker: false,
            audioTracks: participant.audioTracks,
            videoTracks: participant.videoTracks,
            ref: remoteRef,
            label: 'Remote Participant ' + remoteParticipantIndex,
            videoToggle: null,
            audioToggle: null
          };
          userVideoTiles.push(remoteUserTile);
        }
        else {
          return null;
        }
        remoteParticipantIndex++;
      });
    }
    return userVideoTiles;
  }

  render() {
    console.error('rendering remote-video-container');
    const remoteVideoTiles: UserVideoTile[] = this.getRemoteParticipantVideoTiles();
    console.error('and remoteVideoTiles.length is ' + remoteVideoTiles.length);
    // console.error('and this.props.participantNumber is ' + this.props.participantNumber);

    return (
      <Grid item xs={12} >
        <RemoteVideo remoteUserTiles={remoteVideoTiles} />
      </Grid>
    );
  }  
}

const mapStateToProps = (state: any) => {
  return {
    participants: state.room.participants,
    participantNumber: state.room.participantNumber
   };
}

export default connect(mapStateToProps, {})(RemoteVideoContainer);
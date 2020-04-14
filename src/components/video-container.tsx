import * as React from 'react';
import CommonUtility from '../utils/common-utility';
import Video, { ConnectOptions, RemoteTrackPublication, RemoteParticipant, LocalParticipant, LocalTrack, LocalVideoTrack, LocalAudioTrack, Room, TrackPublication, Participant, TwilioError, LocalTrackPublication, LocalDataTrack } from 'twilio-video';
import LocalVideo from './local-video';
import JoinGrid from './join-grid';
// import Constants from '../constants';
import { SMALL_GROUP_VIDEO, SMALL_GROUP_ACTIVITY, MEDIUM_GROUP_VIDEO, MEDIUM_GROUP_ACTIVITY } from '../constants';
import { connect } from 'react-redux';
import { registerWebsocketService, setUserId, joinRoom, joinedRoom, leaveRoom, leftRoom, participantsUpdated, participantJoinedVideo, participantLeftVideo } from '../actions';

// TODO: MOVE THIS TO DOTENV VARIABLE
// For production:
// const TOKEN_URL: string = 'https://lemon-persian-6556.twil.io/capabilityToken';
// const SMS_URL: string = 'https://lemon-persian-6556.twil.io/vidtactsms?roomName=';

// For Testing environment:
// const TOKEN_URL: string = 'https://lemon-persian-6556.twil.io/demoCapabilityToken';
// const SMS_URL: string = 'https://lemon-persian-6556.twil.io/demoSMS?roomName=';
const TOKEN_URL: string = process.env.REACT_APP_TWILIO_TOKEN_URL || '';
const SMS_URL: string = process.env.REACT_APP_TWILIO_SMS_URL || '';

// TODO: Move some of the other state variables to the store
export interface UserVideoTile {
  participantId: string;
  ref: React.RefObject<HTMLVideoElement>;
  isLocal: boolean;
  isDominantSpeaker: boolean;
  audioTracks: Map<string, TrackPublication>;
  videoTracks: Map<string, TrackPublication>;
  label: string;
  videoToggle: any;
  audioToggle: any;
}

interface VideoContainerProps {
    // injected props:
  userId: string;
  meetingType: string;
  roomId: string;
  width: number;
  height: number;
  isJoiningRoom: Boolean;
  hasJoinedRoom: Boolean;
  isLeavingRoom: Boolean;
  hasLeftRoom: Boolean;
  participants: Map<string, RemoteParticipant>;
  joinRoom: () => void;
  joinedRoom: () => void;
  leaveRoom: () => void;
  leftRoom: () => void;
  participantsUpdated: (participants: Map<string, RemoteParticipant>) => void;
  participantJoinedVideo: (participant: Video.RemoteParticipant) => void;
  participantLeftVideo: (participant: Video.RemoteParticipant) => void;
  setUserId: () => void;
}

interface VideoContainerState {
  microphoneDevice: any;
  speakerDevice: any;
  videoDevice: any;
  isDeviceReady: Boolean;
  isConnected: Boolean;
  isAudioMuted: Boolean;
  isVideoMuted: Boolean;
  activeRoom: Room;
  localParticipant: LocalParticipant;
  // participants: Map<string, RemoteParticipant>;
  dominantSpeaker: RemoteParticipant;
  localMediaAvailable: Boolean;
  localAudioTrack: LocalAudioTrack;
  localVideoTrack: LocalVideoTrack;
  capabilityToken: string;
}

class VideoContainer extends React.Component <VideoContainerProps, VideoContainerState> {

  private localMedia: React.RefObject<HTMLVideoElement>;
  
  constructor(props: VideoContainerProps) {
    super(props);
    
    this.state = {
      microphoneDevice: null,
      speakerDevice: null,
      videoDevice: null,
      isDeviceReady: false,
      isConnected: false,
      isAudioMuted: false,
      isVideoMuted: false,
      activeRoom: {} as Room,
      localParticipant: {} as LocalParticipant,
      dominantSpeaker: {} as RemoteParticipant,
      localMediaAvailable: false,
      localAudioTrack: {} as LocalAudioTrack,
      localVideoTrack: {} as LocalVideoTrack,
      capabilityToken: ''
    };

    this.localMedia = React.createRef();
  }

  componentDidMount () {
    if (!this.props.userId) {
      this.props.setUserId();
    }
    window.addEventListener('beforeunload', this.leaveRoomIfJoined);
  }

  componentWillUnmount () {
    window.removeEventListener('beforeunload', this.leaveRoomIfJoined);
  }

  onJoinRoom = () => {
    // Connect user to socket.io server
    if (this.props.userId && this.props.roomId) {
      registerWebsocketService(this.props.userId, this.props.roomId);
    }
    //TODO: See if these should be combined...
    this.props.joinRoom();

    this.setLocalTracks()
    .then((success: Boolean) => {
      if (success) {
        // TODO: may want to move this to onRoomJoined
        this.props.joinedRoom();
        this.getCapabilityToken()
        .then((httpResponse: any) => {
          const token: string = httpResponse.token;
          if (token) {
            this.connectVideoToRoom(token);
          }
        })
        .catch((err: Error) => {
          console.error('error when retrieving capability token: ' + err);
        });
      }
      else {
        console.error('not successful when setting local tracks');
      }
    })
    .catch((err: Error) => {
      console.error('Error when setting local tracks');
    });
  }

  getCapabilityToken = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      CommonUtility.httpRequest(TOKEN_URL + '?identity=' + this.props.userId + '&room=' + this.props.roomId)
        .then((httpResponse: any) => {
          resolve(httpResponse);
        })
        .catch((err: any) => {
          console.error('Error when retrieving capability token: ' + JSON.stringify(err));
          reject(err);
        });
    });
  }

  // Get the Participant's Tracks.
  getRemoteTracks = (participant: any) => {
    if (participant.tracks) {
      return Array.from(participant.tracks.values()).filter((publication: any) => {
        return publication.track;
      }).map((publication: any) => {
        return publication.track;
      });
    }
    else {
      console.warn('DID NOT find remote tracks for participant: ' + participant);
      return [];
    }
  }

  // Attach a single track to the DOM
  attachTrack = (track: any, container: any) => {
    track.attach(container);
  }

  // Attach multiple tracks to the DOM.
  attachTracks = (tracks: any[], container: any) => {
    tracks.forEach((track: any) => {
      this.attachTrack(track, container);
    });
  }

  // Attach a remote participant's tracks to the DOM.
  attachParticipantTracks = (participant: RemoteParticipant, container: any) => {
    const tracks: any[] = Array.from(participant.tracks.values());
    this.attachTracks(tracks, container);
  }

  // detach a single track from the DOM
  detachTrack = (track: any) => {
    track.detach().forEach((detachedElement: any) => {
      detachedElement.remove();
    });
  }

  // Detach a remote participant's tracks from the DOM.
  detachParticipantTracks = (participant: any) => {
    const tracks: Video.RemoteTrack[] = this.getRemoteTracks(participant);
    if (tracks.length > 0) {
      tracks.forEach(this.detachTrack);
    }
  }

  // Detach local tracks 
  detachTracks = (tracks: LocalTrack[]) => {
    tracks.forEach((track: LocalTrack) => {
      this.detachTrack(track);    
    });
    
    this.setState({
      ...this.state,
      localMediaAvailable: false,
      localAudioTrack: {} as LocalAudioTrack,
      localVideoTrack: {} as LocalVideoTrack
    });
  }

  // Get the actual video tracks
  getOrCreateLocalTracks = (): Promise<{videoTrack: LocalVideoTrack, audioTrack: LocalAudioTrack}> => {
    return new Promise((resolve, reject) => {
      if (this.state.localMediaAvailable) {
        const localAudio: LocalAudioTrack = this.state.localAudioTrack as LocalAudioTrack;
        const localVideo: LocalVideoTrack = this.state.localVideoTrack as LocalVideoTrack;
        Promise.resolve({localVideo, localAudio});
      }
      else {
        // const localTrackOptions: Video.CreateLocalTracksOptions = {audio: true, video: { width: 720 } }
        Video.createLocalTracks()
        .then((tracks: LocalTrack[]) => {
          let videoTrack: LocalVideoTrack = {} as LocalVideoTrack;
          let audioTrack: LocalAudioTrack = {} as LocalAudioTrack;
          let dataTrack: LocalDataTrack = {} as LocalDataTrack;
          tracks.forEach((track: Video.LocalTrack) => {
            if (track.kind === 'video') {
              videoTrack = track;
            }
            else if (track.kind === 'audio') {
              audioTrack = track;
            }
            else {
              // TODO: look at using data track
              dataTrack = track;
            }
          });
          this.setState({
            ...this.state,
            localVideoTrack: videoTrack,
            localAudioTrack: audioTrack,
            localMediaAvailable: true
          });
          resolve({videoTrack, audioTrack});
        })
        .catch((err: Error) => {
          console.error('Error when attempting to create local tracks: ' + err);
        });
      }
    });
  }

  // Attach local user's video tracks to DOM
  setLocalTracks = (): Promise<Boolean> => {
    // TODO: Separate out attach local audio track and video track
    return this.getOrCreateLocalTracks()
      .then((tracks: {videoTrack: LocalVideoTrack, audioTrack: LocalAudioTrack}) => {
        // const localVideo = document.getElementById('video-local-media');
        const localAudio = document.getElementById('audio-local-media');
        this.attachTrack(tracks.videoTrack, this.localMedia.current);
        this.attachTrack(tracks.audioTrack, localAudio);
        return true;
      })
      .catch((err) => {
        console.warn('Error when setting local tracks');
        console.warn(err);
        return false;
      });
  }

  // Connect participants already in room
  connectRemoteParticipants = (participants: Map<string, RemoteParticipant>) => {
    const roomParticipantArray = Array.from(participants.values());

    roomParticipantArray.forEach((participant: RemoteParticipant) => {
      this.onParticipantConnected(participant);
    });
  }

  connectVideoToRoom = (capabilityToken: string) => {
    if (this.state.localAudioTrack || this.state.localVideoTrack) {
      const twilioRoomId: string = this.props.roomId;
      console.warn('Connecting to Twilio room with id ' + twilioRoomId);
      let connectOptions: ConnectOptions = {
        name: this.props.roomId,
        dominantSpeaker: true,
        logLevel: 'debug',
        tracks: [this.state.localVideoTrack, this.state.localAudioTrack]
      };

      Video.connect(capabilityToken, connectOptions)
      .then((room: Video.Room) => { 
        this.onRoomJoined(room);
      })
      .catch((err: any) => {
        console.error('Could not connect to Twilio: ' + err.message);
      });
    }
    else {
      console.error('Not connecting to room!');
    }
  }

  // TODO: Allow participants to invite others via SMS
  messageOrganizer = () => {
    CommonUtility.httpRequest(SMS_URL + this.props.roomId)
    .then((response: any) => {
      console.log('Organizer has been contacted by SMS');
    });
  }

  onRoomJoined = (room: Video.Room) => {
    console.log('Joined Video Room ' + room.name);
    const activeRoom: Video.Room = room;
    activeRoom.on('reconnecting', this.onRoomReconnecting);
    activeRoom.on('reconnected', this.onRoomReconnected);
    activeRoom.on('disconnected', this.onRoomLeft);
    activeRoom.on('participantConnected', this.onParticipantConnected);
    activeRoom.on('participantDisconnected', this.onParticipantDisconnected);
    activeRoom.on('dominantSpeakerChanged', this.onDominantSpeakerChanged);

    const roomParticipants = activeRoom.participants;
    this.props.participantsUpdated(roomParticipants);
    this.connectRemoteParticipants(roomParticipants);
    // TODO: allow users to email and text their contacts to invite them to a meeting
    // this.messageOrganizer();

    this.setState({
      ...this.state,
      activeRoom: activeRoom
    });
  }

  onTrackPublished = (publication: RemoteTrackPublication, participantId: string) => {
    publication.on('subscribed', (track: Video.RemoteTrack) => {
      const elementIdString: string = `${publication.kind}-${participantId}`;
      const container = document.getElementById(elementIdString);
      this.attachTrack(track, container);
      track.on('disabled', this.onRemoteParticipantMuted);
      track.on('enabled', this.onRemoteParticipantUnMuted);

      // TODO: Make this more robust to handle UI changes - currently have to attach local tracks after video grid is re-ordered
      if (this.props.hasJoinedRoom && this.state.localMediaAvailable) {
        this.setLocalTracks();
      }
    });
    
    publication.on('unsubscribed', (track: Video.RemoteTrack) => {
      track.off('disabled', this.onRemoteParticipantMuted);
      track.off('enabled', this.onRemoteParticipantUnMuted);
      this.detachTrack(track);
    });
  }

  onRemoteParticipantMuted = (track: any) => {
    console.log('Remote participant muted');
    // Update UI when remote participant muted
  }

  onRemoteParticipantUnMuted = (track: any) => {
    console.log('Remote participant unmuted');
    // Upddate UI when remote participant unmuted
  }

  trackUnpublished = (publication: any) => {
    if (this.props.hasJoinedRoom && this.state.localMediaAvailable) {
      this.setLocalTracks();
    }
    // TODO: Detach the tracks
  }

  onParticipantConnected = (participant: Video.RemoteParticipant) => {
    this.props.participantJoinedVideo(participant);
    
    participant.tracks.forEach((publication: any) => {
      this.onTrackPublished(publication, participant.identity);
    });

    participant.on('trackPublished', (publication: RemoteTrackPublication) => {
      // Not actually using this at the moment
      if (publication.isSubscribed) {
        return;
      }
    });
    participant.on('trackUnpublished', this.trackUnpublished);
  }

  onParticipantDisconnected = (participant: RemoteParticipant) => {
    console.log('Participant left the room: ' + participant.identity);
    this.detachParticipantTracks(participant);
    if (this.state.activeRoom.participants && this.state.activeRoom.participants.size === 0) {
      // TODO: detect if local video tile is removed, and reconnect it
      this.setLocalTracks();
    }
    this.props.participantLeftVideo(participant);
  }

  onRoomDisconnected = (room: Video.Room, error: TwilioError) => {
    // Not currently using this
    console.warn('Disconnected from the room');
    if (error.code === 20104) {
      console.error('Signaling reconnection failed due to expired AccessToken!');
    } else if (error.code === 53000) {
      console.error('Signaling reconnection attempts exhausted!');
    } else if (error.code === 53204) {
      console.error('Signaling reconnection took too long!');
    }
    this.onRoomLeft();
  }

  onRoomLeft = () => {
    console.error('Left the room');
    this.detachTrack(this.state.localAudioTrack);
    this.detachTrack(this.state.localVideoTrack);
    // TODO: leftRoom should also set participants to {}
    this.props.leftRoom();
    this.setState({
      ...this.state,
      activeRoom: {} as Room,
      localMediaAvailable: false,
      localAudioTrack: {} as LocalAudioTrack,
      localVideoTrack: {} as LocalVideoTrack
    });
  }

  onRoomReconnecting = (error: TwilioError) => {
    // TODO: Use this info to display reconnecting message to UI
    console.warn('Reconnecting to the room');
    if (error.code === 53001) {
      console.error('Reconnecting your signaling connection!', error.message);
    } else if (error.code === 53405) {
      console.error('Reconnecting your media connection!', error.message);
    }
  }

  onRoomReconnected = () => {
    console.warn('Reconnected to room');
    // TODO: use this info to display reconnected message to UI
  }

  onDominantSpeakerChanged = (dominantSpeaker: RemoteParticipant) => {
    if (dominantSpeaker) {
      console.log('active speaker is now ' + dominantSpeaker.identity);
      // TODO: Move dominantSpeaker to the store
      this.setState({
        ...this.state,
        dominantSpeaker: dominantSpeaker
      });
    }
  }

  leaveRoomIfJoined = () => {
    this.props.leaveRoom();
    console.log('Leaving room');
    this.stopLocalAudioTrack();
    this.stopLocalVideoTrack();
    if (this.state.activeRoom && this.state.activeRoom.state === 'connected') {
      this.state.activeRoom.disconnect();
    }
  }

  stopLocalVideoTrack = () => {
    if (this.state.localVideoTrack && this.state.localVideoTrack.isStarted) {
      this.state.localVideoTrack.stop();
      this.state.localVideoTrack.detach();
    }
  }

  stopLocalAudioTrack = () => {
    if (this.state.localAudioTrack && this.state.localAudioTrack.isStarted) {
      this.state.localAudioTrack.stop();
      this.state.localAudioTrack.detach();
    }
  }

  muteAudio = () => {
    this.state.localAudioTrack.disable();
    this.setState({
      ...this.state,
      isAudioMuted: true
    });
  }

  unMuteAudio = () => {
    this.state.localAudioTrack.enable();
    this.setState({
      ...this.state,
      isAudioMuted: false
    });
  }

  muteVideo = () => {
    this.state.localVideoTrack.disable();
    this.setState({
      ...this.state,
      isVideoMuted: true
    });
  }

  unMuteVideo = () => {
    this.state.localVideoTrack.enable();
    this.setState({
      ...this.state,
      isVideoMuted: false
    });
  }   

  getLocalUserVideoTile = () => {
    const localUserTile = {
      participantId: 'local-media',
      isLocal: true,
      isDominantSpeaker: true,
      audioTracks: this.state.localParticipant.audioTracks,
      videoTracks: this.state.localParticipant.videoTracks,
      ref: this.localMedia,
      label: 'My Video',
      videoToggle: this.state.isVideoMuted ? this.unMuteVideo : this.muteVideo,
      audioToggle: this.state.isAudioMuted ? this.unMuteAudio : this.muteAudio
    };
    return localUserTile;
  }

  getHeight = () => {
    let height: number = 0;
    switch (this.props.meetingType) {
      case SMALL_GROUP_VIDEO:
        return this.props.height;
      case SMALL_GROUP_ACTIVITY:
        return this.props.height / 4;
      case MEDIUM_GROUP_ACTIVITY:
      case MEDIUM_GROUP_VIDEO:
        return this.props.height;
      default:
        return this.props.height;
    }
  }

  render () {
    let audioToggle: any = null;
    let videoToggle: any = null;

    if (this.state.localMediaAvailable) {
      audioToggle = (this.state.isAudioMuted) ? this.unMuteAudio : this.muteAudio;
      videoToggle = (this.state.isVideoMuted) ? this.unMuteVideo : this.muteVideo;
    }
    // TODO: Audio / Video Preview / Test buttons for testing local video and audio
    
    if (this.props.isJoiningRoom || this.props.hasJoinedRoom) {
      return (
        <LocalVideo
            height={this.getHeight()}
            localUserTile={this.getLocalUserVideoTile()}
            leaveRoom={this.leaveRoomIfJoined}
            isAudioMuted={this.state.isAudioMuted}
            audioToggle={audioToggle}
            isVideoMuted={this.state.isVideoMuted}
            videoToggle={videoToggle}
          />
      );
    }
    else {
      return (
        <JoinGrid
            gridHeight={this.getHeight()}
            joinRoom={this.onJoinRoom}
            roomId={this.props.roomId}
          />
      );
    }
  }
}

const mapStateToProps = (state: any) => {
  return {
    userId: state.room.userId,
    meetingType: state.room.meetingType,
    roomId: state.room.roomId,
    width: state.room.width,
    height: state.room.height,
    isJoiningRoom: state.room.isJoiningRoom,
    hasJoinedRoom: state.room.hasJoinedRoom,
    isLeavingRoom: state.room.isLeavingRoom,
    hasLeftRoom: state.room.hasLeftRoom,
    participants: state.room.participants
   };
}

export default connect(mapStateToProps, { setUserId, joinRoom, joinedRoom, leaveRoom, leftRoom, participantsUpdated, participantJoinedVideo, participantLeftVideo, })(VideoContainer);

/*
  getDominantSpeakerVideoTile = () => {
    let dominantSpeakerTile: UserVideoTile;
    const dominantSpeakerId: string = (this.state.dominantSpeaker) ? this.state.dominantSpeaker.identity : '';
    if (dominantSpeakerId && this.props.participants && this.props.participants.size > 0) {
      this.props.participants.forEach((participant: Participant, key: string) => {
        if (dominantSpeakerId === participant.identity) {
          const dominantRef: React.RefObject<HTMLVideoElement> = React.createRef();
          this.remoteMedia.set(key, dominantRef);
          dominantSpeakerTile = {
            participantId: participant.identity,
            isLocal: false,
            isDominantSpeaker: true,
            audioTracks: participant.audioTracks,
            videoTracks: participant.videoTracks,
            ref: dominantRef,
            label: 'Active Speaker',
            videoToggle: null,
            audioToggle: null
          };
          return dominantSpeakerTile;
        }
        else {
          console.warn('did NOT find dominant speaker in participant list!');
        }
      });
    }
    return null;
  }
*/
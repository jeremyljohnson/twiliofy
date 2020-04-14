import React from 'react';
import { connect } from 'react-redux';
import CommonUtility from '../utils/common-utility';
import history from '../history';
// import Constants from '../constants';
import { SMALL_GROUP_VIDEO, SMALL_GROUP_ACTIVITY, MEDIUM_GROUP_VIDEO, MEDIUM_GROUP_ACTIVITY } from '../constants';
import VideoContainer from './video-container';
import Header from './header';
import RemoteVideoContainer from './remote-video-container';
import Grid from '@material-ui/core/Grid';
import { setRoomId, setMeetingType, setRoomDimensions } from '../actions';

interface OuterContainerProps {
  match?: any;
  roomId: string;
  meetingType: string;
  isJoiningRoom: boolean;
  hasJoinedRoom: boolean;
  setRoomId: (roomId: string) => void;
  setMeetingType: (meetingType: string) => void;
  setRoomDimensions: (width: number, height: number) => void;
}

interface OuterContainerState {
}

class OuterContainer extends React.Component <OuterContainerProps, OuterContainerState> {
  
  // Outer container will receive any params, and will manage selecting different types of meetings
  // SMALL_GROUP_VIDEO, MEDIUM_GROUP_VIDEO, SMALL_GROUP_ACTIVITY, MEDIUM_GROUP_ACTIVITY
  constructor(props: OuterContainerProps) {
    super(props);
    // TODO: allow layout selection
  }

  componentDidMount () {
    this.updateDimensions();

    let roomId: string = this.props.match.params.id;
    if (!roomId) {
      roomId = CommonUtility.getUuid();
      history.push('/' + roomId);
    }
    else if (this.props.roomId !== roomId) {
      this.props.setRoomId(roomId);
      // TODO: Allow this to be user-selectable:
      this.props.setMeetingType(SMALL_GROUP_ACTIVITY);
    }
    window.addEventListener('resize', this.updateDimensions);
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateDimensions);
  }

  updateDimensions = () => {
    this.props.setRoomDimensions(window.innerWidth, window.innerHeight);
  }

  // <Box width={1} height={1}>
  // </Box>

  render() {
    
    const joiningOrJoined: boolean = (this.props.hasJoinedRoom || this.props.isJoiningRoom);
    const videoContainerSize: any = joiningOrJoined ? 3 : 12;
    
    return (
        <Grid container spacing={0}>
          <Grid item xs={12} >
            <Header />
          </Grid>
          <Grid container spacing={0} >
            <Grid item xs={videoContainerSize} >
              <VideoContainer />
            </Grid>
            { joiningOrJoined ? 
              <Grid item xs={6}>
                <div>Active speaker should go here</div>
              </Grid>
              : null
            }
            { joiningOrJoined ? 
                <Grid item xs={3}>
                  <RemoteVideoContainer />
                </Grid>
                : null
            }
            
          </Grid>
        </Grid>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    roomId: state.room.roomId,
    meetingType: state.room.meetingType,
    isJoiningRoom: state.room.isJoiningRoom,
    hasJoinedRoom: state.room.hasJoinedRoom
   };
}

export default connect(mapStateToProps, { setRoomId, setMeetingType, setRoomDimensions })(OuterContainer);
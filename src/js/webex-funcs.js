
let credentials = {
    logger: { level: "debug" },
    credentials : { access_token: token }
};

const webex = (window.webex = Webex.init(credentials));

let currentMeeting;
let addLock;
let inMeeting = false;
let sdkCameraStream;
let sdkMicrophoneStream;
let sdkDisplayStream = {};

webex.once("ready", () => {
    customLog(`webex object ready ${webex.version}`);
    finalizeWebexAuth(webex);
});

function finalizeWebexAuth(webex){
    if (webex.canAuthorize) {
        customLog("User Authenticated");
        webex.meetings.register().then((data) => {
            customLog("Webex registration done.");
            if(qAuto){
                customLog("Automatically starting meeting");
                launchWebex(qMeeting);
            } else {
                hideLoadingIcon();
                showShareButton();
            }
            webex.meetings.on('meeting:removed', (event) => {
                customLog('meeting:removed event');
                customLog(event);
                if(currentMeeting && currentMeeting.id === event.meetingId){
                    reset();
                }
            });
            
        }).catch(err => {
            customLog(err);
            customLog("Error registering, redirecting to login...");
            window.location = "/oauth";
        });
    }
}

function launchWebex(meetingInput){
    showLoadingIcon();
    return webex.meetings.create(meetingInput).then(async(meeting) => {
        customLog("Meeting Created:");
        customLog(meeting);
        bindMeetingEvents(meeting);
        callStartUI();
        enableShareButton();
        customLog("Joining meeting...")
        await meeting.join();
        customLog("Returning from webex.meetings.create().")
        return;
    }).catch((error) => {
        customLog("webex.meetings.create() Error:");
        customLog(error);
        updateErrorSpan(error);
        callEndUI();
        enableShareButton();
    });
}

function casteNewStreams(){
    sdkCameraStream = new webex.meetings.mediaHelpers.LocalCameraStream(sdkDisplayStream.video.outputStream);
    if(sdkDisplayStream.audio?.outputStream){
        sdkMicrophoneStream = new webex.meetings.mediaHelpers.LocalMicrophoneStream(sdkDisplayStream.audio.outputStream);
    }
}

async function startScreenShare() {
    // Using async/await to make code more readable
    customLog('startScreenShare()');
    try {
      const [localShareVideoStream, localShareAudioStream] = await webex.meetings.mediaHelpers.createDisplayStreamWithAudio();
  
      sdkDisplayStream.video = localShareVideoStream;
  
      sdkDisplayStream.video.on('stream-ended', () => {
        customLog('startScreenShare() :: local share video stream ended');
        document.getElementById('self-view').srcObject=null;
        // sdkDisplayStream.video = undefined;
      });
  
      sdkDisplayStream.audio = localShareAudioStream;
  
      sdkDisplayStream.audio?.on('stream-ended', () => {
        customLog('startScreenShare() :: local share audio stream ended');
        // sdkDisplayStream.audio = undefined;
        // meetingStreamsLocalShareAudio.srcObject = null;
      });
    
      document.getElementById('self-view').srcObject=localShareVideoStream.outputStream;
      customLog('startScreenShare() :: Started.');
      return true;
    } catch (error) {
      customLog('startScreenShare() :: Error starting screen share!');
      customLog(error);
      return false;
    }
  }


  function stopScreenShare(){
    try{
        let tracks = sdkDisplayStream.video?.outputStream?.getTracks();
        if(tracks && tracks.length > 0){
            tracks[0].stop();
        }
    } catch (e){
        customLog('stopScreenShare Error:');
        customLog(e);
    }
  }

  async function unpublishAllStreams() {
    customLog('unpublishAllStreams()');
    try {
      let streamsToUnpublish = [];
      if(sdkDisplayStream.audio) {
        streamsToUnpublish.push(sdkDisplayStream.audio);
      }
      if(sdkDisplayStream.video) {
        streamsToUnpublish.push(sdkDisplayStream.video);
      }
      if(sdkCameraStream){
        streamsToUnpublish.push(sdkCameraStream);
      }
      if(sdkMicrophoneStream){
        streamsToUnpublish.push(sdkMicrophoneStream);
      }
      if (streamsToUnpublish.length && currentMeeting) {
        await currentMeeting.unpublishStreams(streamsToUnpublish);
      }
      customLog('unpublishAllStreams() :: unpublished share stream!');
    }
    catch (error) {
      customLog('unpublishAllStreams() :: Error unpublishing share stream!');
      customLog(error);
    }
  }

  function reset(){
    //MAYBE todo: There's a focus issue if screenshare hasn't started before user clicks away I think (like to admit manually from same machine)
    //      a. I think the solution would be to popup a message that says something like:
    //       "Follow your browser's prompt to start the screen share. If you don't see one, click here" + a button.
    inMeeting = false;
    try{
        callEndUI();
        stopScreenShare();
        unpublishAllStreams();
        unbindMeetingEvents(currentMeeting);
    }catch(e){
        customLog("reset() failure:");
        customLog(e);
    }
    
    currentMeeting = null;
    sdkCameraStream = null;
    sdkMicrophoneStream = null;
    sdkDisplayStream = {};

    document.getElementById('remote-view-video').srcObject = null;
    document.getElementById('self-view').srcObject = null;
  }



async function addMediaToMeeting(){
    if(currentMeeting){
        await addMedia(currentMeeting);
    } else {
        customLog("NO CURRENT MEETING TO ADD MEDIA!")
        //TODO: Error message;
    }
}


async function addMedia(meeting){
    if(!inMeeting){
        if(!addLock){
            addLock = true;
            hideReadyMessage();
            hideLobbyMessage();
            showLoadingIcon();
            let result = await startScreenShare();
            if(result){
                casteNewStreams();
                meeting.addMedia({
                    allowMediaInLobby: true,
                    shareAudioEnabled: true,
                    shareVideoEnabled: true,
                    localStreams: {
                        //microphone: localMedia.microphoneStream,
                        camera: sdkCameraStream,
                        screenShare: {
                            //audio: localMedia.screenShare?.audio,
                            video: sdkDisplayStream.video
                        }
                    }
                }).then(() => {
                    addLock = false;
                    inMeeting = true;
                    customLog('addMedia() :: successfully added media!');
                }).catch((error) => {
                    addLock = false;
                    customLog('addMedia() :: Error adding media!');
                    customLog(error);
                });
            } else {
                addLock = false;
                hideLoadingIcon();
                showReadyMessage();
            }
        } else {
            customLog("Skipping due to addLock.");
        }
    } else {
        customLog("Not doing addMedia(), user already inMeeting!");
    }
}


function bindMeetingEvents(meeting) {
    currentMeeting = meeting;
    customLog('Binding meeting events for', meeting);
    //meeting.setMeetingQuality('HIGH');
    meeting.on("error", err => {
        console.error("<Meeting error> -", err);
    });

    //meeting:stateChange
    meeting.on('meeting:stateChange', async (payload) => {
        customLog("<meeting:stateChange>", payload);
        let currentState = payload.payload.currentState;
        customLog(`currentState:${currentState}`);
        if (currentState === "TERMINATING"){
            reset();
        }
    });

    meeting.on('meeting:removed', (payload) => {
        customLog('<meeting:removed>');
        reset();
    });

    meeting.on('meeting:locked', () => {
        customLog('<meeting:locked>');
    });

    meeting.on('meeting:unlocked', () => {
        customLog('<meeting:unlocked>');
    });

    meeting.on('meeting:self:lobbyWaiting', (payload) => {
        customLog('<meeting:self:lobbyWaiting>');
        customLog('User is guest to space, waiting to be admitted, wait to use addMedia');
        customLog(payload.payload);
        customLog(meeting);
        hideLoadingIcon();
        showLobbyMessage();
        inMeeting = false;
    });

    meeting.on('meeting:actionsUpdate', (payload) => {
        customLog(`meeting:actionsUpdate - ${JSON.stringify(payload)}`);
    });

    meeting.on('meeting:reconnectionStarting', () => {
        customLog('<meeting:reconnectionStarting>');
    });

    meeting.on('meeting:reconnectionSuccess', () => {
        customLog('<meeting:reconnectionSuccess>');
    });

    meeting.on('meeting:reconnectionFailure', () => {
        customLog('<meeting:reconnectionFailure>');
    });

    meeting.on('meeting:self:guestAdmitted', async() => {
        customLog('<meeting:self:guestAdmitted>');
        customLog('Admitted to meeting as guest to call');
        //return addMedia(meeting);
        await addMedia(meeting);
    });

    meeting.on('meeting:self:left', (payload) => {
        customLog(`<meeting:self:left> - ${JSON.stringify(payload)}`);
    });

    meeting.on('meeting:self:mutedByOthers', () => {
        customLog('<meeting:self:mutedByOthers>');
    });

    meeting.on('meeting:self:unmutedByOthers', () => {
        customLog('<meeting:self:unmutedByOthers>');
        customLog("autoUnmute is Enabled, unmuting at the request of host.");
        //meeting.unmuteAudio();
    });

    meeting.on('meeting:self:requestedToUnmute', () => {
        customLog('<meeting:self:requestedToUnmute>');
        customLog("autoUnmute is Enabled, unmuting at the request of host.");
        //meeting.unmuteAudio()
    });

    meeting.on('meeting:stoppedSharingLocal', (payload) => {
        customLog(`<meeting:stoppedSharingLocal> - ${JSON.stringify(payload)}`);
        //isSharing = false;
        //document.getElementById('self-share').srcObject = null;
    });

    meeting.on('meeting:startedSharingLocal', (payload) => {
        customLog(`<meeting:startedSharingLocal> - ${JSON.stringify(payload)}`);
    });

    meeting.on('meeting:startedSharingRemote', (payload) => {
        customLog(`<meeting:startedSharingLocal> - ${JSON.stringify(payload)}`);
    });

    meeting.on('meeting:stoppedSharingRemote', (payload) => {
        customLog(`<meeting:stoppedSharingRemote> - ${JSON.stringify(payload)}`);
    });


    // Handle media streams changes to ready state
    meeting.on("media:ready", media => {
        customLog('media:ready', media);
        if (!media) {
            return;
        }
        if (media.type === 'remoteVideo') {
            hideLoadingIcon();
            document.getElementById('remote-view-video').srcObject = media.stream;
        }
        // if (media.type === 'remoteAudio') {
        //     document.getElementById('remote-view-audio').srcObject = media.stream;
        // }
    });

    // Handle media streams stopping
    meeting.on("media:stopped", media => {
        customLog('media:stopped', media);
        if (media.type === 'remoteVideo') {
            document.getElementById('remote-view-video').srcObject = null;
        }
        // if (media.type === 'remoteAudio') {
        //     document.getElementById('remote-view-audio').srcObject = null;
        // }
    });

    //careful - this event is on meeting.members, not meeting.
    meeting.members.on('members:update', async(payload) => {
        customLog("<members:update>", payload);
        if(payload.delta.updated){
            for(let user of payload.delta.updated){
                if(user.isSelf){
                    customLog("I am the updated user");
                    if(user.status === "IN_MEETING" && !inMeeting){
                        customLog("adding my media.");
                        await addMedia(meeting);
                    }
                }
            }
        }
        if(payload.delta.added){
            for(let user of payload.delta.added){
                if(user.isSelf){
                    customLog("I am the added user");
                    if(user.status === "IN_MEETING" && !inMeeting){
                        customLog("adding my media.");
                        await addMedia(meeting);
                    }
                }
            }
        }
    });
}

function unbindMeetingEvents(meeting) {
    currentMeeting = null;
    customLog('Unbinding meeting events for', meeting);
    meeting.off("error");
    meeting.off('meeting:stateChange');
    meeting.off('meeting:ringing');
    meeting.off('meeting:ringingStop');
    //meeting.off('meeting:added');
    meeting.off('meeting:removed');
    meeting.off('meeting:locked');
    meeting.off('meeting:unlocked');
    meeting.off('meeting:self:lobbyWaiting');
    meeting.off('meeting:actionsUpdate');
    meeting.off('meeting:reconnectionStarting');
    meeting.off('meeting:reconnectionSuccess');
    meeting.off('meeting:reconnectionFailure');
    meeting.off('meeting:self:guestAdmitted');
    meeting.off('meeting:self:left');
    meeting.off('meeting:self:mutedByOthers');
    meeting.off('meeting:self:unmutedByOthers');
    meeting.off('meeting:self:requestedToUnmute');
    meeting.off('meeting:stoppedSharingLocal');
    meeting.off('meeting:startedSharingLocal');
    meeting.off('meeting:startedSharingRemote');
    meeting.off('meeting:stoppedSharingRemote');
    meeting.off("media:ready");
    meeting.off("media:stopped");
    meeting.members.off('members:update');
}

function leaveMeeting(){
    try{
        if(currentMeeting){
          currentMeeting.leave();
        }
    }catch(e){
        customLog(" webex-funcs leaveMeeting() Exception:");
        customLog(e);
    }
    reset();
}
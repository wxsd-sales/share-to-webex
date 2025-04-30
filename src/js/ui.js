  function updateErrorSpan(text){
    if(!text){
      text = "";
    } else {
      customLog(`updateErrorSpan text:${text}`);
    }
    document.getElementById("error-span").innerText = text;
  }
  
  function showHangupButton(){
    document.getElementById("share-button").style.display = "none";
    document.getElementById("hangup").style.display = "block";
  }
  
  function showShareButton(){
    document.getElementById("hangup").style.display = "none";
    document.getElementById("share-button").style.display = "block";
  }

  function enableShareButton(){
    document.getElementById("share-button").disabled = false;
  }
  
  function showMeetingContent(){
    document.getElementById("meeting-div").style.display = "block";
  }
  
  function hideMeetingContent(){
    document.getElementById("meeting-div").style.display = "none";
  }

  function showLoadingIcon(){
    //document.getElementById("meet-content").style.display = "none";
    document.getElementById("loading-icon").style.display = "block";
  }
  
  function hideLoadingIcon(){
    document.getElementById("loading-icon").style.display = "none";
  }

  function hideLobbyMessage(){
    document.getElementById("lobby-message").style.display = "none";
  }

  function showLobbyMessage(){
    document.getElementById("lobby-message").style.display = "block";
  }

  function hideReadyMessage(){
    document.getElementById("ready-message").style.display = "none";
  }

  function showReadyMessage(){
    document.getElementById("ready-message").style.display = "block";
  }
  
  function callStartUI(){
    // hideLoadingIcon();
    showHangupButton();
    showMeetingContent();
  }
  
  function callEndUI(){
    hideLobbyMessage();
    hideReadyMessage();
    hideLoadingIcon();
    showShareButton();
    hideMeetingContent();
  }


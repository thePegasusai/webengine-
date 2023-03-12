// index.html

<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>WebRTC Video Stream</title>
  </head>
  <body>
    <video id="localVideo" autoplay muted></video>
    <video id="remoteVideo" autoplay></video>

    <script>
      const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      const dataChannelOptions = { ordered: true };

      let localStream;
      let remoteStream;
      let dataChannel;
      let peerConnection;

      // Set up the local video stream
      async function setupLocalStream() {
        try {
          localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          const localVideo = document.getElementById('localVideo');
          localVideo.srcObject = localStream;
        } catch (error) {
          console.error('Error setting up local stream:', error);
        }
      }

      // Set up the WebRTC peer-to-peer connection
      function setupPeerConnection() {
        peerConnection = new RTCPeerConnection(configuration);

        // Add the local stream to the peer connection
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });

        // Set up the remote video stream
        peerConnection.ontrack = handleRemoteStreamAdded;

        // Set up the data channel
        dataChannel = peerConnection.createDataChannel('streamDataChannel', dataChannelOptions);
        dataChannel.onopen = handleDataChannelOpen;

        // Set up the ICE candidate exchange
        peerConnection.onicecandidate = handleIceCandidate;
        peerConnection.onnegotiationneeded = handleNegotiationNeeded;
      }

      // Handle the addition of the remote video stream
      function handleRemoteStreamAdded(event) {
        remoteStream = event.streams[0];
        const remoteVideo = document.getElementById('remoteVideo');
        remoteVideo.srcObject = remoteStream;
      }

      // Handle the data channel opening
      function handleDataChannelOpen() {
        console.log('Data channel opened');
      }

      // Handle ICE candidates
      function handleIceCandidate(event) {
        if (event.candidate) {
          console.log('ICE candidate:', event.candidate);
          dataChannel.send(JSON.stringify({ type: 'iceCandidate', payload: event.candidate }));
        }
      }

      // Handle negotiation needed
      async function handleNegotiationNeeded() {
        console.log('Negotiation needed');
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        dataChannel.send(JSON.stringify({ type: 'offer', payload: offer }));
      }

      // Start the WebRTC peer-to-peer connection
      setupPeerConnection();

      // Set up the local video stream and start the connection
      setupLocalStream().then(() => {
        console.log('Local stream set up');
        peerConnection.createOffer().then((offer) => {
          peerConnection.setLocalDescription(offer);
          dataChannel.send(JSON.stringify({ type: 'offer', payload: offer }));
        });
      });

      // Handle incoming WebRTC messages
      dataChannel.onmessage = async (event) => {
        const { type, payload } = JSON.parse(event.data);
        switch (type) {
          case 'offer':
            peerConnection.setRemoteDescription(payload);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            dataChannel.send(JSON.stringify({ type: 'answer', payload:

// index.html

<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Agora Video Streaming</title>
  </head>
  <body>
    <div id="localStream"></div>
    <div id="remoteStream"></div>

    <script src="https://cdn.agora.io/sdk/release/AgoraRTCSDK-4.6.0.js"></script>
    <script>
      const appId = 'YOUR_APP_ID_HERE';
      const channel = 'YOUR_CHANNEL_NAME_HERE';
      let client;
      let localStream;
      let remoteStream;

      // Initialize the Agora client
      function initClient() {
        client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        client.init(appId, () => {
          console.log('AgoraRTC client initialized');
        }, (error) => {
          console.error('Error initializing AgoraRTC client:', error);
        });
      }

      // Join the Agora channel
      function joinChannel() {
        client.join(null, channel, null, (uid) => {
          console.log(`AgoraRTC client joined channel ${channel} with uid ${uid}`);

          // Create the local stream and publish it to the channel
          localStream = AgoraRTC.createStream({ streamID: uid, audio: true, video: true });
          localStream.init(() => {
            localStream.play('localStream');
            client.publish(localStream, (error) => {
              console.error('Error publishing local stream:', error);
            });
          }, (error) => {
            console.error('Error initializing local stream:', error);
          });
        }, (error) => {
          console.error('Error joining channel:', error);
        });
      }

      // Subscribe to the remote stream
      function subscribeToRemoteStream(event) {
        const uid = event.uid;
        remoteStream = AgoraRTC.createStream({ streamID: uid, audio: true, video: true });
        client.subscribe(remoteStream, (error) => {
          console.error('Error subscribing to remote stream:', error);
        });
        remoteStream.on('playing', () => {
          remoteStream.play('remoteStream');
        });
      }

      // Leave the Agora channel
      function leaveChannel() {
        client.leave(() => {
          console.log('AgoraRTC client left channel');
          localStream.stop();
          localStream.close();
          remoteStream.stop();
          remoteStream.close();
        }, (error) => {
          console.error('Error leaving channel:', error);
        });
      }

      // Initialize the Agora client and join the channel
      initClient();
      joinChannel();

      // Listen for remote stream events
      client.on('stream-added', subscribeToRemoteStream);

      // Listen for remote stream removal events
      client.on('stream-removed', (event) => {
        console.log(`Remote stream ${event.stream.getId()} has been removed`);
        event.stream.stop();
        event.stream.close();
      });
    </script>
  </body>
</html>

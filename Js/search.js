// search.js

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const dataChannelOptions = { ordered: true };

let dataChannel;
let peerConnection;

// Create the WebRTC peer-to-peer connection
function createPeerConnection() {
  peerConnection = new RTCPeerConnection(configuration);

  // Set up the data channel
  dataChannel = peerConnection.createDataChannel('searchDataChannel', dataChannelOptions);
  dataChannel.onmessage = handleDataChannelMessage;
  dataChannel.onopen = handleDataChannelOpen;

  // Set up the ICE candidate exchange
  peerConnection.onicecandidate = handleIceCandidate;
  peerConnection.onnegotiationneeded = handleNegotiationNeeded;
}

// Handle incoming data channel messages
function handleDataChannelMessage(event) {
  const { type, payload } = JSON.parse(event.data);
  if (type === 'query') {
    crawl(payload);
  }
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

// Crawl a given URL and return the HTML content and links
async function crawl(url) {
  const response = await fetch(url);
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links = Array.from(doc.querySelectorAll('a')).map((link) => link.href);
  dataChannel.send(JSON.stringify({ type: 'results', payload: { html, links } }));
}

// Start the WebRTC peer-to-peer connection
createPeerConnection();

// Handle incoming WebRTC messages
dataChannel.onmessage = (event) => {
  const { type, payload } = JSON.parse(event.data);
  switch (type) {
    case 'offer':
      peerConnection.setRemoteDescription(payload);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      dataChannel.send(JSON.stringify({ type: 'answer', payload: answer }));
      break;
    case 'answer':
      peerConnection.setRemoteDescription(payload);
      break;
    case 'iceCandidate':
      peerConnection.addIceCandidate(payload);
      break;
  }
};

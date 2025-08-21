function createPeer() {
  return new Peer(undefined, {
    host: '/',
    port: 8080, // PeerJS server port
    path: '/peerjs'
  });
}

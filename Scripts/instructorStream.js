document.addEventListener('DOMContentLoaded', async function() {
  const sessionId = new URLSearchParams(window.location.search).get('sessionId');
  if (!sessionId) {
    alert('No streaming session specified');
    window.location.href = '../Pages/profile.html';
    return;
  }

  let stream = null;
  let screenStream = null;
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login');
      window.location.href = '../Pages/LOGIN2.html';
      return;
    }

    // Get stream info from backend (now returns Mux stream key/URL)
    const res = await fetch(`https://backend-pfnoxq.fly.dev/api/stream/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      throw new Error(await res.text());
    }
    
    const { streamKey, rtmpUrl } = await res.json();
    
    // Display stream info (optional)
    document.getElementById('streamKey').textContent = streamKey;
    document.getElementById('serverUrl').textContent = rtmpUrl;
    
    // Get user media
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: true
    });
    
    // Preview stream
    const previewEl = document.getElementById('preview');
    previewEl.srcObject = mediaStream;
    
    // Initialize OBS-like connection to Mux
    let mediaRecorder;
    document.getElementById('startBtn').addEventListener('click', async () => {
      try {
        // For Mux, we use RTMP via MediaRecorder API (simplified example)
        const stream = mediaStream;
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9,opus',
          videoBitsPerSecond: 2500000 // 2.5 Mbps
        });
        
        // This would normally connect via WebSockets or use OBS
        // In a real app, you'd use OBS with the RTMP URL/stream key
        console.log('Simulating Mux connection - use OBS in production');
        console.log('RTMP URL:', rtmpUrl);
        console.log('Stream Key:', streamKey);
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        alert('Configure OBS with:\nServer: ' + rtmpUrl + '\nKey: ' + streamKey);
      } catch (err) {
        console.error('Error starting stream:', err);
        alert('Failed to start stream');
      }
    });
    
    document.getElementById('stopBtn').addEventListener('click', () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        console.log('Streaming stopped');
      }
    });
    
    // Screen share (same as before)
    document.getElementById('screenShareBtn').addEventListener('click', async () => {
      try {
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
          screenStream = null;
          document.getElementById('screenShareBtn').textContent = 'Share Screen';
          previewEl.srcObject = mediaStream;
          return;
        }
        
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        
        previewEl.srcObject = screenStream;
        document.getElementById('screenShareBtn').textContent = 'Stop Sharing';
      } catch (err) {
        console.error('Error sharing screen:', err);
      }
    });
    
  } catch (err) {
    console.error('Error initializing stream:', err);
    alert('Failed to initialize streaming');
  }
});
// main.js
// Initialize the Video.js player with VR plugin

document.addEventListener('DOMContentLoaded', function () {
  var player = videojs('my-360video');

  player.ready(function () {
    console.log('Video.js ready');
  });

  player.on('error', function () {
    console.error('Video.js error:', player.error());
  });

  player.vr({
    projection: '360',
    debug: false,
    forceCardboard: false,
    motionControls: true // Enable device orientation controls on mobile
  });

  // Show Enable Motion Controls button on mobile if needed
  var enableMotionBtn = document.getElementById('enable-motion-btn');
  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    enableMotionBtn.style.display = 'block';
    enableMotionBtn.addEventListener('click', function() {
      DeviceOrientationEvent.requestPermission().then(function(permissionState) {
        if (permissionState === 'granted') {
          // Reload plugin to ensure motion controls are active
          player.vr({
            projection: '360',
            debug: false,
            forceCardboard: false,
            motionControls: true
          });
          enableMotionBtn.style.display = 'none';
        }
      }).catch(console.error);
    });
  } else {
    // On desktop or Android (where permission is not required), hide button
    enableMotionBtn.style.display = 'none';
  }

  // Debug: Log device orientation events
  var orientationDebug = document.getElementById('orientation-debug');
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(event) {
      // Log to console
      console.log('DeviceOrientationEvent:', {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      });
      // Show on screen
      if (orientationDebug) {
        orientationDebug.style.display = 'block';
        orientationDebug.innerHTML =
          '<b>Orientation</b><br>' +
          'α (alpha): ' + (event.alpha !== null ? event.alpha.toFixed(1) : 'n/a') + '<br>' +
          'β (beta): ' + (event.beta !== null ? event.beta.toFixed(1) : 'n/a') + '<br>' +
          'γ (gamma): ' + (event.gamma !== null ? event.gamma.toFixed(1) : 'n/a');
      }
    });
  } else {
    if (orientationDebug) {
      orientationDebug.style.display = 'block';
      orientationDebug.innerHTML = 'DeviceOrientationEvent not supported';
    }
    console.log('DeviceOrientationEvent not supported');
  }
});

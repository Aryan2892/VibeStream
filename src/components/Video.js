import React, { useRef, useState, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import "./Video.css";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const waveformRef = useRef(null);
  const fileInputRef = useRef(null); // Reference for the file input
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [videoTitle, setVideoTitle] = useState("");
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    waveformRef.current = WaveSurfer.create({
      container: "#waveform",
      waveColor: "#6C8DF0",
      progressColor: "#072378",
      cursorWidth: 3,
      height: 100,
      cursorColor: "#072378",
      barWidth: 3,
      barRadius: 3,
    });

    return () => waveformRef.current.destroy();
  }, []);

  useEffect(() => {
    let timer;
    if (showControls) {
      timer = setTimeout(() => {
        setShowControls(false);
      }, 3000); // Hide controls after 3 seconds
    }
    return () => clearTimeout(timer); // Clean up the timer
  }, [showControls]);

  const handlePlayPauseClick = () => {
    setShowControls(true); // Show controls whenever the video or overlay is clicked
    handlePlayPause(); // Call the existing play/pause function
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const video = videoRef.current;
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
        setShowControls(true);

        // Attempt to check for audio track presence
        if (videoRef.current.mozHasAudio ||
            videoRef.current.webkitAudioDecodedByteCount ||
            (videoRef.current.audioTracks && videoRef.current.audioTracks.length)) {
          // There is audio in the video
        } else {
          // No audio in the video
          alert("The video file doesn't have audio, so upload is not possible.");
        }
      };

      await waveformRef.current.load(video.src);
      setIsPaused(true);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click(); // Simulate click on the actual file input
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      waveformRef.current.play();
      setIsPaused(false);
    } else {
      video.pause();
      waveformRef.current.pause();
      setIsPaused(true);
    }
  };

  return (
    <div className="video-player-container">
      <div className="file-input-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          style={{ display: 'none' }} // Hide the actual file input
        />
        <button onClick={handleFileButtonClick} className="green">
          Input your video here
        </button>
      </div>

      <div className="video-section">
        <video ref={videoRef} onClick={handlePlayPauseClick} muted />
        <div className={`overlay ${showControls ? 'visible' : ''}`} onClick={handlePlayPauseClick}>
          <span className="play-pause-button">{isPaused ? '▶️' : '⏸️'}</span>
        </div>
      </div>

      <div className="waveform-section">
        <div id="waveform"></div>
      </div>

      <div className="metadata-section">
        <div className="metadata-heading">Metadata</div>
        {videoDuration > 0 && (
          <div className="metadata-container">
            <p className="title">{videoTitle}</p>
            <p className="duration">Video Duration: {videoDuration.toFixed(2)} seconds</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;

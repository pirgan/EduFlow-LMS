import ReactPlayer from 'react-player';
import { useRef } from 'react';

// Wrapper around react-player with a progress callback fired every 5 seconds.
// Props:
//   url        — video URL (Cloudinary, YouTube, etc.)
//   onProgress — called with elapsed seconds as the student watches
//   onEnded    — called when the video finishes (used to auto-trigger "Mark Complete")
export default function VideoPlayer({ url, onProgress, onEnded }) {
  const lastReported = useRef(0);

  const handleProgress = ({ playedSeconds }) => {
    // Only fire the callback every 5 seconds to avoid excessive state updates
    if (playedSeconds - lastReported.current >= 5) {
      lastReported.current = playedSeconds;
      onProgress?.(Math.floor(playedSeconds));
    }
  };

  return (
    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
      <ReactPlayer
        url={url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
        controls
        width="100%"
        height="100%"
        className="absolute inset-0"
        onProgress={handleProgress}
        onEnded={onEnded}
        config={{ youtube: { playerVars: { modestbranding: 1 } } }}
      />
    </div>
  );
}

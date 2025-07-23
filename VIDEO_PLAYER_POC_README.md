# Video Player POC - LMS Frontend

## Overview
This is a Proof of Concept (POC) video player built with Angular 19 and Video.js. It demonstrates key video player functionality with specific restrictions and features for learning purposes, including HLS streaming, progress tracking, and a video playlist.

## Features Implemented

### ✅ Core Features
- **Play/Pause Controls**: Basic video playback controls
- **HLS Streaming**: Support for HTTP Live Streaming with adaptive bitrate
- **Quality Switching**: Switch between Auto, 360p, 480p, and 720p resolutions
- **Video Playlist**: Sidebar with video thumbnails and selection
- **Progress Tracking**: Automatic progress saving every 10 seconds
- **Resume Functionality**: Resume videos from last watched position
- **Responsive Design**: Works on desktop and mobile devices
- **Video.js Integration**: Professional video player library

### ❌ Restricted Features
- **Forward Seeking Disabled**: Users cannot seek forward in the video
- **Backward Seeking Allowed**: Users can only seek backward or to the current position

### 🎯 POC Learning Objectives
- Understanding Video.js integration with Angular 19
- Implementing HLS streaming with adaptive bitrate
- Managing video quality switching
- Restricting user interactions (forward seeking)
- Progress tracking and resume functionality
- Video playlist implementation
- Responsive design implementation

## Project Structure

```
lms-poc-fe/src/app/
├── components/
│   └── video-player/
│       ├── video-player.component.ts    # Main component logic
│       ├── video-player.component.html  # Template with Video.js integration
│       └── video-player.component.css   # Styling for the video player
├── services/
│   └── video.service.ts                 # API service for video data
├── app.component.ts                     # Main app component
├── app.routes.ts                       # Angular routing
└── app.config.ts                       # App configuration
```

## Key Code Sections Explained

### 1. Video.js Player Initialization
```typescript
// In video-player.component.ts - initializeVideoPlayer() method
const playerOptions = {
  controls: true, // Enable default controls
  fluid: true, // Make player responsive
  responsive: true,
  controlBar: {
    children: [
      'playToggle', // Play/Pause button
      'volumePanel', // Volume control
      'currentTimeDisplay', // Current time display
      'timeDivider', // Time divider
      'durationDisplay', // Duration display
      'progressControl', // Progress bar (seek will be disabled)
      'liveDisplay', // Live indicator
      'remainingTimeDisplay', // Remaining time
      'customControlSpacer', // Spacer
      'fullscreenToggle' // Fullscreen button
    ]
  },
  userActions: {
    hotkeys: function(event: any) {
      // Disable keyboard shortcuts for seeking
      if (event.code === 'ArrowRight' || event.code === 'ArrowLeft') {
        event.preventDefault();
        return false;
      }
      return true;
    }
  }
};
```

### 2. Forward Seeking Prevention
```typescript
// In video-player.component.ts - setupPlayerEventListeners() method
this.player.on('seeking', () => {
  // Allow resuming from timestamp
  if (this.isResumingFromTimestamp) {
    this.isResumingFromTimestamp = false;
    this.lastAllowedTime = this.player.currentTime();
    return;
  }
  
  // Allow small jumps (e.g., <2s) for HLS logic
  if (this.player.currentTime() > this.lastAllowedTime + 2) {
    this.player.currentTime(this.lastAllowedTime);
    console.log('Forward seeking disabled');
  }
});
```

### 3. HLS Video Source Management
```typescript
// In video-player.component.ts - setVideoSource() method
private setVideoSource(quality: string): void {
  let videoUrl = this.BASE_URL + this.VIDEO_ID + "/" + quality + "/index.m3u8";
  if(quality === "auto"){
    videoUrl = this.BASE_URL + this.VIDEO_ID + "/index.m3u8";
  }

  this.player.src({
    src: videoUrl,
    type: 'application/x-mpegURL'
  });
}
```

### 4. Progress Tracking
```typescript
// In video-player.component.ts - sendProgress() method
sendProgress() {
  if (!this.VIDEO_ID || !this.player) {
    return;
  }

  const currentTime = this.player.currentTime();
  
  if (currentTime > 0) {
    this.videoService.sendVideoProgress(this.VIDEO_ID, currentTime).subscribe(
      (response) => {
        console.log('Progress sent successfully:', response);
      },
      (error) => {
        console.error('Error sending progress:', error);
      }
    );
  }
}
```

## How to Run the POC

### Prerequisites
- Node.js (v18 or higher)
- Angular CLI
- Backend server running on `http://localhost:2000`

### Installation Steps
1. Navigate to the project directory:
   ```bash
   cd lms-poc-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:4200`

## Usage Instructions

### Video Controls
- **Play/Pause**: Use the play/pause button or video player controls
- **Volume**: Use the volume slider in the video player
- **Fullscreen**: Click the fullscreen button in the video player
- **Quality Selection**: Use the quality buttons in the control bar

### Video Playlist
- **Video Selection**: Click on any video in the sidebar playlist
- **Thumbnail Display**: Each video shows a thumbnail and duration
- **Auto-resume**: Videos automatically resume from last watched position

### Quality Selection
- **Auto**: Adaptive bitrate streaming (recommended)
- **720p**: High quality (requires good connection)
- **480p**: Medium quality
- **360p**: Low quality (good for slow connections)

### Seeking Restrictions
- **Forward Seeking**: Disabled - you cannot seek forward in the video
- **Backward Seeking**: Allowed - you can seek backward or to the current position
- **Progress Bar**: Shows current position but forward seeking is blocked

## Technical Implementation Details

### Video.js Integration
- Uses Video.js v8.23.3
- HLS streaming support with adaptive bitrate
- Custom player configuration with specific controls
- Event listeners for player state management
- Responsive design with fluid layout

### Angular 19 Architecture
- Standalone components with proper lifecycle management
- ViewChild decorator for direct DOM access
- OnDestroy hook for proper cleanup
- TypeScript interfaces for type safety
- Tailwind CSS for styling

### HLS Streaming
- HTTP Live Streaming implementation
- Adaptive bitrate for optimal quality
- Multiple quality levels (Auto, 720p, 480p, 360p)
- M3U8 playlist format support

### Progress Tracking
- Automatic progress saving every 10 seconds
- Progress sent on video end
- Progress saved on page unload/visibility change
- Resume functionality from last position

## Learning Points for Actual Product

### 1. Video Player Integration
- How to integrate Video.js with Angular 19
- Proper component lifecycle management
- Event handling and state management
- HLS streaming implementation

### 2. Custom Controls
- Creating custom video controls
- Quality switching implementation
- Playback state management
- Progress tracking

### 3. User Restrictions
- Implementing forward seeking prevention
- Overriding native browser behavior
- Maintaining user experience while adding restrictions

### 4. Video Playlist
- Sidebar video selection
- Thumbnail display
- Video switching with state preservation

### 5. Progress Management
- Automatic progress tracking
- Resume functionality
- API integration for progress saving

### 6. Responsive Design
- Mobile-friendly video player
- Adaptive layouts with Tailwind CSS
- Touch-friendly controls

## Future Enhancements for Production

### 1. Advanced Features
- Subtitle support
- Picture-in-picture mode
- Keyboard shortcuts
- Video analytics

### 2. Analytics and Tracking
- Video engagement metrics
- Quality switching analytics
- Error tracking and reporting
- User behavior analysis

### 3. Security Features
- DRM support
- Content protection
- Access control
- Token-based authentication

### 4. Performance Optimization
- Lazy loading
- Preloading strategies
- Memory management
- CDN integration

## Dependencies Used

```json
{
  "video.js": "^8.23.3",
  "@types/video.js": "^7.3.58",
  "@angular/core": "^19.2.0",
  "tailwindcss": "^4.1.11"
}
```

## API Endpoints

The application expects a backend API running on `http://localhost:2000` with the following endpoints:

- `GET /api/video/getAllVideos` - Fetch all available videos
- `POST /api/video/updateVideo` - Update video progress

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Notes for Production Use

1. **Video Sources**: Replace sample URLs with actual HLS video sources
2. **Quality URLs**: Use different video files for each quality level
3. **Error Handling**: Add comprehensive error handling
4. **Analytics**: Integrate video analytics
5. **Security**: Implement proper content protection
6. **Performance**: Optimize for large video files
7. **Accessibility**: Add ARIA labels and keyboard navigation
8. **Backend**: Implement proper backend API for video management

## Troubleshooting

### Common Issues
1. **Video not loading**: Check video URL and CORS settings
2. **Controls not working**: Ensure Video.js is properly initialized
3. **Quality switching issues**: Verify HLS playlist URLs
4. **Mobile issues**: Test on actual mobile devices
5. **Backend connection**: Ensure backend server is running

### Debug Tips
- Check browser console for errors
- Verify Video.js initialization
- Test with different video formats
- Monitor network requests
- Check HLS playlist validity

---

**This POC is designed for learning purposes. For production use, implement proper error handling, security measures, and performance optimizations.** 
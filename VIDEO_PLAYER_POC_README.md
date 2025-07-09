# Video Player POC - LMS Frontend

## Overview
This is a Proof of Concept (POC) video player built with Angular and Video.js. It demonstrates key video player functionality with specific restrictions and features for learning purposes.

## Features Implemented

### ✅ Core Features
- **Play/Pause Controls**: Basic video playback controls
- **Quality Switching**: Switch between 360p, 480p, and 720p resolutions
- **Responsive Design**: Works on desktop and mobile devices
- **Video.js Integration**: Professional video player library

### ❌ Restricted Features
- **Forward Seeking Disabled**: Users cannot seek forward in the video
- **Backward Seeking Allowed**: Users can only seek backward or to current position

### 🎯 POC Learning Objectives
- Understanding Video.js integration with Angular
- Implementing custom video controls
- Managing video quality switching
- Restricting user interactions (forward seeking)
- Responsive design implementation

## Project Structure

```
lms-fe/src/app/components/video-player/
├── video-player.component.ts    # Main component logic
├── video-player.component.html  # Template with Video.js integration
└── video-player.component.css   # Styling for the video player
```

## Key Code Sections Explained

### 1. Video.js Player Initialization
```typescript
// In video-player.component.ts - initializeVideoPlayer() method
const playerOptions = {
  controls: true, // Enable default controls
  fluid: true, // Make player responsive
  responsive: true,
  playbackRates: [0.5, 1, 1.25, 1.5, 2], // Available playback speeds
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
      'playbackRateMenuButton', // Playback speed menu
      'qualitySelector', // Custom quality selector
      'fullscreenToggle' // Fullscreen button
    ]
  }
};
```

### 2. Forward Seeking Prevention
```typescript
// In video-player.component.ts - disableSeeking() method
private disableSeeking(): void {
  // Store the original currentTime setter
  const originalCurrentTimeSetter = Object.getOwnPropertyDescriptor(
    HTMLMediaElement.prototype, 'currentTime'
  );

  // Override the currentTime setter to prevent forward seeking
  Object.defineProperty(this.player.tech_.el_, 'currentTime', {
    set: (value: number) => {
      // Only allow seeking to current time or backward
      if (value <= this.player.currentTime()) {
        originalCurrentTimeSetter?.set?.call(this.player.tech_.el_, value);
      } else {
        console.log('Forward seeking disabled');
      }
    },
    get: () => this.player.currentTime()
  });
}
```

### 3. Quality Switching Implementation
```typescript
// In video-player.component.ts - changeQuality() method
public changeQuality(quality: string): void {
  console.log(`Changing quality to: ${quality}`);
  
  // Store current playback time
  const currentTime = this.player.currentTime();
  const wasPlaying = !this.player.paused();

  // Find the selected quality configuration
  const selectedQuality = this.videoQualities.find(q => q.value === quality);
  
  if (selectedQuality) {
    // Update current quality
    this.currentQuality = quality;
    
    // Set new video source
    this.setVideoSource(quality);
    
    // Restore playback position and state
    this.player.ready(() => {
      this.player.currentTime(currentTime);
      if (wasPlaying) {
        this.player.play();
      }
    });
  }
}
```

## How to Run the POC

### Prerequisites
- Node.js (v16 or higher)
- Angular CLI

### Installation Steps
1. Navigate to the project directory:
   ```bash
   cd lms-fe
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
- **Playback Speed**: Use the playback rate menu in the video player

### Quality Selection
- Click on any quality button (360p, 480p, 720p) to switch video quality
- The current quality is highlighted in blue
- Quality switching preserves the current playback position

### Seeking Restrictions
- **Forward Seeking**: Disabled - you cannot seek forward in the video
- **Backward Seeking**: Allowed - you can seek backward or to the current position
- **Progress Bar**: Shows current position but forward seeking is blocked

## Technical Implementation Details

### Video.js Integration
- Uses Video.js v8.23.3
- Custom player configuration with specific controls
- Event listeners for player state management
- Responsive design with fluid layout

### Angular Component Architecture
- Standalone component with proper lifecycle management
- ViewChild decorator for direct DOM access
- OnDestroy hook for proper cleanup
- TypeScript interfaces for type safety

### CSS Styling
- Modern, responsive design
- Grid layout for controls
- Hover effects and transitions
- Mobile-friendly responsive breakpoints

## Learning Points for Actual Product

### 1. Video Player Integration
- How to integrate Video.js with Angular
- Proper component lifecycle management
- Event handling and state management

### 2. Custom Controls
- Creating custom video controls
- Quality switching implementation
- Playback state management

### 3. User Restrictions
- Implementing forward seeking prevention
- Overriding native browser behavior
- Maintaining user experience while adding restrictions

### 4. Responsive Design
- Mobile-friendly video player
- Adaptive layouts
- Touch-friendly controls

### 5. Error Handling
- Video loading error handling
- Network error management
- Fallback content for unsupported browsers

## Future Enhancements for Production

### 1. Advanced Features
- Adaptive bitrate streaming (HLS/DASH)
- Subtitle support
- Picture-in-picture mode
- Keyboard shortcuts

### 2. Analytics and Tracking
- Video engagement metrics
- Quality switching analytics
- Error tracking and reporting

### 3. Security Features
- DRM support
- Content protection
- Access control

### 4. Performance Optimization
- Lazy loading
- Preloading strategies
- Memory management

## Dependencies Used

```json
{
  "video.js": "^8.23.3",
  "@types/video.js": "^7.3.58"
}
```

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Notes for Production Use

1. **Video Sources**: Replace sample URLs with actual video sources
2. **Quality URLs**: Use different video files for each quality level
3. **Error Handling**: Add comprehensive error handling
4. **Analytics**: Integrate video analytics
5. **Security**: Implement proper content protection
6. **Performance**: Optimize for large video files
7. **Accessibility**: Add ARIA labels and keyboard navigation

## Troubleshooting

### Common Issues
1. **Video not loading**: Check video URL and CORS settings
2. **Controls not working**: Ensure Video.js is properly initialized
3. **Quality switching issues**: Verify video source URLs
4. **Mobile issues**: Test on actual mobile devices

### Debug Tips
- Check browser console for errors
- Verify Video.js initialization
- Test with different video formats
- Monitor network requests

---

**This POC is designed for learning purposes. For production use, implement proper error handling, security measures, and performance optimizations.** 
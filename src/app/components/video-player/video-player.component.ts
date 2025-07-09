import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// Define the interface for video quality options
interface VideoQuality {
  label: string;
  value: string;
  src: string;
}

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit, OnDestroy, AfterViewInit {
  
  // Reference to the video element in the template
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef;
  
  // Video.js player instance
  private player: any;
  
  videos : {
    title : string,
    duration : string,
    thumbnail : string
  }[] = [
    {
        title : "Lesson - 1",
        duration : "10:30",
        thumbnail : "assets/thumbnail1.jpg"
    },
    {
        title : "Lesson - 2",
        duration : "12:00",
        thumbnail : "assets/thumbnail1.jpg"
    },
  ]

  // Current video quality
  public currentQuality: string = '720p';
  
  // Available video qualities with sample URLs
  // In a real application, these would be actual video URLs for different qualities
    BASE_URL = "http://localhost:3000/hls-output/";
    VIDEO_ID = "faf3446e-0882-4c89-a1ff-90229c09ae19";

  public videoQualities: VideoQuality[] = [
    {
      label: '720p',
      value: '720p',
      src: `${this.BASE_URL}${this.VIDEO_ID}/720p/index.m3u8` // Same URL for demo
    },
    {
      label: '480p', 
      value: '480p',
      src: `${this.BASE_URL}${this.VIDEO_ID}/480p/index.m3u8` // Same URL for demo
    },
    {
      label: '360p',
      value: '360p', 
      src: `${this.BASE_URL}${this.VIDEO_ID}/360p/index.m3u8` // Same URL for demo
    }
  ];

  private lastAllowedTime: number = 0;

  constructor() { }

  ngOnInit(): void {
    // Component initialization logic
    console.log('Video Player Component Initialized');
  }

  ngAfterViewInit(): void {
    // Initialize Video.js player after the view is initialized
    this.initializeVideoPlayer();
  }

  ngOnDestroy(): void {
    // Clean up the video player when component is destroyed
    if (this.player) {
      this.player.dispose();
    }
  }

  /**
   * Initialize the Video.js player with custom configuration
   * This method sets up the video player with specific options for your POC
   */
  private initializeVideoPlayer(): void {
    // Video.js player configuration options
    const playerOptions = {
      controls: true, // Enable default controls
      fluid: true, // Make player responsive
      responsive: true,
      controlBar: {
        // Customize the control bar
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
          'qualitySelector', // Custom quality selector (we'll add this)
          'fullscreenToggle' // Fullscreen button
        ]
      },
      // Disable seeking functionality
      userActions: {
        hotkeys: function(event: any) {
          // Disable keyboard shortcuts for seeking
          if (event.code === 'ArrowRight' || event.code === 'ArrowLeft') {
            event.preventDefault();
            return false;
          }
          return true; // Return true for other keys
        }
      }
    };

    // Initialize the Video.js player
    this.player = videojs(this.videoElement.nativeElement, playerOptions);
    this.videoQualities.forEach(quality => {
        this.player.getChild('ControlBar').addChild('button',{
            controlText: quality.label,
            className : "vjs-visible-text",
            clickHandler: () => {
                this.changeQuality(quality.value);
            }
        })
    })
    // Set the initial video source
    this.setVideoSource(this.currentQuality);

    // Add event listeners for player events
    this.setupPlayerEventListeners();
  }

  /**
   * Set up event listeners for various player events
   * This helps in monitoring player state and user interactions
   */
  private setupPlayerEventListeners(): void {
    // Listen for play event
    this.player.on('play', () => {
      console.log('Video started playing');
    });

    // Listen for pause event
    this.player.on('pause', () => {
      console.log('Video paused');
    });
  

    // Listen for loaded metadata
    this.player.on('loadedmetadata', () => {
      console.log('Video metadata loaded');
    });

    // Listen for errors
    this.player.on('error', (error: any) => {
      console.error('Video player error:', error);
    });

    // Track last allowed time (update only if not seeking)
    this.player.on('timeupdate', () => {
      if (!this.player.seeking() && this.player.currentTime() > this.lastAllowedTime) {
        console.log("time updated",this.player.currentTime());
        
        this.lastAllowedTime = this.player.currentTime();
      }
    });

      // Listen for seeking events and prevent them
      this.player.on('seeking', () => {
        // Allow small jumps (e.g., <2s) for HLS logic
        if (this.player.currentTime() > this.lastAllowedTime + 2) {
          this.player.currentTime(this.lastAllowedTime);
          console.log('Forward seeking disabled');
        }
      });
  }

  /**
   * Prevent forward seeking by resetting to current position
   * This is called when seeking events are detected
   */
  private preventForwardSeek(): void {
    // This method can be used to add additional logic for preventing forward seek
    // For now, the main prevention is handled in disableSeeking()
  }

  /**
   * Change video quality/resolution
   * This method handles switching between different video qualities
   * @param quality - The quality to switch to (360p, 480p, 720p)
   */
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

  /**
   * Set video source for the specified quality
   * @param quality - The quality to set
   */
  private setVideoSource(quality: string): void {
    const selectedQuality = this.videoQualities.find(q => q.value === quality);
    
    if (selectedQuality) {
      // Set the video source
      this.player.src({
        src: selectedQuality.src,
        type: 'application/x-mpegURL'
      });
      
      console.log(`Video source set to: ${selectedQuality.src}`);
    }
  }

  /**
   * Play the video
   * This method can be called from the template or programmatically
   */
  public playVideo(): void {
    if (this.player) {
      this.player.play();
    }
  }

  /**
   * Pause the video
   * This method can be called from the template or programmatically
   */
  public pauseVideo(): void {
    if (this.player) {
      this.player.pause();
    }
  }

  /**
   * Get current playback time
   * @returns Current time in seconds
   */
  public getCurrentTime(): number {
    return this.player ? this.player.currentTime() : 0;
  }

  /**
   * Get total duration
   * @returns Total duration in seconds
   */
  public getDuration(): number {
    return this.player ? this.player.duration() : 0;
  }

  /**
   * Check if video is currently playing
   * @returns True if video is playing, false otherwise
   */
  public isPlaying(): boolean {
    return this.player ? !this.player.paused() : false;
  }
} 
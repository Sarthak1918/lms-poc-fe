import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { VideoService } from '../../services/video.service';

// Define the interface for video quality options
interface VideoQuality {
  label: string;
  value: string;
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

  // Videos array to store fetched videos
  public videos: any[] = [];

  constructor(private router: Router, private videoService: VideoService) { }
  

  // Current video quality
  public currentQuality: string = 'auto';
  
  // Available video qualities with sample URLs
  // In a real application, these would be actual video URLs for different qualities
    BASE_URL = "http://localhost:2000/hls-output/";
    public VIDEO_ID:any = "";
    public videoQualities: VideoQuality[] =  [
      {
        label: 'Auto',
        value: 'auto'
      },
      {
        label: '720p',
        value: '720p',
      },
      {
        label: '480p', 
        value: '480p',
      },
      {
        label: '360p',
        value: '360p', 
      }
    ];

  private lastAllowedTime: number = 0;
  progressInterval: any;
  lastProgress: number = 0;
  private isResumingFromTimestamp: boolean = false; // Flag to allow timestamp resuming
  
  ngOnInit(): void {
    // Component initialization logic
    console.log('Video Player Component Initialized');
    this.videoService.getAllVideos().subscribe(
      (data: any) => {
        console.log('Videos:', data);
        this.videos = data.videos;
        this.VIDEO_ID = this.videos[0]._id;
      },
      (error) => {
        console.error('Error fetching videos:', error);
      }
    );

    // Optional: every 10s you could also autosave
  this.progressInterval = setInterval(() => {
    this.sendProgress(); // socket or HTTP
  }, 10000);

  window.addEventListener('beforeunload', this.handleUnload);
  window.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  handleUnload = (event: any) => {
    this.sendProgress();
  };
  
  handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.sendProgress();
    }
  };

  ngAfterViewInit(): void {
      this.initializeVideoPlayer();
      console.log("this.VIDEO_ID",this.VIDEO_ID)
  }

  ngOnDestroy(): void {
    // Send final progress before destroying
    this.sendProgress();
    
    // Clear the interval to prevent memory leaks
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    
    // Remove event listeners
    window.removeEventListener('beforeunload', this.handleUnload);
    window.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Clean up the video player when component is destroyed
    if (this.player) {
      this.player.dispose();
    }
  }

  sendProgress() {
    if (!this.VIDEO_ID || !this.player) {
      return; // Don't send if video ID or player is not available
    }

    const currentTime = this.player.currentTime();
    console.log("Sending progress:", currentTime, "for video:", this.VIDEO_ID);
    
    if (currentTime > 0) {
      // Example: socket emit
      // this.socket.emit('video-progress', {
      //   videoId: this.VIDEO_ID,
      //   userId: this.userId,
      //   progress: currentTime,
      // });
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
          'customControlSpacer', // Spacer,
          'fullscreenToggle'
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
    // this.setVideoSource(this.currentQuality);
    this.setInitialVideoSource()

    // Add event listeners for player events
    this.setupPlayerEventListeners();
  }

  private setInitialVideoSource(): void {
    this.videoService.getAllVideos().subscribe(
      (data: any) => {
        console.log('Videos:', data);
        this.VIDEO_ID = data.videos[0]._id;
        this.setVideoSource(this.currentQuality);
        if(data.videos[0].timeStamp > 0){
          this.isResumingFromTimestamp = true;
          this.player.currentTime(data.videos[0].timeStamp);
        }
      },
      (error) => {
        console.error('Error fetching videos:', error);
      }
    );
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

    //When ended
    this.player.on('ended', () => {
      console.log('Video ended');
      this.sendProgress();
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
      this.lastProgress = this.player.currentTime();
      if (!this.player.seeking() && this.player.currentTime() > this.lastAllowedTime) {        
        this.lastAllowedTime = this.player.currentTime();
      }
    });

      // Listen for seeking events and prevent them
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
    console.log(quality);
    let videoUrl = this.BASE_URL + this.VIDEO_ID + "/" + quality + "/index.m3u8";
    if(quality === "auto"){
      videoUrl = this.BASE_URL + this.VIDEO_ID + "/index.m3u8";
    }

    console.log("videoUrl",videoUrl);
    
    
      // Set the video source
      this.player.src({
        src: videoUrl,
        type: 'application/x-mpegURL'
      });
      
      console.log(`Video source set to: ${videoUrl}`);
    
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

  public changeVideo(video: any): void {
    this.VIDEO_ID = video._id;
    console.log("video id",video._id)
    // Reinitialize video qualities with the new video ID
    // this.initializeVideoQualities();
    this.setVideoSource(this.currentQuality);
    if(video.timeStamp > 0){
      this.isResumingFromTimestamp = true;
      this.player.currentTime(video.timeStamp);
    }
  }

} 
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VideoPlayerComponent } from './components/video-player/video-player.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, VideoPlayerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Video Player POC - LMS Frontend';
}

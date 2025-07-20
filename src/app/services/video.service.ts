import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private apiUrl = 'http://localhost:2000/api/video';

  constructor(private http: HttpClient) { }

  getAllVideos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAllVideos`);
  }

  sendVideoProgress(videoId: string, timeStamp: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/updateVideo`, { videoId, timeStamp });
  }

}

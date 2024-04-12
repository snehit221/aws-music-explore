import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { SongDetails } from './core/song-details';

@Injectable({
  providedIn: 'root'
})
export class RecentSongsService {

  private apiGatewayPath: string;

  constructor(private http: HttpClient) {
    this.apiGatewayPath = "https://ej5knjgj1m.execute-api.us-east-1.amazonaws.com/prod";
  }

  recommendedSongsTest: SongDetails[] = [];

  searchRecommenedSongs(): Observable<SongDetails[]> {
    if (this.apiGatewayPath === "") {
      return of(this.recommendedSongsTest);
    }
    console.log("Inside searchRecommenedSongs with APIGateway: ", this.apiGatewayPath)
    return this.http.get<SongDetails[]>(`${this.apiGatewayPath}/recommend-songs`).pipe(
      tap((data: SongDetails[]) => {
        // Log the received data
        console.log("Received recommended songs:", data);
      }),
      catchError((error: any) => {
        // Log any errors that occur during the API call
        console.error("Error fetching recommended songs:", error);
        throw error; // Rethrow the error to be caught by the component
      })
    );
  }

}

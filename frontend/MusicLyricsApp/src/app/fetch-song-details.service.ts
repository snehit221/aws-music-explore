import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SongDetails } from './core/song-details';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class FetchSongDetailsService {

  private apiGatewayPath: string;

  constructor(private http: HttpClient) {
    this.apiGatewayPath = "https://ej5knjgj1m.execute-api.us-east-1.amazonaws.com/prod";
  }



  stubbedSongDetail: SongDetails = {
    "song_id": 55882,
    "song_title": "Paradise",
    "url": "https://genius.com/Coldplay-paradise-lyrics",
    "artist_names": "Coldplay",
    "full_title": "Paradise by Coldplay",
    "release_date_for_display": "September 12, 2011",
    "header_image_thumbnail_url": "https://images.genius.com/488723bd25fa80a5c6aa57e8b1cd71f3.300x300x1.jpg",
    "header_image_url": "https://images.genius.com/488723bd25fa80a5c6aa57e8b1cd71f3.1000x1000x1.jpg",
    "song_art_image_thumbnail_url": "https://images.genius.com/8d4d307d9a6c211d1192c44a2cf6598d.300x300x1.png",
    "song_art_image_url": "https://images.genius.com/8d4d307d9a6c211d1192c44a2cf6598d.1000x1000x1.png",
    "song_lyrics": "[Intro]\nOoh-ooh-ooh, ooh-ooh-ooh, ooh-ooh-ooh\nOoh-ooh-ooh, ooh-ooh-ooh, ooh-ooh-ooh\n[Verse 1]\nWhen she was just a girl\nShe expected the world\nBut it flew away from her reach\nSo she ran away in her sleep\n[Chorus]\nAnd dreamed of para-, para-, paradise\nPara-, para-, paradise\nPara-, para-, paradise\nEvery time she closed her eyes\n[Post-Chorus]\nOoh-ooh-ooh, ooh-ooh-ooh, ooh-ooh-ooh\nOoh-ooh-ooh, ooh-ooh-ooh, ooh-ooh-ooh\n[Verse 2]\nWhen she was just a girl\nShe expected the world\nBut it flew away from her reach\nAnd the bullets catch in her teeth\n[Pre-Chorus]\nLife goes on, it gets so heavy\nThe wheel breaks the butterfly\nEvery tear, a waterfall\nIn the night, the stormy night, she'd close her eyes\nIn the night, the stormy night, away she'd fly\n[Chorus]\nAnd dream of para-, para-, paradise\nPara-, para-, paradise\nPara-, para-, paradise\nOh, oh-oh, oh-oh, oh-oh-oh\nShe'd dream of para-, para-, paradise\nPara-, para-, paradise\nPara-, para-, paradise\nOh, oh-oh, oh-oh, oh-oh-oh\n[Bridge]\nLa, la-la, la-la-la\nLa, la-la, la-la-la\nLa, la-la, la-la-la, la-la\nSo lying underneath those stormy skies\nShe said, \"Oh, oh-oh-oh-oh, I know the sun must set to rise\"\n[Chorus]\nThis could be para-, para-, paradise\nPara-, para-, paradise\nThis could be para-, para-, paradise\nOh, oh-oh, oh-oh, oh-oh-oh\nThis could be para-, para-paradise\nPara-, para-, paradise\nThis could be para-, para-, paradise\nOh, oh-oh, oh-oh, oh-oh-oh\n[Instrumental Break]\n[Chorus]\nThis could be para-, para-, paradise\nThis could be para-, para-, paradise\nThis could be para-, para-, paradise\nOh-oh-oh-oh-oh oh-oh-oh\n[Outro]\nOoh-ooh-ooh, ooh-ooh-ooh, ooh-ooh-ooh\nOoh-ooh-ooh, ooh-ooh-ooh, ooh-ooh-ooh\nOoh-ooh-ooh, ooh-ooh-ooh, ooh-ooh-ooh\nOoh-ooh-ooh, ooh-ooh-ooh"
  }


  searchSong(songName: string): Observable<SongDetails> {
    console.log("Inside search song making API call: songName" + songName);
    const params = new HttpParams().set('songName', songName);
    console.log("API Gateway path inside searchSong: ", this.apiGatewayPath);
    if(this.apiGatewayPath === ""){
      this.stubbedSongDetail.song_lyrics = this.addSpacingToLyrics(this.stubbedSongDetail.song_lyrics);
      return of(this.stubbedSongDetail);
    }
    else {
      // Make an API call to the provided API gateway path
      return this.http.get<SongDetails>(`${this.apiGatewayPath}/song-details`, { params }).pipe(
        map((responseSongDetail: SongDetails) => { // Explicitly specify the type of responseSongDetail
          // Apply spacing to the lyrics received from the API response
          responseSongDetail.song_lyrics = this.addSpacingToLyrics(responseSongDetail.song_lyrics);
          return responseSongDetail;
        })
      );
    }
  }

  addSpacingToLyrics(lyrics: string): string {
    // Split the lyrics by lines
    let lines = lyrics.split('\n');
    let modifiedLyrics = '';

    // Iterate through each line
    for (let line of lines) {
      // Check if the line starts with a square bracket indicating a heading
      if (line.startsWith('[')) {
        // Add spacing before and after the heading
        modifiedLyrics += '\n\n' + line.trim() + '\n\n';
      } else {
        // Otherwise, keep the line as it is
        modifiedLyrics += line + '\n';
      }
    }

    return modifiedLyrics;
  }


}
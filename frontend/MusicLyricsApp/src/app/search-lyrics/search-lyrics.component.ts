import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // used for using *ngFor in html
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { FetchSongDetailsService } from '../fetch-song-details.service';
import { SongDetails } from '../core/song-details';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-lyrics',
  standalone: true,
  imports: [MatGridListModule, MatCardModule, MatButtonModule, MatToolbarModule, MatIconModule, MatInputModule, MatMenuModule, RouterOutlet, CommonModule],
  templateUrl: './search-lyrics.component.html',
  styleUrl: './search-lyrics.component.css'
})

export class SearchLyricsComponent implements OnInit {

  @Input() searchTerm: string = '';
  songDetail: SongDetails | undefined;

  constructor(private router: Router, private fetchSongDetailsService: FetchSongDetailsService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    console.log("Inside search component");
    this.route.params.subscribe({
      next: (params) => {
        const searchTerm = params['searchText'];
        console.log("Search term:", searchTerm);
        if (searchTerm) {
          this.fetchSongDetailsService.searchSong(searchTerm).subscribe({
            next: (data: any) => {
              this.songDetail = data;
              console.log("Song details:", this.songDetail);
            },
            error: (error) => {
              console.error('Error fetching song details:', error);
            }
          });
        } else {
          console.log("Search text (song name) is missing.");
        }
      }
    });
  }

  watchOnYouTube(): void {
    // Navigate to YouTube link
    if (this.songDetail && this.songDetail.youtube_watch_url) {
      // Navigate to YouTube link
      this.router.navigateByUrl(this.songDetail.youtube_watch_url);
    } else {
      // Handle case when youtube_link is not available
      console.error("YouTube link is not available");
    }
  }

  listenPreview(): void {
    // Navigate to Listen Preview link
    if (this.songDetail && this.songDetail?.apple_music_player_url) {
      // Navigate to YouTube link
      this.router.navigateByUrl(this.songDetail.apple_music_player_url);
    } else {
      // Handle case when youtube_link is not available
      console.error("Apple Music  Preview link is not available");
    }
  }

}

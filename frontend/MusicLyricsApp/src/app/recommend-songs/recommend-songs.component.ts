import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common'; // used for using *ngFor in html
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { SongDetails } from '../core/song-details';
import { RecentSongsService } from '../recent-songs.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-recommend-songs',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatGridListModule],
  templateUrl: './recommend-songs.component.html',
  styleUrl: './recommend-songs.component.css'
})
export class RecommendSongsComponent implements OnInit {

  recommendedSongs: SongDetails[] = [];

  constructor(private router: Router, private recentSongsService: RecentSongsService) { }

  ngOnInit(): void {
    // Call fetchRecommendedSongs() when the component is initialized
    this.fetchRecommendedSongs();

    // Subscribe to router events to trigger fetchRecommendedSongs() on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.fetchRecommendedSongs();
    });
  }
  
  fetchRecommendedSongs(): void {
    console.log("Inside fetchRecommendedSongs...");
    this.recentSongsService.searchRecommenedSongs().subscribe({
      next: (data: SongDetails[]) => {
        // Populate recommendedSongs array with the results
        this.recommendedSongs = data;
        console.log("Type of recommendedSongs:", typeof this.recommendedSongs);
        console.log("got recommendedSongs: ", this.recommendedSongs);
      },
      error: (error: any) => {
        // If any error occurs during API call, keep recommendedSongs array empty
        this.recommendedSongs = [];
        console.error("Error fetching recommended songs:", error);
      }
    });
  }

  navigateToYouTube(youtubeUrl: string): void {
    window.open(youtubeUrl, '_blank');
  }
}




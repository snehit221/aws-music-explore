import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderSearchComponent } from './header-search/header-search.component';
import { RecommendSongsComponent } from './recommend-songs/recommend-songs.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderSearchComponent, RecommendSongsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MusicLyricsApp';
}

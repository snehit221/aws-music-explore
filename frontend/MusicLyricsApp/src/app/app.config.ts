import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { Routes } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { SearchLyricsComponent } from './search-lyrics/search-lyrics.component';
import { RecommendSongsComponent } from './recommend-songs/recommend-songs.component';

export const routes: Routes = [
  {path: '', component: RecommendSongsComponent},
  {path: 'search/:searchText', component: SearchLyricsComponent},
];

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withFetch()), provideRouter(routes), provideClientHydration()]
};

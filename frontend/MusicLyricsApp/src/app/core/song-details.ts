export interface SongDetails {
  song_id: any;
  song_title: string;
  url: string;
  artist_names: string;
  full_title: string;
  release_date_for_display: string;
  header_image_thumbnail_url: string;
  header_image_url: string;
  song_art_image_thumbnail_url: string;
  song_art_image_url: string;
  song_lyrics: string;
  apple_music_id?: string | null; // Optional property
  apple_music_player_url?: string | null; // Optional property
  youtube_watch_url?: string | null; // Optional property
}

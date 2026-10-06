export interface User {
  id: string;
  name: string;
  email: string;
  role: 'MEMBER' | 'ADMIN';
}
export interface Anime {
  id: string;
  title: string;
  genre: string;
  image: string;
  synopsis: string;
}
export type WatchStatus = 'Watching' | 'Completed' | 'Plan to Watch';
export interface Entry extends Anime {
  animeId: string;
  rating: number;
  status: WatchStatus;
  isFavorite: boolean;
}
export interface Session {
  user: User;
  accessToken: string;
}
export interface Collection {
  items: Entry[];
  spotlightId: string | null;
}
export interface Metadata {
  genres: string[];
  statuses: WatchStatus[];
  posters: Pick<Anime, 'id' | 'title' | 'image'>[];
}

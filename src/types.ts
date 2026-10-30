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
  provider?: string | null;
  externalId?: string | null;
  totalEpisodes?: number | null;
}
export type WatchStatus = 'Watching' | 'Completed' | 'Plan to Watch';
export interface Entry extends Anime {
  animeId: string;
  rating: number;
  status: WatchStatus;
  isFavorite: boolean;
  episodesWatched: number;
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

export interface RemoteAnime {
  externalId: string;
  provider: 'KITSU';
  title: string;
  alternativeTitles: string[];
  image: string;
  banner: string | null;
  synopsis: string;
  genres: string[];
  categorySlugs: string[];
  totalEpisodes: number | null;
  episodeLength: number | null;
  communityScore: number | null;
  popularityRank: number | null;
  format: string;
  airingStatus: string;
  startDate: string | null;
  endDate: string | null;
  nextRelease: string | null;
  season: string | null;
  year: number | null;
  studios: string[];
  trailerId: string | null;
  sourceUrl: string;
  relation?: string;
}
export interface DiscoveryResult {
  items: RemoteAnime[];
  page: number;
  hasNext: boolean;
  total: number | null;
  source: string;
}
export interface Episode {
  id: string;
  number: number;
  title: string;
  synopsis: string;
  airDate: string | null;
  length: number | null;
}
export interface EpisodePage {
  items: Episode[];
  page: number;
  hasNext: boolean;
  total: number | null;
}
export interface CalendarEvent {
  date: string;
  title: string;
  image: string;
  externalId: string;
  episode: number | null;
  episodeTitle: string;
  kind: string;
}
export interface CalendarResult {
  events: CalendarEvent[];
  week: string;
  trackedTitles: number;
  failedTitles: number;
  limited: boolean;
  notice: string;
}
export type AssistantMode = 'identify' | 'recommend';
export interface AssistantResult {
  mode: AssistantMode;
  summary: string;
  question: string;
  items: { anime: RemoteAnime; reason: string; evidence: string; facts: string[] }[];
  notice: string;
}

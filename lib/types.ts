export type UserId = "otavio" | "larissa";

export interface AppUser {
  id: UserId;
  name: string;
  color: string;
}

export interface Movie {
  id: string;
  tmdb_id: number | null;
  title: string;
  poster_url: string | null;
  backdrop_url: string | null;
  overview: string | null;
  release_year: number | null;
  genres: string[];
  runtime_minutes: number | null;
  added_by: UserId | null;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  movie_id: string;
  user_id: UserId;
  created_at: string;
  movie?: Movie;
}

export interface Session {
  id: string;
  movie_id: string;
  watched_at: string;
  watched_time: string | null;
  snack: string | null;
  drink: string | null;
  photo_url: string | null;
  comment: string | null;
  created_at: string;
  movie?: Movie;
  ratings?: Rating[];
}

export interface Rating {
  id: string;
  session_id: string;
  user_id: UserId;
  score: number;
  review: string | null;
  created_at: string;
}

export const SPECIAL_CATEGORIES = [
  "Primeiro filme juntos",
  "Filme favorito dela",
  "Filme favorito dele",
  "Filme que mais assistimos",
  "Filme que nos fez chorar",
  "Filme que nos fez rir",
  "Filme para assistir novamente",
] as const;

export type SpecialCategory = (typeof SPECIAL_CATEGORIES)[number];

export interface SpecialMovie {
  id: string;
  movie_id: string;
  category: SpecialCategory | string;
  note: string | null;
  created_at: string;
  movie?: Movie;
}

export const USERS: Record<UserId, AppUser> = {
  otavio: { id: "otavio", name: "Otavio", color: "#8B5CF6" },
  larissa: { id: "larissa", name: "Larissa", color: "#EC4899" },
};

export function otherUser(id: UserId): UserId {
  return id === "otavio" ? "larissa" : "otavio";
}

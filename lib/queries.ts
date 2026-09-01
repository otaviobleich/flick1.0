import { supabase } from "./supabase";
import { Movie, Session, SpecialMovie, UserId, WatchlistItem } from "./types";

export async function listMovies(): Promise<Movie[]> {
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Movie[];
}

export async function addMovie(
  input: Partial<Movie> & { title: string },
  addedBy: UserId
): Promise<Movie> {
  const { data, error } = await supabase
    .from("movies")
    .insert({ ...input, added_by: addedBy })
    .select()
    .single();
  if (error) throw error;
  return data as Movie;
}

export async function listWatchlist(): Promise<WatchlistItem[]> {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*, movie:movies(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as WatchlistItem[];
}

export async function addToWatchlist(movieId: string, userId: UserId) {
  const { error } = await supabase
    .from("watchlist")
    .insert({ movie_id: movieId, user_id: userId });
  if (error && error.code !== "23505") throw error; // ignore duplicate
}

export async function removeFromWatchlist(movieId: string, userId: UserId) {
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("movie_id", movieId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function listSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, movie:movies(*), ratings(*)")
    .order("watched_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as Session[];
}

export async function createSession(input: {
  movie_id: string;
  watched_at: string;
  snack?: string;
  drink?: string;
  comment?: string;
  photo_url?: string;
  ratings: { user_id: UserId; score: number; review?: string }[];
}): Promise<Session> {
  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      movie_id: input.movie_id,
      watched_at: input.watched_at,
      snack: input.snack || null,
      drink: input.drink || null,
      comment: input.comment || null,
      photo_url: input.photo_url || null,
    })
    .select()
    .single();
  if (error) throw error;

  if (input.ratings.length) {
    const { error: ratingsError } = await supabase.from("ratings").insert(
      input.ratings.map((r) => ({
        session_id: session.id,
        user_id: r.user_id,
        score: r.score,
        review: r.review || null,
      }))
    );
    if (ratingsError) throw ratingsError;
  }

  return session as Session;
}

export async function listSpecialMovies(): Promise<SpecialMovie[]> {
  const { data, error } = await supabase
    .from("special_movies")
    .select("*, movie:movies(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as SpecialMovie[];
}

export async function addSpecialMovie(
  movieId: string,
  category: string,
  note?: string
) {
  const { error } = await supabase
    .from("special_movies")
    .insert({ movie_id: movieId, category, note: note || null });
  if (error) throw error;
}

export async function removeSpecialMovie(id: string) {
  const { error } = await supabase.from("special_movies").delete().eq("id", id);
  if (error) throw error;
}

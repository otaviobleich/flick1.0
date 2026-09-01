const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w780";

export interface TmdbResult {
  tmdb_id: number;
  title: string;
  release_year: number | null;
  poster_url: string | null;
  backdrop_url: string | null;
  overview: string | null;
  genres: string[];
}

const GENRE_MAP: Record<number, string> = {
  28: "Ação",
  12: "Aventura",
  16: "Animação",
  35: "Comédia",
  80: "Crime",
  99: "Documentário",
  18: "Drama",
  10751: "Família",
  14: "Fantasia",
  36: "História",
  27: "Terror",
  10402: "Música",
  9648: "Mistério",
  10749: "Romance",
  878: "Ficção científica",
  10770: "Cinema TV",
  53: "Suspense",
  10752: "Guerra",
  37: "Faroeste",
};

export function tmdbEnabled() {
  return Boolean(API_KEY);
}

export async function searchTmdbMovies(query: string): Promise<TmdbResult[]> {
  if (!API_KEY || !query.trim()) return [];

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao buscar filmes no TMDB");
  const data = await res.json();

  return (data.results || []).slice(0, 12).map((r: any) => ({
    tmdb_id: r.id,
    title: r.title,
    release_year: r.release_date ? Number(r.release_date.slice(0, 4)) : null,
    poster_url: r.poster_path ? `${IMAGE_BASE}${r.poster_path}` : null,
    backdrop_url: r.backdrop_path ? `${BACKDROP_BASE}${r.backdrop_path}` : null,
    overview: r.overview || null,
    genres: (r.genre_ids || []).map((id: number) => GENRE_MAP[id]).filter(Boolean),
  }));
}

export async function getTmdbMovieDetails(tmdbId: number): Promise<{
  runtime_minutes: number | null;
} | null> {
  if (!API_KEY) return null;
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${API_KEY}&language=pt-BR`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return { runtime_minutes: data.runtime || null };
}

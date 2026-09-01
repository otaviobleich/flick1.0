import { Session, UserId, USERS } from "./types";

export interface CoupleStats {
  totalSessions: number;
  distinctMovies: number;
  totalMinutes: number;
  averageScore: number | null;
  favoriteGenres: { genre: string; count: number }[];
  averageByUser: Record<UserId, number | null>;
  pickShareByUser: Record<UserId, number>;
  mostWatchedTitle: { title: string; count: number } | null;
}

export function sessionCoupleScore(session: Session): number | null {
  if (!session.ratings || session.ratings.length === 0) return null;
  const sum = session.ratings.reduce((acc, r) => acc + Number(r.score), 0);
  return Math.round((sum / session.ratings.length) * 10) / 10;
}

export function computeStats(sessions: Session[]): CoupleStats {
  const distinctMovieIds = new Set(sessions.map((s) => s.movie_id));
  const totalMinutes = sessions.reduce(
    (acc, s) => acc + (s.movie?.runtime_minutes || 0),
    0
  );

  const allScores: number[] = [];
  const scoresByUser: Record<UserId, number[]> = { otavio: [], larissa: [] };
  const genreCounts = new Map<string, number>();
  const titleCounts = new Map<string, number>();
  const addedByCounts: Record<UserId, number> = { otavio: 0, larissa: 0 };

  for (const s of sessions) {
    for (const r of s.ratings || []) {
      allScores.push(Number(r.score));
      if (r.user_id === "otavio" || r.user_id === "larissa") {
        scoresByUser[r.user_id].push(Number(r.score));
      }
    }
    for (const g of s.movie?.genres || []) {
      genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
    }
    if (s.movie?.title) {
      titleCounts.set(s.movie.title, (titleCounts.get(s.movie.title) || 0) + 1);
    }
    const addedBy = s.movie?.added_by;
    if (addedBy === "otavio" || addedBy === "larissa") {
      addedByCounts[addedBy] += 1;
    }
  }

  const favoriteGenres = Array.from(genreCounts.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const mostWatchedEntry = Array.from(titleCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const totalAdded = addedByCounts.otavio + addedByCounts.larissa;

  return {
    totalSessions: sessions.length,
    distinctMovies: distinctMovieIds.size,
    totalMinutes,
    averageScore: allScores.length
      ? Math.round((avg(allScores) || 0) * 10) / 10
      : null,
    favoriteGenres,
    averageByUser: {
      otavio: scoresByUser.otavio.length
        ? Math.round(avg(scoresByUser.otavio)! * 10) / 10
        : null,
      larissa: scoresByUser.larissa.length
        ? Math.round(avg(scoresByUser.larissa)! * 10) / 10
        : null,
    },
    pickShareByUser: {
      otavio: totalAdded ? Math.round((addedByCounts.otavio / totalAdded) * 100) : 0,
      larissa: totalAdded
        ? Math.round((addedByCounts.larissa / totalAdded) * 100)
        : 0,
    },
    mostWatchedTitle: mostWatchedEntry
      ? { title: mostWatchedEntry[0], count: mostWatchedEntry[1] }
      : null,
  };
}

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}min`;
  return `${h}h ${m}min`;
}

export function userLabel(id: UserId) {
  return USERS[id].name;
}

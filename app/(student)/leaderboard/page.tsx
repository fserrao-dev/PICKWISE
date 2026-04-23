import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session) return null;
  const userId = session.user.id;

  const top20 = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { points: "desc" },
    take: 20,
    include: { badges: { include: { badge: true } } },
  });

  const myRank = top20.findIndex((u) => u.id === userId);
  const me = top20[myRank];

  // If current user not in top 20, fetch their actual rank
  let userRank = myRank + 1;
  if (myRank === -1) {
    const count = await prisma.user.count({
      where: { role: "STUDENT", points: { gt: (await prisma.user.findUnique({ where: { id: userId } }))?.points ?? 0 } },
    });
    userRank = count + 1;
  }

  function RankIcon({ rank }: { rank: number }) {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">Top students ranked by points earned</p>
      </div>

      {/* Current user's rank if not in top 20 */}
      {myRank === -1 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-primary">#{userRank}</span>
              <span className="text-sm">Your current rank</span>
              <div className="ml-auto flex items-center gap-1 text-sm font-medium">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                {session.user.name ? (
                  <span>{session.user.name}</span>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top 20 Students</CardTitle>
          <CardDescription>Earn points by completing quiz questions correctly (10 pts each)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {top20.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No rankings yet. Start completing quizzes to appear here!
              </div>
            ) : (
              top20.map((student, idx) => {
                const rank = idx + 1;
                const isMe = student.id === userId;
                return (
                  <div
                    key={student.id}
                    className={cn(
                      "flex items-center gap-4 px-6 py-4 transition-colors",
                      isMe && "bg-primary/5",
                      rank <= 3 && "bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10"
                    )}
                  >
                    <div className="w-8 flex items-center justify-center shrink-0">
                      <RankIcon rank={rank} />
                    </div>
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={student.avatarUrl || ""} />
                      <AvatarFallback>
                        {student.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn("font-medium text-sm", isMe && "text-primary")}>
                          {student.name}
                          {isMe && <span className="text-xs ml-1">(you)</span>}
                        </p>
                        {student.badges.slice(0, 3).map((ub) => (
                          <span key={ub.id} title={ub.badge.name} className="text-base leading-none">
                            {ub.badge.iconUrl}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                      <span className="font-bold text-sm">{student.points}</span>
                      <span className="text-xs text-muted-foreground">pts</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

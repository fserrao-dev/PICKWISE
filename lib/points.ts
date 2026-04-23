import { prisma } from "./prisma";
import { sendNotificationEmail } from "./email";

const BADGES = {
  FIRST_LESSON: "First Lesson",
  PERFECT_SCORE: "Perfect Score",
  COURSE_CHAMPION: "Course Champion",
  TOP_3: "Top 3",
} as const;

export async function awardPoints(userId: string, points: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: points } },
  });
}

export async function checkAndAwardBadges(userId: string, context: {
  lessonCompleted?: boolean;
  perfectScore?: boolean;
  courseCompleted?: boolean;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { badges: { include: { badge: true } }, progress: true },
  });
  if (!user) return;

  const existingBadgeNames = user.badges.map((ub) => ub.badge.name);

  const badgesToAward: string[] = [];

  if (context.lessonCompleted && user.progress.length === 1) {
    badgesToAward.push(BADGES.FIRST_LESSON);
  }

  if (context.perfectScore) {
    badgesToAward.push(BADGES.PERFECT_SCORE);
  }

  if (context.courseCompleted) {
    badgesToAward.push(BADGES.COURSE_CHAMPION);
  }

  const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
  if (updatedUser) {
    const topStudents = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { points: "desc" },
      take: 3,
    });
    if (topStudents.some((s) => s.id === userId)) {
      badgesToAward.push(BADGES.TOP_3);
    }
  }

  for (const badgeName of badgesToAward) {
    if (existingBadgeNames.includes(badgeName)) continue;

    const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
    if (!badge) continue;

    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      update: {},
      create: { userId, badgeId: badge.id },
    });

    await prisma.notification.create({
      data: {
        userId,
        message: `🏆 You earned the "${badgeName}" badge! ${badge.description}`,
      },
    });
  }
}

export async function createNotification(userId: string, message: string) {
  const notification = await prisma.notification.create({
    data: { userId, message },
    include: { user: true },
  });

  sendNotificationEmail(notification.user.name, notification.user.email, message).catch(
    console.error
  );

  return notification;
}

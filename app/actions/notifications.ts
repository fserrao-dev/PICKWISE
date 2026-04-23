"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/email";

const notifSchema = z.object({
  message: z.string().min(5, "Message must be at least 5 characters"),
  targetUserId: z.string().optional(),
});

export async function sendAdminNotification(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  const raw = {
    message: formData.get("message") as string,
    targetUserId: (formData.get("targetUserId") as string) || undefined,
  };

  const result = notifSchema.safeParse(raw);
  if (!result.success) return { error: result.error.issues[0].message };

  const { message, targetUserId } = result.data;

  if (targetUserId && targetUserId !== "all") {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) return { error: "User not found" };

    await prisma.notification.create({ data: { userId: targetUserId, message } });
    sendNotificationEmail(user.name, user.email, message).catch(console.error);
  } else {
    const students = await prisma.user.findMany({ where: { role: "STUDENT" } });
    await prisma.notification.createMany({
      data: students.map((s) => ({ userId: s.id, message })),
    });
    for (const student of students) {
      sendNotificationEmail(student.name, student.email, message).catch(console.error);
    }
  }

  revalidatePath("/admin/notifications");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/students");
  return { success: true };
}

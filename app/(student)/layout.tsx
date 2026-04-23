import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/navbar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin/dashboard");

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        userName={session.user.name || "Student"}
        userEmail={session.user.email || ""}
        userAvatar={session.user.image}
        unreadCount={unreadCount}
      />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

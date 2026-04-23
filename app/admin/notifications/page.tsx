import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SendNotificationForm } from "@/components/admin/send-notification-form";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function NotificationsPage() {
  const [students, recentNotifs] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { user: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Send messages to students</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
          <CardDescription>
            Send a message to a specific student or broadcast to all students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SendNotificationForm students={students} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Last 30 notifications sent on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {recentNotifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Bell className="w-10 h-10 mb-2" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentNotifs.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{n.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={n.read ? "secondary" : "default"} className="text-xs">
                      {n.read ? "Read" : "Unread"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

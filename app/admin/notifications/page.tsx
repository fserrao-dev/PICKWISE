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
        <h1 className="text-3xl font-bold">Notificaciones</h1>
        <p className="text-muted-foreground">Enviá mensajes a los estudiantes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enviar notificación</CardTitle>
          <CardDescription>
            Enviá un mensaje a un estudiante específico o a todos los estudiantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SendNotificationForm students={students} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones recientes</CardTitle>
          <CardDescription>Últimas 30 notificaciones enviadas en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {recentNotifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Bell className="w-10 h-10 mb-2" />
              <p>Aún no se enviaron notificaciones</p>
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
                      {n.read ? "Leída" : "No leída"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString("es")}
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

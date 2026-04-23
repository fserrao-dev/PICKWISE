"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { markAllNotificationsRead, markNotificationRead } from "@/app/actions/enrollment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export function NotificationsList({ notifications }: { notifications: Notification[] }) {
  const [items, setItems] = useState(notifications);
  const [pending, startTransition] = useTransition();

  function markOne(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    });
  }

  function markAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("Todas las notificaciones marcadas como leídas");
    });
  }

  const unread = items.filter((n) => !n.read).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notificaciones
            {unread > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {unread}
              </span>
            )}
          </CardTitle>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markAll}
              disabled={pending}
            >
              <CheckCheck className="w-3 h-3" />
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sin notificaciones</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "p-2 rounded-lg text-sm cursor-pointer transition-colors",
                  n.read ? "text-muted-foreground" : "bg-primary/5 font-medium"
                )}
                onClick={() => !n.read && markOne(n.id)}
              >
                <p className="text-xs leading-snug">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(n.createdAt).toLocaleDateString("es")}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

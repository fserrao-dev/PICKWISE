"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { sendAdminNotification } from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2 } from "lucide-react";

interface Student { id: string; name: string; email: string; }

export function SendNotificationForm({ students }: { students: Student[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [targetUserId, setTargetUserId] = useState("all");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("targetUserId", targetUserId);
    const result = await sendAdminNotification(formData);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("¡Notificación enviada!");
      (e.target as HTMLFormElement).reset();
      setTargetUserId("all");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Destinatario</Label>
        <Select value={targetUserId} onValueChange={setTargetUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccioná un destinatario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">📢 Todos los estudiantes ({students.length})</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} — {s.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Mensaje</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Escribí el mensaje de notificación aquí..."
          rows={4}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Enviar notificación
      </Button>
    </form>
  );
}

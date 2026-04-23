"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreVertical, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteCourse, toggleCoursePublish } from "@/app/actions/courses";

interface CourseActionsProps {
  courseId: string;
  isPublished: boolean;
  courseTitle: string;
}

export function CourseActions({ courseId, isPublished, courseTitle }: CourseActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleTogglePublish() {
    const result = await toggleCoursePublish(courseId, !isPublished);
    if (result.success) {
      toast.success(isPublished ? "Curso despublicado" : "Curso publicado");
      router.refresh();
    }
  }

  async function handleDelete() {
    setLoading(true);
    const result = await deleteCourse(courseId);
    setLoading(false);
    if (result.success) {
      toast.success("Curso eliminado");
      setDeleteOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleTogglePublish}>
            {isPublished ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Despublicar
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Publicar
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar curso</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar &quot;{courseTitle}&quot;? También se eliminarán todos los módulos,
              lecciones y el progreso de los estudiantes. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Eliminando..." : "Eliminar curso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

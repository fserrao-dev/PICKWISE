"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminEnrollStudent } from "@/app/actions/enrollment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";

interface Course { id: string; title: string; }

interface Props {
  studentId: string;
  studentName: string;
  enrolledCourseIds: string[];
  courses: Course[];
}

export function EnrollStudentDialog({ studentId, studentName, enrolledCourseIds, courses }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(false);

  const availableCourses = courses.filter((c) => !enrolledCourseIds.includes(c.id));

  async function handleEnroll() {
    if (!selectedCourseId) return;
    setLoading(true);
    const result = await adminEnrollStudent(studentId, selectedCourseId);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`${studentName} enrolled successfully`);
      setOpen(false);
      setSelectedCourseId("");
      router.refresh();
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={availableCourses.length === 0}
      >
        <UserPlus className="w-4 h-4" />
        Enroll
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll {studentName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {availableCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This student is already enrolled in all available courses.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">Select a course:</p>
                {availableCourses.map((course) => (
                  <label
                    key={course.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCourseId === course.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="course"
                      value={course.id}
                      checked={selectedCourseId === course.id}
                      onChange={() => setSelectedCourseId(course.id)}
                      className="accent-primary"
                    />
                    <span className="text-sm">{course.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleEnroll}
              disabled={!selectedCourseId || loading}
            >
              {loading ? "Enrolling…" : "Enroll Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { enrollInCourse } from "@/app/actions/enrollment";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function EnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    setLoading(true);
    const result = await enrollInCourse(courseId);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Enrolled successfully!");
      router.push(`/courses/${courseId}`);
      router.refresh();
    }
  }

  return (
    <Button onClick={handleEnroll} disabled={loading} size="sm">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      Enroll
    </Button>
  );
}

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminChartsProps {
  topStudents: { id: string; name: string; points: number }[];
  courseCompletionData: { name: string; rate: number; enrolled: number }[];
}

export function AdminCharts({ topStudents, courseCompletionData }: AdminChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Students by Points</CardTitle>
          <CardDescription>Top 10 students ranked by total points earned</CardDescription>
        </CardHeader>
        <CardContent>
          {topStudents.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No student data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topStudents} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(v) => [`${v} pts`, "Points"]} />
                <Bar dataKey="points" fill="#6366f1" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Completion Rates</CardTitle>
          <CardDescription>Percentage of enrolled students who completed each course</CardDescription>
        </CardHeader>
        <CardContent>
          {courseCompletionData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No course data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={courseCompletionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v) => [`${v}%`, "Completion Rate"]} />
                <Bar dataKey="rate" fill="#10b981" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
          <CardTitle>Mejores estudiantes por puntos</CardTitle>
          <CardDescription>Top 10 estudiantes ordenados por puntos totales obtenidos</CardDescription>
        </CardHeader>
        <CardContent>
          {topStudents.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Aún no hay datos de estudiantes
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
                <Tooltip formatter={(v) => [`${v} pts`, "Puntos"]} />
                <Bar dataKey="points" fill="#6366f1" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasa de finalización de cursos</CardTitle>
          <CardDescription>Porcentaje de estudiantes inscriptos que completaron cada curso</CardDescription>
        </CardHeader>
        <CardContent>
          {courseCompletionData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Aún no hay datos de cursos
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
                <Tooltip formatter={(v) => [`${v}%`, "Tasa de finalización"]} />
                <Bar dataKey="rate" fill="#10b981" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

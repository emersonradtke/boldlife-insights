import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Star, MessageSquare } from "lucide-react";

export default function StatsCards({ responses }) {
  const total = responses.length;
  const associates = responses.filter((r) => r.is_associate).length;
  const avgRating = total > 0
    ? (responses.reduce((acc, r) => acc + (r.satisfaction_rating || 0), 0) / total).toFixed(1)
    : "0";
  const commentsCount = responses.filter((r) => r.comments && r.comments.trim()).length;

  const stats = [
    { label: "Total Respostas", value: total, icon: Users, color: "text-primary" },
    { label: "Associados", value: associates, icon: UserCheck, color: "text-green-600" },
    { label: "Nota Média", value: avgRating, icon: Star, color: "text-amber-500" },
    { label: "Comentários", value: commentsCount, icon: MessageSquare, color: "text-blue-500" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
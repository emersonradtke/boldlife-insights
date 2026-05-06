import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = [
  "hsl(43, 96%, 50%)",
  "hsl(43, 70%, 40%)",
  "hsl(0, 0%, 20%)",
  "hsl(43, 50%, 65%)",
  "hsl(0, 0%, 45%)",
  "hsl(43, 80%, 55%)",
  "hsl(0, 0%, 35%)",
  "hsl(43, 60%, 48%)",
];

export default function BrandsChart({ responses }) {
  const brandCounts = {};
  responses.forEach((r) => {
    (r.desired_brands || []).forEach((brand) => {
      const key = brand.trim().toLowerCase();
      const display = brand.trim();
      if (!brandCounts[key]) brandCounts[key] = { name: display, count: 0 };
      brandCounts[key].count++;
    });
  });

  const data = Object.values(brandCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Marcas Mais Solicitadas</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Nenhuma marca cadastrada ainda
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Top 10 Marcas Mais Solicitadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
                formatter={(value) => [`${value} solicitações`, "Quantidade"]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
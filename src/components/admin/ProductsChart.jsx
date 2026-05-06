import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = [
  "hsl(211, 100%, 50%)",
  "hsl(211, 80%, 45%)",
  "hsl(223, 45%, 35%)",
  "hsl(211, 70%, 60%)",
  "hsl(223, 45%, 50%)",
  "hsl(211, 60%, 40%)",
  "hsl(223, 30%, 40%)",
  "hsl(211, 90%, 55%)",
];

export default function ProductsChart({ responses }) {
  const productCounts = {};
  responses.forEach((r) => {
    const products = Array.isArray(r.desired_products) ? r.desired_products : [];
    products.forEach((product) => {
      const key = product.trim().toLowerCase();
      const display = product.trim();
      if (!productCounts[key]) productCounts[key] = { name: display, count: 0 };
      productCounts[key].count++;
    });
  });

  const data = Object.values(productCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Produtos Mais Solicitados</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Nenhum produto cadastrado ainda
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Top 10 Produtos Mais Solicitados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis
                dataKey="name"
                type="category"
                width={130}
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
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Package, BarChart2, List } from "lucide-react";

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
  const [view, setView] = useState("chart"); // "chart" | "table"

  // Agrega dados por produto
  const productMap = {};
  responses.forEach((r) => {
    const products = Array.isArray(r.desired_products) ? r.desired_products : [];
    products.forEach((product) => {
      const rawName = typeof product === "string" ? product : product?.name;
      if (!rawName) return;
      const key = rawName.trim().toLowerCase();
      const display = rawName.trim();

      if (!productMap[key]) {
        productMap[key] = {
          name: display,
          count: 0,
          mensal: 0,
          ocasional: 0,
          totalQty: 0,
          qtyCount: 0,
        };
      }

      productMap[key].count++;

      if (typeof product === "object") {
        const freq = product.frequency;
        if (freq === "mensal") productMap[key].mensal++;
        else if (freq === "ocasional") productMap[key].ocasional++;

        const qty = parseFloat(product.quantity);
        if (!isNaN(qty)) {
          productMap[key].totalQty += qty;
          productMap[key].qtyCount++;
        }
      }
    });
  });

  const data = Object.values(productMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((p) => ({
      ...p,
      avgQty: p.qtyCount > 0 ? (p.totalQty / p.qtyCount).toFixed(1) : null,
    }));

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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Top 10 Produtos Mais Solicitados</CardTitle>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setView("chart")}
              className={`p-1.5 rounded-md transition-colors ${view === "chart" ? "bg-background shadow-sm" : "hover:bg-background/60"}`}
              title="Gráfico"
            >
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-1.5 rounded-md transition-colors ${view === "table" ? "bg-background shadow-sm" : "hover:bg-background/60"}`}
              title="Tabela detalhada"
            >
              <List className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "chart" ? (
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="py-2 pr-4 text-left font-medium">Produto</th>
                  <th className="py-2 px-3 text-center font-medium">Solicitações</th>
                  <th className="py-2 px-3 text-center font-medium">Qtd. Média</th>
                  <th className="py-2 px-3 text-center font-medium">Mensal</th>
                  <th className="py-2 px-3 text-center font-medium">Ocasional</th>
                </tr>
              </thead>
              <tbody>
                {data.map((product, index) => (
                  <tr key={product.name} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-semibold rounded-full px-2.5 py-0.5 text-xs">
                        {product.count}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground">
                      {product.avgQty ? `${product.avgQty}×` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {product.mensal > 0 ? (
                        <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 font-medium rounded-full px-2 py-0.5 text-xs">
                          {product.mensal}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {product.ocasional > 0 ? (
                        <span className="inline-flex items-center justify-center bg-amber-50 text-amber-600 font-medium rounded-full px-2 py-0.5 text-xs">
                          {product.ocasional}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
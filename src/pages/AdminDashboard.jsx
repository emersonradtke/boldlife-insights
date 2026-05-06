import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, ExternalLink, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCards from "../components/admin/StatsCards";
import BrandsChart from "../components/admin/BrandsChart";
import ResponsesTable from "../components/admin/ResponsesTable";
import CommentsPanel from "../components/admin/CommentsPanel";
import QuestionsManager from "../components/admin/QuestionsManager";
import ProductsChart from "../components/admin/ProductsChart";

export default function AdminDashboard() {
  const { data: responses, isLoading } = useQuery({
    queryKey: ["survey-responses"],
    queryFn: () => base44.entities.SurveyResponse.list("-created_date", 500),
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary" />

      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://media.base44.com/images/public/69fb67ec22eeed7efb852e91/64630ae96_BOLDLIFE02-LOGO1.png"
              alt="Bold Life"
              className="h-8 object-contain"
            />
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Painel Administrativo
              </p>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Ver Formulário
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <StatsCards responses={responses} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BrandsChart responses={responses} />
          <ProductsChart responses={responses} />
        </div>

        <CommentsPanel responses={responses} />

        <ResponsesTable responses={responses} />
        <QuestionsManager />
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Star, MessageSquare, BarChart3 } from "lucide-react";
import StatsCards from "./StatsCards";
import BrandsChart from "./BrandsChart";
import ProductsChart from "./ProductsChart";
import CommentsPanel from "./CommentsPanel";
import ResponsesTable from "./ResponsesTable";
import QuestionStats from "./QuestionStats";

export default function SurveyDashboard({ allResponses }) {
  const { data: surveys = [] } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => base44.entities.Survey.list("sort_order", 100),
  });

  const visibleSurveys = [...surveys]
    .filter((s) => s.is_visible !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // Tab: "all" or survey id
  const [activeTab, setActiveTab] = useState("all");

  const filteredResponses =
    activeTab === "all"
      ? allResponses
      : allResponses.filter((r) => r.survey_id === activeTab);

  const activeSurvey = visibleSurveys.find((s) => s.id === activeTab) || null;
  const surveyName = activeTab === "all" ? "Todas as Pesquisas" : activeSurvey?.title || "Pesquisa";
  // Mostra gráficos de marcas: na aba geral sempre, ou quando a pesquisa selecionada tem show_brands_section = true
  const showBrandsCharts = activeTab === "all" || activeSurvey?.show_brands_section === true;

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
            activeTab === "all"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:border-primary/30"
          }`}
        >
          Geral
          <Badge variant="secondary" className="ml-2 text-xs">
            {allResponses.length}
          </Badge>
        </button>
        {visibleSurveys.map((survey) => {
          const count = allResponses.filter((r) => r.survey_id === survey.id).length;
          return (
            <button
              key={survey.id}
              onClick={() => setActiveTab(survey.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                activeTab === survey.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {survey.title}
              <Badge variant="secondary" className="ml-2 text-xs">
                {count}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Section label */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">{surveyName}</h2>
        {activeTab !== "all" && (
          <Badge variant="outline" className="text-xs">
            {filteredResponses.length} respostas
          </Badge>
        )}
      </div>

      {/* Stats */}
      <StatsCards responses={filteredResponses} />

      {/* Charts — só para pesquisas com seção de marcas ativa */}
      {showBrandsCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BrandsChart responses={filteredResponses} />
          <ProductsChart responses={filteredResponses} />
        </div>
      )}

      {/* Per-question stats (only when a specific survey is selected) */}
      {activeTab !== "all" && (
        <QuestionStats surveyId={activeTab} responses={filteredResponses} />
      )}

      {/* Comments */}
      <CommentsPanel responses={filteredResponses} />

      {/* Table */}
      <ResponsesTable responses={filteredResponses} />
    </div>
  );
}
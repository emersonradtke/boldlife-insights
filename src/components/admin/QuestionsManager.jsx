import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Pencil } from "lucide-react";
import QuestionForm, { QUESTION_TYPES } from "./QuestionForm";

const DEFAULT_NEW = {
  question_text: "",
  question_type: "text",
  is_required: false,
  survey_id: "",
  options: [""],
  scale_min: 1,
  scale_max: 5,
  scale_min_label: "",
  scale_max_label: "",
  grid_rows: [""],
  grid_columns: [""],
};

export default function QuestionsManager() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterSurveyId, setFilterSurveyId] = useState("all");

  const { data: questions = [] } = useQuery({
    queryKey: ["custom-questions"],
    queryFn: () => base44.entities.CustomQuestion.list("sort_order", 100),
  });

  const { data: surveys = [] } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => base44.entities.Survey.list("sort_order", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomQuestion.create({ ...data, is_active: true, sort_order: questions.length + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-questions"] });
      setIsAdding(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CustomQuestion.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-questions"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomQuestion.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["custom-questions"] }),
  });

  const getSurveyName = (id) => {
    if (!id) return "Todas as pesquisas";
    return surveys.find((s) => s.id === id)?.title || "—";
  };

  const filteredQuestions = filterSurveyId === "all"
    ? questions
    : questions.filter((q) => q.survey_id === filterSurveyId);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Perguntas Personalizadas</CardTitle>
          <Button size="sm" onClick={() => { setIsAdding(true); setEditingId(null); }} className="gap-1.5">
            <Plus className="w-4 h-4" />
            Nova Pergunta
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          As perguntas ativas aparecem no formulário público após as seções padrão.
        </p>

        {surveys.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterSurveyId("all")}
              className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
                filterSurveyId === "all"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              Todas
            </button>
            {surveys.map((s) => (
              <button
                key={s.id}
                onClick={() => setFilterSurveyId(s.id)}
                className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
                  filterSurveyId === s.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {isAdding && (
          <QuestionForm
            initial={DEFAULT_NEW}
            surveys={surveys}
            onSave={(d) => createMutation.mutate(d)}
            onCancel={() => setIsAdding(false)}
            isPending={createMutation.isPending}
          />
        )}

        {filteredQuestions.length === 0 && !isAdding ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            Nenhuma pergunta encontrada
          </p>
        ) : (
          filteredQuestions.map((q) => (
            <div key={q.id} className="border rounded-xl bg-card overflow-hidden">
              {editingId === q.id ? (
                <QuestionForm
                  initial={q}
                  surveys={surveys}
                  onSave={(d) => updateMutation.mutate({ id: q.id, data: d })}
                  onCancel={() => setEditingId(null)}
                  isPending={updateMutation.isPending}
                />
              ) : (
                <div className="flex items-start gap-3 p-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{q.question_text}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="outline" className="text-xs">{QUESTION_TYPES[q.question_type] || q.question_type}</Badge>
                      {q.is_required && <Badge className="text-xs bg-destructive/10 text-destructive border-0">Obrigatória</Badge>}
                      <Badge variant="outline" className="text-xs text-muted-foreground">{getSurveyName(q.survey_id)}</Badge>
                    </div>
                    {/* Preview options/scale/grid */}
                    {q.options?.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Opções: {q.options.join(", ")}
                      </p>
                    )}
                    {q.question_type === "linear_scale" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Escala: {q.scale_min} → {q.scale_max}
                        {q.scale_min_label && ` (${q.scale_min_label}`}
                        {q.scale_max_label && ` → ${q.scale_max_label})`}
                      </p>
                    )}
                    {q.question_type === "choice_grid" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Grade: {q.grid_rows?.length || 0} linhas × {q.grid_columns?.length || 0} colunas
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={q.is_active}
                        onCheckedChange={(val) => updateMutation.mutate({ id: q.id, data: { is_active: val } })}
                      />
                      <span className="text-xs text-muted-foreground">{q.is_active ? "Ativa" : "Inativa"}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 text-muted-foreground hover:text-primary"
                      onClick={() => { setEditingId(q.id); setIsAdding(false); }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(q.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
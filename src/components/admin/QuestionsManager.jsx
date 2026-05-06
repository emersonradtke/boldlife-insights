import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical } from "lucide-react";

const QUESTION_TYPES = {
  text: "Texto curto",
  textarea: "Texto longo",
  rating: "Avaliação (estrelas)",
  yesno: "Sim / Não",
};

export default function QuestionsManager() {
  const queryClient = useQueryClient();
  const [newQuestion, setNewQuestion] = useState({ question_text: "", question_type: "text", is_required: false });
  const [isAdding, setIsAdding] = useState(false);

  const { data: questions = [] } = useQuery({
    queryKey: ["custom-questions"],
    queryFn: () => base44.entities.CustomQuestion.list("sort_order", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomQuestion.create({ ...data, is_active: true, sort_order: questions.length + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-questions"] });
      setNewQuestion({ question_text: "", question_type: "text", is_required: false });
      setIsAdding(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CustomQuestion.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["custom-questions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomQuestion.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["custom-questions"] }),
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Perguntas Personalizadas</CardTitle>
          <Button size="sm" onClick={() => setIsAdding(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            Nova Pergunta
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          As perguntas ativas aparecem no formulário público após as seções padrão.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add form */}
        {isAdding && (
          <div className="border rounded-xl p-4 bg-muted/30 space-y-3">
            <div>
              <Label>Texto da pergunta</Label>
              <Input
                className="mt-1"
                placeholder="Digite a pergunta..."
                value={newQuestion.question_text}
                onChange={(e) => setNewQuestion((p) => ({ ...p, question_text: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo de resposta</Label>
                <Select
                  value={newQuestion.question_type}
                  onValueChange={(val) => setNewQuestion((p) => ({ ...p, question_type: val }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QUESTION_TYPES).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-0.5">
                <Switch
                  checked={newQuestion.is_required}
                  onCheckedChange={(val) => setNewQuestion((p) => ({ ...p, is_required: val }))}
                />
                <Label>Obrigatória</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => createMutation.mutate(newQuestion)}
                disabled={!newQuestion.question_text || createMutation.isPending}
              >
                Salvar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* List */}
        {questions.length === 0 && !isAdding ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            Nenhuma pergunta adicionada ainda
          </p>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="flex items-start gap-3 border rounded-xl p-4 bg-card">
              <GripVertical className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{q.question_text}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="text-xs">{QUESTION_TYPES[q.question_type]}</Badge>
                  {q.is_required && <Badge className="text-xs bg-destructive/10 text-destructive border-0">Obrigatória</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
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
                  className="w-8 h-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteMutation.mutate(q.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, Pencil, Check, X, GripVertical,
  ChevronUp, ChevronDown, ClipboardList, Eye, EyeOff
} from "lucide-react";
import ResetSurveyStatsButton from "./ResetSurveyStatsButton";
import DeleteSurveyDialog from "./DeleteSurveyDialog";

const DEFAULT_SURVEY = {
  title: "",
  description: "",
  is_visible: true,
  sort_order: 0,
  show_brands_section: true,
  show_rating_section: true,
  show_associate_code: true,
  require_associate_code: false,
  submit_button_text: "Enviar Pesquisa de Opinião",
  thankyou_title: "Obrigado pelo seu feedback!",
  thankyou_message: "Sua opinião é fundamental para continuarmos evoluindo o ecossistema Bold Life.",
};

function SurveyForm({ initial, onSave, onCancel, isPending }) {
  const [data, setData] = useState({ ...DEFAULT_SURVEY, ...initial });
  const set = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const BoolField = ({ label, field }) => (
    <div className="flex items-center gap-2">
      <Switch checked={!!data[field]} onCheckedChange={(v) => set(field, v)} />
      <Label className="cursor-pointer">{label}</Label>
    </div>
  );

  return (
    <div className="border rounded-xl p-4 bg-muted/30 space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label>Título da pesquisa *</Label>
          <Input className="mt-1" value={data.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex: Pesquisa de Satisfação Q2 2025" />
        </div>
        <div>
          <Label>Descrição / Subtítulo</Label>
          <Textarea className="mt-1 min-h-[70px]" value={data.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Texto explicativo exibido abaixo do título..." />
        </div>
        <div>
          <Label>Texto do botão Enviar</Label>
          <Input className="mt-1" value={data.submit_button_text || ""} onChange={(e) => set("submit_button_text", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Título — Página de agradecimento</Label>
            <Input className="mt-1" value={data.thankyou_title || ""} onChange={(e) => set("thankyou_title", e.target.value)} />
          </div>
          <div>
            <Label>Mensagem — Página de agradecimento</Label>
            <Input className="mt-1" value={data.thankyou_message || ""} onChange={(e) => set("thankyou_message", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-1">
        <BoolField label="Visível ao público" field="is_visible" />
        <BoolField label="Seção de Marcas/Produtos" field="show_brands_section" />
        <BoolField label="Seção de Avaliação" field="show_rating_section" />
        <BoolField label="Campo de código do associado" field="show_associate_code" />
        <BoolField label="Código obrigatório" field="require_associate_code" />
      </div>

      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={() => onSave(data)} disabled={!data.title.trim() || isPending} className="gap-1.5">
          <Check className="w-3.5 h-3.5" /> Salvar
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="gap-1.5">
          <X className="w-3.5 h-3.5" /> Cancelar
        </Button>
      </div>
    </div>
  );
}

export default function SurveyManager() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, surveyId: null, surveyTitle: "" });

  const { data: surveys = [] } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => base44.entities.Survey.list("sort_order", 100),
  });

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.Survey.create({ ...d, sort_order: surveys.length + 1 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["surveys"] }); setIsAdding(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Survey.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["surveys"] }); setEditingId(null); },
  });



  const moveOrder = (survey, direction) => {
    const sorted = [...surveys].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const idx = sorted.findIndex((s) => s.id === survey.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapTarget = sorted[swapIdx];
    const aOrder = survey.sort_order || idx + 1;
    const bOrder = swapTarget.sort_order || swapIdx + 1;
    updateMutation.mutate({ id: survey.id, data: { sort_order: bOrder } });
    updateMutation.mutate({ id: swapTarget.id, data: { sort_order: aOrder } });
  };

  const sorted = [...surveys].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Pesquisas</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Gerencie as pesquisas, visibilidade e ordem de exibição
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setIsAdding(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Nova Pesquisa
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isAdding && (
          <SurveyForm
            initial={DEFAULT_SURVEY}
            onSave={(d) => createMutation.mutate(d)}
            onCancel={() => setIsAdding(false)}
            isPending={createMutation.isPending}
          />
        )}

        {sorted.length === 0 && !isAdding && (
          <p className="text-center text-muted-foreground text-sm py-8">
            Nenhuma pesquisa criada ainda. Clique em "Nova Pesquisa" para começar.
          </p>
        )}

        {sorted.map((survey, idx) => (
          <div key={survey.id} className="border rounded-xl bg-card overflow-hidden">
            {editingId === survey.id ? (
              <SurveyForm
                initial={survey}
                onSave={(d) => updateMutation.mutate({ id: survey.id, data: d })}
                onCancel={() => setEditingId(null)}
                isPending={updateMutation.isPending}
              />
            ) : (
              <div className="flex items-start gap-3 p-4">
                <div className="flex flex-col gap-0.5 mt-1">
                  <button onClick={() => moveOrder(survey, -1)} disabled={idx === 0} className="disabled:opacity-30 hover:text-primary transition-colors">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <button onClick={() => moveOrder(survey, 1)} disabled={idx === sorted.length - 1} className="disabled:opacity-30 hover:text-primary transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{survey.title}</p>
                    <Badge variant={survey.is_visible ? "default" : "outline"} className="text-xs gap-1">
                      {survey.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {survey.is_visible ? "Visível" : "Oculta"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Ordem #{idx + 1}</span>
                  </div>
                  {survey.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{survey.description}</p>
                  )}
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {survey.show_brands_section && <Badge variant="outline" className="text-xs">Marcas</Badge>}
                    {survey.show_rating_section && <Badge variant="outline" className="text-xs">Avaliação</Badge>}
                    {survey.show_associate_code && <Badge variant="outline" className="text-xs">Cód. Associado</Badge>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={!!survey.is_visible}
                    onCheckedChange={(v) => updateMutation.mutate({ id: survey.id, data: { is_visible: v } })}
                  />
                  <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => setEditingId(survey.id)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <ResetSurveyStatsButton surveyId={survey.id} surveyTitle={survey.title} />
                  <DeleteSurveyDialog
                    surveyId={survey.id}
                    surveyTitle={survey.title}
                    isOpen={deleteDialog.open && deleteDialog.surveyId === survey.id}
                    onOpenChange={(open) => setDeleteDialog({ open, surveyId: open ? survey.id : null, surveyTitle: open ? survey.title : "" })}
                    onSuccess={() => setDeleteDialog({ open: false, surveyId: null, surveyTitle: "" })}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        <DeleteSurveyDialog
          surveyId={deleteDialog.surveyId}
          surveyTitle={deleteDialog.surveyTitle}
          isOpen={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog((p) => ({ ...p, open }))}
          onSuccess={() => setDeleteDialog({ open: false, surveyId: null, surveyTitle: "" })}
        />
      </CardContent>
    </Card>
  );
}
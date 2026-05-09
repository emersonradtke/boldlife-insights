import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Check, X, Plus, Trash2 } from "lucide-react";

export const QUESTION_TYPES = {
  text: "Resposta curta",
  textarea: "Parágrafo",
  multiple_choice: "Múltipla escolha",
  checkbox: "Caixas de seleção",
  dropdown: "Lista suspensa",
  file_upload: "Upload de arquivo",
  linear_scale: "Escala linear",
  choice_grid: "Grade de múltipla escolha",
  date: "Data",
  time: "Horário",
  rating: "Avaliação (estrelas)",
  yesno: "Sim / Não",
};

const TYPES_WITH_OPTIONS = ["multiple_choice", "checkbox", "dropdown"];
const TYPES_WITH_SCALE = ["linear_scale"];
const TYPES_WITH_GRID = ["choice_grid"];

const DEFAULT_FORM = {
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

function OptionsEditor({ label, items, onChange }) {
  const update = (i, v) => { const next = [...items]; next[i] = v; onChange(next); };
  const add = () => onChange([...items, ""]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <div className="space-y-2">
        {items.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={opt}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`Opção ${i + 1}`}
              className="text-sm"
            />
            {items.length > 1 && (
              <Button size="icon" variant="ghost" className="w-8 h-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(i)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={add} className="gap-1.5 text-xs">
          <Plus className="w-3 h-3" /> Adicionar opção
        </Button>
      </div>
    </div>
  );
}

export default function QuestionForm({ initial, surveys, onSave, onCancel, isPending }) {
  const [data, setData] = useState({ ...DEFAULT_FORM, ...initial });

  useEffect(() => {
    setData({ ...DEFAULT_FORM, ...initial });
  }, [initial]);

  const set = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const hasOptions = TYPES_WITH_OPTIONS.includes(data.question_type);
  const hasScale = TYPES_WITH_SCALE.includes(data.question_type);
  const hasGrid = TYPES_WITH_GRID.includes(data.question_type);

  const handleSave = () => {
    const payload = { ...data };
    // Clean up irrelevant fields
    if (!hasOptions) { payload.options = undefined; }
    if (!hasScale) { payload.scale_min = undefined; payload.scale_max = undefined; payload.scale_min_label = undefined; payload.scale_max_label = undefined; }
    if (!hasGrid) { payload.grid_rows = undefined; payload.grid_columns = undefined; }
    // Filter empty options/rows/cols
    if (hasOptions) payload.options = (payload.options || []).filter(Boolean);
    if (hasGrid) {
      payload.grid_rows = (payload.grid_rows || []).filter(Boolean);
      payload.grid_columns = (payload.grid_columns || []).filter(Boolean);
    }
    onSave(payload);
  };

  return (
    <div className="border rounded-xl p-4 bg-muted/30 space-y-4">
      {/* Question text */}
      <div>
        <Label>Texto da pergunta *</Label>
        <Input
          className="mt-1"
          placeholder="Digite a pergunta..."
          value={data.question_text}
          onChange={(e) => set("question_text", e.target.value)}
        />
      </div>

      {/* Survey + Type + Required */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>Pesquisa</Label>
          <Select value={data.survey_id || ""} onValueChange={(v) => set("survey_id", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Todas as pesquisas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todas as pesquisas</SelectItem>
              {surveys.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Tipo de resposta</Label>
          <Select value={data.question_type} onValueChange={(v) => set("question_type", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text" disabled className="font-semibold text-xs text-muted-foreground pointer-events-none">— Abertas —</SelectItem>
              <SelectItem value="text">Resposta curta</SelectItem>
              <SelectItem value="textarea">Parágrafo</SelectItem>
              <SelectItem value="_closed" disabled className="font-semibold text-xs text-muted-foreground pointer-events-none">— Fechadas —</SelectItem>
              <SelectItem value="multiple_choice">Múltipla escolha</SelectItem>
              <SelectItem value="checkbox">Caixas de seleção</SelectItem>
              <SelectItem value="dropdown">Lista suspensa</SelectItem>
              <SelectItem value="yesno">Sim / Não</SelectItem>
              <SelectItem value="_structured" disabled className="font-semibold text-xs text-muted-foreground pointer-events-none">— Estruturadas —</SelectItem>
              <SelectItem value="linear_scale">Escala linear</SelectItem>
              <SelectItem value="choice_grid">Grade de múltipla escolha</SelectItem>
              <SelectItem value="rating">Avaliação (estrelas)</SelectItem>
              <SelectItem value="file_upload">Upload de arquivo</SelectItem>
              <SelectItem value="date">Data</SelectItem>
              <SelectItem value="time">Horário</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2 pb-0.5">
          <Switch checked={data.is_required} onCheckedChange={(v) => set("is_required", v)} />
          <Label>Obrigatória</Label>
        </div>
      </div>

      {/* Options for multiple_choice / checkbox / dropdown */}
      {hasOptions && (
        <OptionsEditor
          label="Opções de resposta"
          items={data.options?.length ? data.options : [""]}
          onChange={(v) => set("options", v)}
        />
      )}

      {/* Linear scale config */}
      {hasScale && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor mínimo</Label>
              <Select value={String(data.scale_min ?? 1)} onValueChange={(v) => set("scale_min", Number(v))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0, 1].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor máximo</Label>
              <Select value={String(data.scale_max ?? 5)} onValueChange={(v) => set("scale_max", Number(v))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2,3,4,5,6,7,8,9,10].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Label do mínimo</Label>
              <Input className="mt-1" placeholder="Ex: Muito insatisfeito" value={data.scale_min_label || ""} onChange={(e) => set("scale_min_label", e.target.value)} />
            </div>
            <div>
              <Label>Label do máximo</Label>
              <Input className="mt-1" placeholder="Ex: Muito satisfeito" value={data.scale_max_label || ""} onChange={(e) => set("scale_max_label", e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Grid config */}
      {hasGrid && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OptionsEditor
            label="Linhas (itens)"
            items={data.grid_rows?.length ? data.grid_rows : [""]}
            onChange={(v) => set("grid_rows", v)}
          />
          <OptionsEditor
            label="Colunas (opções)"
            items={data.grid_columns?.length ? data.grid_columns : [""]}
            onChange={(v) => set("grid_columns", v)}
          />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={handleSave} disabled={!data.question_text.trim() || isPending} className="gap-1.5">
          <Check className="w-3.5 h-3.5" /> Salvar
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="gap-1.5">
          <X className="w-3.5 h-3.5" /> Cancelar
        </Button>
      </div>
    </div>
  );
}
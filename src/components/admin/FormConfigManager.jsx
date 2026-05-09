import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings2, Save, RotateCcw, CheckCircle2 } from "lucide-react";

const DEFAULT_CONFIGS = [
  // Textos gerais
  { key: "form_title", value: "Pesquisa de Opinião", label: "Título da Pesquisa", group: "textos" },
  { key: "form_subtitle", value: "Sua opinião é muito importante para nós. Responda as perguntas abaixo e nos ajude a melhorar a plataforma Bold Life.", label: "Subtítulo / Descrição", group: "textos" },
  { key: "footer_text", value: "© 2025 Bold Life Ecosystem. Todos os direitos reservados.", label: "Texto do Rodapé", group: "textos" },
  { key: "submit_button_text", value: "Enviar Pesquisa de Opinião", label: "Texto do Botão Enviar", group: "textos" },
  { key: "thankyou_title", value: "Obrigado pelo seu feedback!", label: "Título da página de agradecimento", group: "textos" },
  { key: "thankyou_message", value: "Sua opinião é fundamental para continuarmos evoluindo o ecossistema Bold Life.", label: "Mensagem de agradecimento", group: "textos" },
  // Seções
  { key: "section1_title", value: "Dados Pessoais", label: "Título — Seção 1 (Dados Pessoais)", group: "textos" },
  { key: "section2_title", value: "Vínculo Bold Life", label: "Título — Seção 2 (Vínculo)", group: "textos" },
  { key: "section3_title", value: "Marcas e Produtos", label: "Título — Seção 3 (Marcas e Produtos)", group: "textos" },
  { key: "section4_title", value: "Avaliação e Opinião", label: "Título — Seção 4 (Avaliação)", group: "textos" },
  // Labels de campos
  { key: "label_full_name", value: "Nome Completo *", label: "Label — Nome completo", group: "campos" },
  { key: "label_email", value: "E-mail *", label: "Label — E-mail", group: "campos" },
  { key: "label_phone", value: "Telefone", label: "Label — Telefone", group: "campos" },
  { key: "label_is_associate", value: "Você é associado(a) Bold Life? *", label: "Label — Pergunta de associado", group: "campos" },
  { key: "label_associate_yes", value: "Sim, sou associado", label: "Label — Opção Sim (associado)", group: "campos" },
  { key: "label_associate_no", value: "Não sou associado", label: "Label — Opção Não (associado)", group: "campos" },
  { key: "label_associate_code", value: "Código do Associado", label: "Label — Código do associado", group: "campos" },
  { key: "placeholder_associate_code", value: "Ex: BL-00000", label: "Placeholder — Código do associado", group: "campos" },
  { key: "label_brands", value: "Quais marcas você gostaria de ver na plataforma?", label: "Label — Marcas desejadas", group: "campos" },
  { key: "label_products", value: "Quais produtos gostaria de encontrar?", label: "Label — Produtos desejados", group: "campos" },
  { key: "label_rating", value: "Como você avalia o ecossistema Bold Life?", label: "Label — Avaliação", group: "campos" },
  { key: "label_comments", value: "Comentários e Sugestões", label: "Label — Comentários", group: "campos" },
  { key: "placeholder_comments", value: "Compartilhe suas ideias, sugestões ou feedbacks...", label: "Placeholder — Comentários", group: "campos" },
  // Configurações gerais
  { key: "show_brands_section", value: "true", label: "Exibir seção de Marcas e Produtos", group: "geral" },
  { key: "show_rating_section", value: "true", label: "Exibir seção de Avaliação e Opinião", group: "geral" },
  { key: "show_associate_code", value: "true", label: "Exibir campo de Código do Associado", group: "geral" },
  { key: "require_associate_code", value: "false", label: "Tornar Código do Associado obrigatório", group: "geral" },
  { key: "logo_url", value: "https://media.base44.com/images/public/69fb67ec22eeed7efb852e91/64630ae96_BOLDLIFE02-LOGO1.png", label: "URL do Logo", group: "geral" },
];

export function useFormConfig() {
  const { data: configs = [] } = useQuery({
    queryKey: ["form-config"],
    queryFn: () => base44.entities.FormConfig.list("key", 100),
  });

  const getConfig = (key) => {
    const found = configs.find((c) => c.key === key);
    if (found) return found.value;
    const def = DEFAULT_CONFIGS.find((c) => c.key === key);
    return def ? def.value : "";
  };

  return { getConfig, configs };
}

const GROUP_LABELS = { textos: "Textos e Títulos", campos: "Labels dos Campos", geral: "Configurações Gerais" };
const GROUP_ORDER = ["textos", "campos", "geral"];

export default function FormConfigManager() {
  const queryClient = useQueryClient();
  const [activeGroup, setActiveGroup] = useState("textos");
  const [localValues, setLocalValues] = useState({});
  const [saved, setSaved] = useState(false);

  const { data: configs = [] } = useQuery({
    queryKey: ["form-config"],
    queryFn: () => base44.entities.FormConfig.list("key", 100),
  });

  // Initialize localValues from DB + defaults
  useEffect(() => {
    const initial = {};
    DEFAULT_CONFIGS.forEach((def) => {
      const found = configs.find((c) => c.key === def.key);
      initial[def.key] = found ? found.value : def.value;
    });
    setLocalValues(initial);
  }, [configs]);

  const saveMutation = useMutation({
    mutationFn: async (updates) => {
      for (const { key, value, label, group } of updates) {
        const existing = configs.find((c) => c.key === key);
        if (existing) {
          await base44.entities.FormConfig.update(existing.id, { value });
        } else {
          await base44.entities.FormConfig.create({ key, value, label, group });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-config"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const handleSave = () => {
    const groupDefs = DEFAULT_CONFIGS.filter((d) => d.group === activeGroup);
    const updates = groupDefs.map((def) => ({
      key: def.key,
      value: localValues[def.key] ?? def.value,
      label: def.label,
      group: def.group,
    }));
    saveMutation.mutate(updates);
  };

  const handleReset = () => {
    const reset = { ...localValues };
    DEFAULT_CONFIGS.filter((d) => d.group === activeGroup).forEach((def) => {
      reset[def.key] = def.value;
    });
    setLocalValues(reset);
  };

  const groupDefs = DEFAULT_CONFIGS.filter((d) => d.group === activeGroup);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Configurações do Formulário</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Edite textos, labels e comportamento de todos os campos do formulário público
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {GROUP_ORDER.map((g) => (
            <Button
              key={g}
              size="sm"
              variant={activeGroup === g ? "default" : "outline"}
              onClick={() => setActiveGroup(g)}
            >
              {GROUP_LABELS[g]}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {groupDefs.map((def) => {
          const isLong = def.value.length > 60 || def.key.includes("subtitle") || def.key.includes("message");
          const isBool = def.value === "true" || def.value === "false";
          const isUrl = def.key.includes("url");
          return (
            <div key={def.key}>
              <Label className="text-sm font-medium">{def.label}</Label>
              <p className="text-xs text-muted-foreground mb-1.5 font-mono">{def.key}</p>
              {isBool ? (
                <div className="flex gap-2">
                  {["true", "false"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setLocalValues((p) => ({ ...p, [def.key]: opt }))}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        localValues[def.key] === opt
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {opt === "true" ? "✓ Ativado" : "✕ Desativado"}
                    </button>
                  ))}
                </div>
              ) : isLong ? (
                <Textarea
                  value={localValues[def.key] ?? ""}
                  onChange={(e) => setLocalValues((p) => ({ ...p, [def.key]: e.target.value }))}
                  className="min-h-[80px] mt-1"
                />
              ) : (
                <Input
                  value={localValues[def.key] ?? ""}
                  onChange={(e) => setLocalValues((p) => ({ ...p, [def.key]: e.target.value }))}
                  className="mt-1"
                  type={isUrl ? "url" : "text"}
                />
              )}
            </div>
          );
        })}

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Salvo!" : saveMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Restaurar Padrões
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
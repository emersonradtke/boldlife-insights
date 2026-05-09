import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings2, Save, CheckCircle2, ChevronDown } from "lucide-react";

const DEFAULTS = {
  section1_title: "Dados Pessoais",
  section2_title: "Vínculo Bold Life",
  section3_title: "Marcas e Produtos",
  section4_title: "Avaliação e Opinião",
  label_full_name: "Nome Completo *",
  label_email: "E-mail *",
  label_phone: "Telefone",
  label_is_associate: "Você é associado(a) Bold Life? *",
  label_associate_yes: "Sim, sou associado",
  label_associate_no: "Não sou associado",
  label_associate_code: "Código do Associado",
  placeholder_associate_code: "Ex: BL-00000",
  label_brands: "Quais marcas você gostaria de ver na plataforma?",
  label_products: "Quais produtos gostaria de encontrar?",
  label_rating: "Como você avalia o ecossistema Bold Life?",
  label_comments: "Comentários e Sugestões",
  placeholder_comments: "Compartilhe suas ideias, sugestões ou feedbacks...",
  submit_button_text: "Enviar Pesquisa de Opinião",
  thankyou_title: "Obrigado pelo seu feedback!",
  thankyou_message: "Sua opinião é fundamental para continuarmos evoluindo o ecossistema Bold Life.",
  footer_text: "© 2025 Bold Life Ecosystem. Todos os direitos reservados.",
};

const FIELDS = [
  {
    group: "Seções",
    items: [
      { key: "section1_title", label: "Título — Seção Dados Pessoais" },
      { key: "section2_title", label: "Título — Seção Vínculo" },
      { key: "section3_title", label: "Título — Seção Marcas e Produtos" },
      { key: "section4_title", label: "Título — Seção Avaliação" },
    ],
  },
  {
    group: "Labels dos Campos",
    items: [
      { key: "label_full_name", label: "Label — Nome Completo" },
      { key: "label_email", label: "Label — E-mail" },
      { key: "label_phone", label: "Label — Telefone" },
      { key: "label_is_associate", label: "Label — Pergunta de Associado" },
      { key: "label_associate_yes", label: "Label — Opção Sim (associado)" },
      { key: "label_associate_no", label: "Label — Opção Não (associado)" },
      { key: "label_associate_code", label: "Label — Código do Associado" },
      { key: "placeholder_associate_code", label: "Placeholder — Código do Associado" },
      { key: "label_brands", label: "Label — Marcas Desejadas" },
      { key: "label_products", label: "Label — Produtos Desejados" },
      { key: "label_rating", label: "Label — Avaliação" },
      { key: "label_comments", label: "Label — Comentários" },
      { key: "placeholder_comments", label: "Placeholder — Comentários" },
    ],
  },
  {
    group: "Botão e Agradecimento",
    items: [
      { key: "submit_button_text", label: "Texto do Botão Enviar" },
      { key: "thankyou_title", label: "Título — Página de Agradecimento" },
      { key: "thankyou_message", label: "Mensagem — Página de Agradecimento", long: true },
      { key: "footer_text", label: "Texto do Rodapé" },
    ],
  },
];

export default function SurveyFormConfig() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState(false);

  const { data: surveys = [] } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => base44.entities.Survey.list("sort_order", 100),
  });

  const visibleSurveys = surveys.filter((s) => s.is_visible !== false);
  const selectedSurvey = surveys.find((s) => s.id === selectedId) || null;

  // Auto-select first
  useEffect(() => {
    if (!selectedId && surveys.length > 0) {
      setSelectedId(surveys[0].id);
    }
  }, [surveys, selectedId]);

  // Populate form when survey changes
  useEffect(() => {
    if (!selectedSurvey) return;
    const initial = {};
    Object.keys(DEFAULTS).forEach((k) => {
      initial[k] = selectedSurvey[k] || "";
    });
    setValues(initial);
  }, [selectedId, surveys]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Survey.update(selectedId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(values);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Configurações por Pesquisa</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Personalize os textos e labels de cada pesquisa individualmente
            </p>
          </div>
        </div>

        {/* Survey selector */}
        {surveys.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {surveys.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                  selectedId === s.id
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

      <CardContent className="space-y-6">
        {!selectedSurvey && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Crie uma pesquisa no painel acima para configurar seus textos.
          </p>
        )}

        {selectedSurvey && FIELDS.map((group) => (
          <div key={group.group}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {group.group}
            </p>
            <div className="space-y-3">
              {group.items.map((field) => (
                <div key={field.key}>
                  <Label className="text-sm">{field.label}</Label>
                  <p className="text-xs text-muted-foreground font-mono mb-1">
                    padrão: {DEFAULTS[field.key]}
                  </p>
                  {field.long ? (
                    <Textarea
                      value={values[field.key] || ""}
                      onChange={(e) => setValues((p) => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={DEFAULTS[field.key]}
                      className="min-h-[70px]"
                    />
                  ) : (
                    <Input
                      value={values[field.key] || ""}
                      onChange={(e) => setValues((p) => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={DEFAULTS[field.key]}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {selectedSurvey && (
          <div className="pt-2">
            <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Salvo!" : updateMutation.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
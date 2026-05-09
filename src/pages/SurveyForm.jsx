import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import SurveyHeader from "@/components/survey/SurveyHeader";
import BrandInput from "@/components/survey/BrandInput";
import ProductInput from "@/components/survey/ProductInput";
import RatingStars from "@/components/survey/RatingStars";
import DynamicQuestions from "@/components/survey/DynamicQuestions";
import { useFormConfig } from "@/components/admin/FormConfigManager";

function getAssociateDataFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return null;
    return JSON.parse(atob(token));
  } catch { return null; }
}

function getPrefillFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const prefill = params.get("prefill");
    if (!prefill) return null;
    return JSON.parse(atob(prefill));
  } catch { return null; }
}

function getSurveyIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("survey_id") || null;
}

// Verifica se um campo de formulário está respondido
function isFieldAnswered(value) {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export default function SurveyForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getConfig } = useFormConfig();

  const associateData = getAssociateDataFromUrl();
  const prefillData = getPrefillFromUrl();
  const urlSurveyId = getSurveyIdFromUrl();
  const seedData = prefillData || (associateData ? {
    full_name: associateData.full_name || "",
    email: associateData.email || "",
    phone: associateData.phone || "",
    is_associate: true,
    associate_code: associateData.associate_code || "",
  } : null);

  const buildFormData = (seed) => ({
    full_name: seed?.full_name || "",
    email: seed?.email || "",
    phone: seed?.phone || "",
    is_associate: seed ? seed.is_associate : false,
    associate_code: seed?.associate_code || "",
    desired_brands: [],
    desired_products: [],
    comments: "",
    satisfaction_rating: null,
    custom_answers: {},
  });

  const [formData, setFormData] = useState(() => buildFormData(seedData));

  // Sempre que a URL mudar (novo survey_id ou novo prefill), reinicia o formulário
  useEffect(() => {
    const newPrefill = getPrefillFromUrl();
    const newAssociate = getAssociateDataFromUrl();
    const newSeed = newPrefill || (newAssociate ? {
      full_name: newAssociate.full_name || "",
      email: newAssociate.email || "",
      phone: newAssociate.phone || "",
      is_associate: true,
      associate_code: newAssociate.associate_code || "",
    } : null);
    setFormData(buildFormData(newSeed));
  }, [location.search]);

  const [navBlocked, setNavBlocked] = useState(false);

  const { data: surveys = [] } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => base44.entities.Survey.list("sort_order", 100),
  });

  const { data: questions = [] } = useQuery({
    queryKey: ["custom-questions"],
    queryFn: () => base44.entities.CustomQuestion.list("sort_order", 100),
  });

  const visibleSurveys = [...surveys]
    .filter((s) => s.is_visible !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const currentIndex = urlSurveyId
    ? visibleSurveys.findIndex((s) => s.id === urlSurveyId)
    : 0;
  const activeSurvey = visibleSurveys[currentIndex >= 0 ? currentIndex : 0] || null;

  const activeQuestions = questions
    .filter((q) => q.is_active !== false && (!q.survey_id || q.survey_id === activeSurvey?.id))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const showBrands = activeSurvey ? activeSurvey.show_brands_section !== false : getConfig("show_brands_section") !== "false";
  const showRating = activeSurvey ? activeSurvey.show_rating_section !== false : getConfig("show_rating_section") !== "false";
  const showAssociateCode = activeSurvey ? activeSurvey.show_associate_code !== false : getConfig("show_associate_code") !== "false";
  const requireAssociateCode = activeSurvey ? !!activeSurvey.require_associate_code : getConfig("require_associate_code") === "true";
  const submitButtonText = activeSurvey?.submit_button_text || getConfig("submit_button_text") || "Enviar Pesquisa";

  const lbl = (surveyKey, configKey, fallback) =>
    activeSurvey?.[surveyKey] || getConfig(configKey) || fallback;

  // Verifica se o formulário está completo o suficiente para navegar
  function isFormComplete() {
    if (!formData.full_name.trim()) return false;
    if (!formData.email.trim()) return false;
    if (formData.is_associate === null || formData.is_associate === undefined) return false;
    if (formData.is_associate && requireAssociateCode && !formData.associate_code.trim()) return false;
    return true;
  }

  function navigateToSurvey(survey) {
    if (!isFormComplete()) {
      setNavBlocked(true);
      setTimeout(() => setNavBlocked(false), 3000);
      return;
    }
    setNavBlocked(false);
    const params = new URLSearchParams();
    params.set("survey_id", survey.id);
    params.set("prefill", btoa(JSON.stringify({
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      is_associate: formData.is_associate,
      associate_code: formData.associate_code,
    })));
    navigate(`/?${params.toString()}`);
  }

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.SurveyResponse.create(data),
    onSuccess: () => {
      const nextSurvey = visibleSurveys[currentIndex + 1] || null;
      navigate("/obrigado", {
        state: {
          survey: activeSurvey,
          nextSurvey,
          personalData: {
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            is_associate: formData.is_associate,
            associate_code: formData.associate_code,
          },
        },
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) return;
    if (formData.is_associate && requireAssociateCode && !formData.associate_code) return;
    submitMutation.mutate({ ...formData, survey_id: activeSurvey?.id || null });
  };

  const set = (field) => (val) => setFormData((p) => ({ ...p, [field]: val }));

  // Seções sempre visíveis, mas botão/submit só aparece após obrigatórios preenchidos
  const sectionPersonalDone = true;
  const sectionAssociateDone = true;

  return (
    <div className="min-h-screen bg-background">
      <div className="h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Survey navigation arrows */}
        {visibleSurveys.length > 1 && (
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={currentIndex <= 0}
              onClick={() => navigateToSurvey(visibleSurveys[currentIndex - 1])}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <span className="text-xs text-muted-foreground font-medium">
              Pesquisa {currentIndex + 1} de {visibleSurveys.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={currentIndex >= visibleSurveys.length - 1}
              onClick={() => navigateToSurvey(visibleSurveys[currentIndex + 1])}
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Aviso de bloqueio de navegação */}
        <AnimatePresence>
          {navBlocked && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              Preencha pelo menos Nome, E-mail e vínculo antes de trocar de pesquisa.
            </motion.div>
          )}
        </AnimatePresence>

        <SurveyHeader
          associateData={associateData}
          surveyTitle={activeSurvey?.title}
          surveyDescription={activeSurvey?.description}
        />

        <motion.form
          key={activeSurvey?.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Seção 1 — Dados Pessoais */}
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">{lbl("section1_title", "section1_title", "Dados Pessoais")}</h3>
            <div>
              <Label>{lbl("label_full_name", "label_full_name", "Nome Completo *")}</Label>
              <Input className="mt-1" value={formData.full_name} onChange={(e) => set("full_name")(e.target.value)} required />
            </div>

            <div>
              <Label>{lbl("label_email", "label_email", "E-mail *")}</Label>
              <Input className="mt-1" type="email" value={formData.email} onChange={(e) => set("email")(e.target.value)} required />
            </div>

            <div>
              <Label>{lbl("label_phone", "label_phone", "Telefone")}</Label>
              <Input
                className="mt-1"
                value={formData.phone}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "").slice(0, 11);
                  if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
                  else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, "($1) $2-$3");
                  else if (v.length > 2) v = v.replace(/^(\d{2})(\d+)$/, "($1) $2");
                  else if (v.length > 0) v = v.replace(/^(\d+)$/, "($1");
                  set("phone")(v);
                }}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          {/* Seção 2 — Vínculo */}
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">{lbl("section2_title", "section2_title", "Vínculo Bold Life")}</h3>
            <div>
              <Label className="mb-2 block">{lbl("label_is_associate", "label_is_associate", "Você é associado(a) Bold Life? *")}</Label>
              <div className="flex gap-3">
                {[
                  { val: true, label: lbl("label_associate_yes", "label_associate_yes", "Sim, sou associado") },
                  { val: false, label: lbl("label_associate_no", "label_associate_no", "Não sou associado") },
                ].map(({ val, label }) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => set("is_associate")(val)}
                    className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.is_associate === val
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {formData.is_associate && showAssociateCode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <Label>{lbl("label_associate_code", "label_associate_code", "Código do Associado")}{requireAssociateCode ? " *" : ""}</Label>
                  <Input
                    className="mt-1"
                    placeholder={lbl("placeholder_associate_code", "placeholder_associate_code", "Ex: BL-00000")}
                    value={formData.associate_code}
                    onChange={(e) => set("associate_code")(e.target.value)}
                    required={requireAssociateCode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Seção 3 — Marcas e Produtos */}
          {showBrands && (
            <div className="bg-card rounded-2xl border p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{lbl("section3_title", "section3_title", "Marcas e Produtos")}</h3>
              <div>
                <Label>{lbl("label_brands", "label_brands", "Quais marcas você gostaria de ver na plataforma?")}</Label>
                <BrandInput brands={formData.desired_brands} onChange={set("desired_brands")} />
              </div>
              <div>
                <Label>{lbl("label_products", "label_products", "Quais produtos gostaria de encontrar?")}</Label>
                <ProductInput products={formData.desired_products} onChange={set("desired_products")} />
              </div>
            </div>
          )}

          {/* Seção 4 — Avaliação */}
          {showRating && (
            <div className="bg-card rounded-2xl border p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{lbl("section4_title", "section4_title", "Avaliação e Opinião")}</h3>
              <div>
                <Label className="mb-2 block">{lbl("label_rating", "label_rating", "Como você avalia o ecossistema Bold Life?")}</Label>
                <RatingStars rating={formData.satisfaction_rating} onChange={set("satisfaction_rating")} />
              </div>
              <div>
                <Label>{lbl("label_comments", "label_comments", "Comentários e Sugestões")}</Label>
                <Textarea
                  className="mt-1 min-h-[100px]"
                  placeholder={lbl("placeholder_comments", "placeholder_comments", "Compartilhe suas ideias...")}
                  value={formData.comments}
                  onChange={(e) => set("comments")(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Perguntas dinâmicas */}
          {activeQuestions.length > 0 && (
            <DynamicQuestions
              questions={activeQuestions}
              answers={formData.custom_answers}
              onChange={(updated) => set("custom_answers")(updated)}
            />
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {submitButtonText}
          </Button>
        </motion.form>

        <p className="text-center text-xs text-muted-foreground mt-8">
          {lbl("footer_text", "footer_text", "© 2025 Bold Life Ecosystem. Todos os direitos reservados.")}
        </p>
      </div>
    </div>
  );
}
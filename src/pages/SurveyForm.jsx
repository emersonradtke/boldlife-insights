import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Send } from "lucide-react";
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
    const decoded = atob(token);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getSurveyIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("survey_id") || null;
}

export default function SurveyForm() {
  const navigate = useNavigate();
  const { getConfig } = useFormConfig();

  const associateData = getAssociateDataFromUrl();
  const urlSurveyId = getSurveyIdFromUrl();

  const [formData, setFormData] = useState({
    full_name: associateData?.full_name || "",
    email: associateData?.email || "",
    phone: associateData?.phone || "",
    is_associate: associateData ? true : false,
    associate_code: associateData?.associate_code || "",
    desired_brands: [],
    desired_products: [],
    comments: "",
    satisfaction_rating: null,
    custom_answers: {},
  });

  const { data: surveys = [] } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => base44.entities.Survey.list("sort_order", 100),
  });

  const { data: questions = [] } = useQuery({
    queryKey: ["custom-questions"],
    queryFn: () => base44.entities.CustomQuestion.list("sort_order", 100),
  });

  // Pick the active survey
  const visibleSurveys = surveys.filter((s) => s.is_visible !== false);
  const activeSurvey = urlSurveyId
    ? visibleSurveys.find((s) => s.id === urlSurveyId) || visibleSurveys[0]
    : visibleSurveys[0];

  const activeQuestions = questions.filter((q) => q.is_active !== false);

  // Resolve config with survey overrides
  const showBrands = activeSurvey ? activeSurvey.show_brands_section !== false : getConfig("show_brands_section") !== "false";
  const showRating = activeSurvey ? activeSurvey.show_rating_section !== false : getConfig("show_rating_section") !== "false";
  const showAssociateCode = activeSurvey ? activeSurvey.show_associate_code !== false : getConfig("show_associate_code") !== "false";
  const requireAssociateCode = activeSurvey ? !!activeSurvey.require_associate_code : getConfig("require_associate_code") === "true";
  const submitButtonText = activeSurvey?.submit_button_text || getConfig("submit_button_text") || "Enviar Pesquisa";

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.SurveyResponse.create(data),
    onSuccess: () => {
      // Find next visible survey
      const currentIndex = visibleSurveys.findIndex((s) => s.id === activeSurvey?.id);
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

    submitMutation.mutate({
      ...formData,
      survey_id: activeSurvey?.id || null,
    });
  };

  const set = (field) => (val) => setFormData((p) => ({ ...p, [field]: val }));

  return (
    <div className="min-h-screen bg-background">
      <div className="h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <SurveyHeader
          associateData={associateData}
          surveyTitle={activeSurvey?.title}
          surveyDescription={activeSurvey?.description}
        />

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Personal Info */}
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">{getConfig("section1_title") || "Dados Pessoais"}</h3>
            <div>
              <Label>{getConfig("label_full_name") || "Nome Completo *"}</Label>
              <Input className="mt-1" value={formData.full_name} onChange={(e) => set("full_name")(e.target.value)} required />
            </div>
            <div>
              <Label>{getConfig("label_email") || "E-mail *"}</Label>
              <Input className="mt-1" type="email" value={formData.email} onChange={(e) => set("email")(e.target.value)} required />
            </div>
            <div>
              <Label>{getConfig("label_phone") || "Telefone"}</Label>
              <Input className="mt-1" value={formData.phone} onChange={(e) => set("phone")(e.target.value)} />
            </div>
          </div>

          {/* Associate */}
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">{getConfig("section2_title") || "Vínculo Bold Life"}</h3>
            <div>
              <Label className="mb-2 block">{getConfig("label_is_associate") || "Você é associado(a) Bold Life? *"}</Label>
              <div className="flex gap-3">
                {[
                  { val: true, label: getConfig("label_associate_yes") || "Sim, sou associado" },
                  { val: false, label: getConfig("label_associate_no") || "Não sou associado" },
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
            {formData.is_associate && showAssociateCode && (
              <div>
                <Label>{getConfig("label_associate_code") || "Código do Associado"}{requireAssociateCode ? " *" : ""}</Label>
                <Input
                  className="mt-1"
                  placeholder={getConfig("placeholder_associate_code") || "Ex: BL-00000"}
                  value={formData.associate_code}
                  onChange={(e) => set("associate_code")(e.target.value)}
                  required={requireAssociateCode}
                />
              </div>
            )}
          </div>

          {/* Brands & Products */}
          {showBrands && (
            <div className="bg-card rounded-2xl border p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{getConfig("section3_title") || "Marcas e Produtos"}</h3>
              <div>
                <Label>{getConfig("label_brands") || "Quais marcas você gostaria de ver na plataforma?"}</Label>
                <BrandInput brands={formData.desired_brands} onChange={set("desired_brands")} />
              </div>
              <div>
                <Label>{getConfig("label_products") || "Quais produtos gostaria de encontrar?"}</Label>
                <ProductInput value={formData.desired_products} onChange={set("desired_products")} />
              </div>
            </div>
          )}

          {/* Rating */}
          {showRating && (
            <div className="bg-card rounded-2xl border p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{getConfig("section4_title") || "Avaliação e Opinião"}</h3>
              <div>
                <Label className="mb-2 block">{getConfig("label_rating") || "Como você avalia o ecossistema Bold Life?"}</Label>
                <RatingStars value={formData.satisfaction_rating} onChange={set("satisfaction_rating")} />
              </div>
              <div>
                <Label>{getConfig("label_comments") || "Comentários e Sugestões"}</Label>
                <Textarea
                  className="mt-1 min-h-[100px]"
                  placeholder={getConfig("placeholder_comments") || "Compartilhe suas ideias..."}
                  value={formData.comments}
                  onChange={(e) => set("comments")(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Dynamic Questions */}
          {activeQuestions.length > 0 && (
            <DynamicQuestions
              questions={activeQuestions}
              answers={formData.custom_answers}
              onChange={set("custom_answers")}
            />
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {submitButtonText}
          </Button>
        </motion.form>

        <p className="text-center text-xs text-muted-foreground mt-8">
          {getConfig("footer_text") || "© 2025 Bold Life Ecosystem. Todos os direitos reservados."}
        </p>
      </div>
    </div>
  );
}
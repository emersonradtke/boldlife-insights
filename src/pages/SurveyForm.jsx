import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Send, UserCheck, UserX } from "lucide-react";
import SurveyHeader from "../components/survey/SurveyHeader";
import BrandInput from "../components/survey/BrandInput";
import ProductInput from "../components/survey/ProductInput";
import RatingStars from "../components/survey/RatingStars";
import DynamicQuestions from "../components/survey/DynamicQuestions";
import { useFormConfig } from "@/components/admin/FormConfigManager";

function decodeToken(token) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(token))));
  } catch {
    return null;
  }
}

export default function SurveyForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [associateData, setAssociateData] = useState(null);
  const [dynamicAnswers, setDynamicAnswers] = useState({});
  const { getConfig } = useFormConfig();

  const { data: customQuestions = [] } = useQuery({
    queryKey: ["custom-questions"],
    queryFn: () => base44.entities.CustomQuestion.list("sort_order", 100),
  });
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    is_associate: null,
    associate_code: "",
    desired_brands: [],
    desired_products: [],
    comments: "",
    satisfaction_rating: 0,
  });

  // Read token from URL on mount (external platform login)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      const data = decodeToken(token);
      if (data && data.full_name && data.email) {
        setAssociateData(data);
        setFormData((prev) => ({
          ...prev,
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          is_associate: data.is_associate ? "yes" : "no",
          associate_code: data.associate_code || "",
        }));
      }
    }
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    let masked = digits;
    if (digits.length > 0) masked = `(${digits.slice(0, 2)}`;
    if (digits.length > 2) masked += `) ${digits.slice(2, 7)}`;
    if (digits.length > 7) masked += `-${digits.slice(7, 11)}`;
    updateField("phone", masked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await base44.entities.SurveyResponse.create({
        ...formData,
        is_associate: formData.is_associate === "yes",
        associate_code: formData.is_associate === "yes" ? formData.associate_code : "",
        custom_answers: dynamicAnswers,
      });
      navigate("/obrigado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const isFromExternalPlatform = !!associateData;

  // Configurações dinâmicas
  const showBrandsSection = getConfig("show_brands_section") !== "false";
  const showRatingSection = getConfig("show_rating_section") !== "false";
  const showAssociateCode = getConfig("show_associate_code") !== "false";
  const requireAssociateCode = getConfig("require_associate_code") === "true";

  // Lógica de habilitação progressiva
  const hasName = formData.full_name.trim().length > 0;
  const hasEmail = formData.email.trim().length > 0;
  const hasPhone = hasEmail;
  const hasAssociate = !!formData.is_associate;
  const hasAssociateCode = !showAssociateCode || formData.is_associate !== "yes" || !requireAssociateCode || formData.associate_code.trim().length > 0;
  const hasBrandsSection = hasAssociate && hasAssociateCode;
  const hasRatingSection = hasBrandsSection;
  const hasDynamicSection = hasRatingSection;

  return (
    <div className="min-h-screen bg-background">
      {/* Top gradient bar */}
      <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary" />

      <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
        <SurveyHeader associateData={associateData} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-6 space-y-5">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  {getConfig("section1_title")}
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">{getConfig("label_full_name")}</Label>
                    <Input
                      id="full_name"
                      required
                      placeholder="Seu nome completo"
                      value={formData.full_name}
                      onChange={(e) => updateField("full_name", e.target.value)}
                      className="mt-1.5"
                      readOnly={isFromExternalPlatform}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">{getConfig("label_email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="mt-1.5"
                        readOnly={isFromExternalPlatform}
                        disabled={!hasName && !isFromExternalPlatform}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{getConfig("label_phone")}</Label>
                      <Input
                       id="phone"
                       placeholder="(00) 00000-0000"
                       value={formData.phone}
                       onChange={handlePhoneChange}
                       className="mt-1.5"
                       disabled={!hasEmail && !isFromExternalPlatform}
                       maxLength={16}
                       inputMode="numeric"
                      />
                    </div>
                  </div>

                  {isFromExternalPlatform && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                      Dados preenchidos automaticamente via login Bold Life
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Associate Status */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-6 space-y-5">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  {getConfig("section2_title")}
                </h3>

                <div>
                  <Label className="mb-3 block">{getConfig("label_is_associate")}</Label>
                  <RadioGroup
                    value={formData.is_associate || ""}
                    onValueChange={(val) => !isFromExternalPlatform && hasEmail && updateField("is_associate", val)}
                    required
                    className={`flex flex-col sm:flex-row gap-3 transition-opacity duration-200 ${!hasEmail && !isFromExternalPlatform ? "opacity-40 pointer-events-none" : ""}`}
                  >
                    <label className="flex-1 cursor-pointer">
                      <div
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.is_associate === "yes"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <RadioGroupItem value="yes" id="yes" disabled={isFromExternalPlatform} />
                        <UserCheck className="w-5 h-5 text-primary" />
                        <span className="font-medium">{getConfig("label_associate_yes")}</span>
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <div
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.is_associate === "no"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <RadioGroupItem value="no" id="no" disabled={isFromExternalPlatform} />
                        <UserX className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{getConfig("label_associate_no")}</span>
                      </div>
                    </label>
                  </RadioGroup>
                </div>

                <AnimatePresence>
                  {formData.is_associate === "yes" && showAssociateCode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label htmlFor="associate_code">{getConfig("label_associate_code")}</Label>
                      <Input
                        id="associate_code"
                        placeholder={getConfig("placeholder_associate_code")}
                        value={formData.associate_code}
                        onChange={(e) => updateField("associate_code", e.target.value)}
                        className="mt-1.5"
                        readOnly={isFromExternalPlatform}
                        disabled={!hasAssociate && !isFromExternalPlatform}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Brands & Products */}
          {showBrandsSection && <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}
            className={`transition-opacity duration-300 ${!hasBrandsSection ? "opacity-40 pointer-events-none" : ""}`}>
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-6 space-y-5">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  {getConfig("section3_title")}
                </h3>

                <div>
                  <Label className="mb-2 block">
                    {getConfig("label_brands")}
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Digite o nome da marca e pressione Enter ou clique no +
                  </p>
                  <BrandInput
                    brands={formData.desired_brands}
                    onChange={(brands) => updateField("desired_brands", brands)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">
                    {getConfig("label_products")}
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Informe o produto, a quantidade média e a periodicidade de consumo
                  </p>
                  <ProductInput
                    products={formData.desired_products || []}
                    onChange={(products) => updateField("desired_products", products)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>}

          {/* Rating & Comments */}
          {showRatingSection && <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}
            className={`transition-opacity duration-300 ${!hasRatingSection ? "opacity-40 pointer-events-none" : ""}`}>
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-6 space-y-5">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">4</span>
                  </div>
                  {getConfig("section4_title")}
                </h3>

                <div>
                  <Label className="mb-3 block">
                    {getConfig("label_rating")}
                  </Label>
                  <RatingStars
                    rating={formData.satisfaction_rating}
                    onChange={(rating) => updateField("satisfaction_rating", rating)}
                  />
                </div>

                <div>
                  <Label htmlFor="comments">{getConfig("label_comments")}</Label>
                  <Textarea
                    id="comments"
                    placeholder={getConfig("placeholder_comments")}
                    value={formData.comments}
                    onChange={(e) => updateField("comments", e.target.value)}
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>}

          {/* Dynamic Questions */}
          {customQuestions.filter((q) => q.is_active).length > 0 && (
            <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.55 }}
              className={`transition-opacity duration-300 ${!hasDynamicSection ? "opacity-40 pointer-events-none" : ""}`}>
              <Card className="border-0 shadow-md bg-card">
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">5</span>
                    </div>
                    Perguntas Adicionais
                  </h3>
                  <DynamicQuestions
                    questions={customQuestions}
                    answers={dynamicAnswers}
                    onChange={(id, val) => setDynamicAnswers((prev) => ({ ...prev, [id]: val }))}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-2"
          >
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.full_name.trim() ||
                !formData.email.trim() ||
                !formData.is_associate ||
                (formData.is_associate === "yes" && !formData.associate_code.trim())
              }
              className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              {isSubmitting ? "Enviando..." : getConfig("submit_button_text")}
            </Button>
          </motion.div>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center">
          <div className="w-12 h-0.5 bg-primary/30 mx-auto mb-4 rounded-full" />
          <p className="text-xs text-muted-foreground">
            {getConfig("footer_text")}
          </p>
        </div>
      </div>
    </div>
  );
}
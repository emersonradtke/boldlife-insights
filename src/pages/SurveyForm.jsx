import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
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
import RatingStars from "../components/survey/RatingStars";

export default function SurveyForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    is_associate: null,
    associate_code: "",
    desired_brands: [],
    desired_products: "",
    comments: "",
    satisfaction_rating: 0,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await base44.entities.SurveyResponse.create({
      ...formData,
      is_associate: formData.is_associate === "yes",
      associate_code: formData.is_associate === "yes" ? formData.associate_code : "",
    });

    navigate("/obrigado");
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative top bar */}
      <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary" />

      <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
        <SurveyHeader />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-6 space-y-5">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  Dados Pessoais
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Nome Completo *</Label>
                    <Input
                      id="full_name"
                      required
                      placeholder="Seu nome completo"
                      value={formData.full_name}
                      onChange={(e) => updateField("full_name", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Associate Status */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-6 space-y-5">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  Vínculo Bold Life
                </h3>

                <div>
                  <Label className="mb-3 block">Você é associado(a) Bold Life? *</Label>
                  <RadioGroup
                    value={formData.is_associate || ""}
                    onValueChange={(val) => updateField("is_associate", val)}
                    required
                    className="flex gap-4"
                  >
                    <label className="flex-1 cursor-pointer">
                      <div
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.is_associate === "yes"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <RadioGroupItem value="yes" id="yes" />
                        <UserCheck className="w-5 h-5 text-primary" />
                        <span className="font-medium">Sim, sou associado</span>
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
                        <RadioGroupItem value="no" id="no" />
                        <UserX className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">Não sou associado</span>
                      </div>
                    </label>
                  </RadioGroup>
                </div>

                <AnimatePresence>
                  {formData.is_associate === "yes" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label htmlFor="associate_code">Código do Associado</Label>
                      <Input
                        id="associate_code"
                        placeholder="Ex: BL-00000"
                        value={formData.associate_code}
                        onChange={(e) => updateField("associate_code", e.target.value)}
                        className="mt-1.5"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Brands & Products */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-6 space-y-5">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  Marcas e Produtos
                </h3>

                <div>
                  <Label className="mb-2 block">
                    Quais marcas você gostaria de ver na plataforma?
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
                  <Label htmlFor="desired_products">
                    Quais produtos gostaria de encontrar?
                  </Label>
                  <Textarea
                    id="desired_products"
                    placeholder="Descreva os tipos de produtos que você gostaria de ver..."
                    value={formData.desired_products}
                    onChange={(e) => updateField("desired_products", e.target.value)}
                    className="mt-1.5 min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Satisfaction & Comments */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-6 space-y-5">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">4</span>
                  </div>
                  Avaliação
                </h3>

                <div>
                  <Label className="mb-3 block">
                    Como você avalia o ecossistema Bold Life?
                  </Label>
                  <RatingStars
                    rating={formData.satisfaction_rating}
                    onChange={(rating) => updateField("satisfaction_rating", rating)}
                  />
                </div>

                <div>
                  <Label htmlFor="comments">Comentários e Sugestões</Label>
                  <Textarea
                    id="comments"
                    placeholder="Compartilhe suas ideias, sugestões ou feedbacks..."
                    value={formData.comments}
                    onChange={(e) => updateField("comments", e.target.value)}
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-2"
          >
            <Button
              type="submit"
              disabled={isSubmitting || !formData.is_associate || !formData.full_name || !formData.email}
              className="w-full h-14 text-lg font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              {isSubmitting ? "Enviando..." : "Enviar Pesquisa"}
            </Button>
          </motion.div>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center">
          <div className="w-12 h-0.5 bg-primary/30 mx-auto mb-4 rounded-full" />
          <p className="text-xs text-muted-foreground">
            © 2026 Bold Life Ecosystem. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
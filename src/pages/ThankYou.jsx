import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormConfig } from "@/components/admin/FormConfigManager";

export default function ThankYou() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { getConfig } = useFormConfig();

  const survey = state?.survey;
  const nextSurvey = state?.nextSurvey;
  const personalData = state?.personalData;

  const thankYouTitle = survey?.thankyou_title || getConfig("thankyou_title") || "Obrigado pelo seu feedback!";
  const thankYouMessage = survey?.thankyou_message || getConfig("thankyou_message") || "Sua opinião é fundamental para continuarmos evoluindo o ecossistema Bold Life.";

  const handleNextSurvey = () => {
    const params = new URLSearchParams();
    params.set("survey_id", nextSurvey.id);
    if (personalData?.full_name) params.set("prefill", btoa(JSON.stringify(personalData)));
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="h-1 bg-gradient-to-r from-secondary via-primary to-secondary fixed top-0 inset-x-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{thankYouTitle}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{thankYouMessage}</p>
        </div>

        {nextSurvey && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border rounded-2xl p-5 text-left space-y-3"
          >
            <p className="text-sm font-semibold text-foreground">Há mais uma pesquisa para você!</p>
            <p className="text-sm text-muted-foreground">{nextSurvey.title}</p>
            {nextSurvey.description && (
              <p className="text-xs text-muted-foreground">{nextSurvey.description}</p>
            )}
            <Button onClick={handleNextSurvey} className="w-full gap-2">
              Responder próxima pesquisa
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        <Link to="/">
          <Button variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            Voltar ao início
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
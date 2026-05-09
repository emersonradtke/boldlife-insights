import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, Home, Heart } from "lucide-react";
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

  // null = não respondeu ainda, true = sim, false = não
  const [answer, setAnswer] = useState(null);

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
        {/* Ícone de sucesso */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{thankYouTitle}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{thankYouMessage}</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Pergunta se deseja responder outra pesquisa */}
          {nextSurvey && answer === null && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.3 }}
              className="bg-card border rounded-2xl p-5 space-y-4"
            >
              <p className="text-sm font-semibold text-foreground">
                Deseja responder outra pesquisa?
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">{nextSurvey.title}</span>
                {nextSurvey.description && ` — ${nextSurvey.description}`}
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setAnswer(true)} className="flex-1 gap-2">
                  Sim
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => setAnswer(false)} className="flex-1">
                  Não
                </Button>
              </div>
            </motion.div>
          )}

          {/* Se respondeu Sim, navega imediatamente */}
          {nextSurvey && answer === true && (
            <motion.div
              key="redirecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onAnimationComplete={handleNextSurvey}
            />
          )}

          {/* Se respondeu Não ou não há próxima pesquisa */}
          {(answer === false || !nextSurvey) && (
            <motion.div
              key="farewell"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: answer === false ? 0.1 : 0.4 }}
              className="space-y-4"
            >
              {answer === false && (
                <div className="bg-card border rounded-2xl p-5 space-y-2">
                  <div className="flex justify-center">
                    <Heart className="w-7 h-7 text-primary fill-primary/20" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Tudo bem!</p>
                  <p className="text-xs text-muted-foreground">
                    Agradecemos pela sua participação. Sua opinião faz toda a diferença!
                  </p>
                </div>
              )}
              <Link to="/">
                <Button variant="outline" className="gap-2">
                  <Home className="w-4 h-4" />
                  Voltar ao início
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
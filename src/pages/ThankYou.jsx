import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary fixed top-0 left-0 right-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="text-3xl font-bold text-foreground font-display mb-3">
          Obrigado!
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Sua resposta foi registrada com sucesso. Agradecemos por contribuir
          para a evolução do ecossistema Bold Life.
        </p>

        <Link to="/">
          <Button
            variant="outline"
            className="gap-2 rounded-xl border-2 hover:bg-primary/5 hover:border-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Responder novamente
          </Button>
        </Link>

        <div className="mt-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <span className="text-primary font-display font-bold text-sm">B</span>
            </div>
            <span className="font-semibold text-secondary font-display">Bold Life</span>
          </div>
          <p className="text-xs text-muted-foreground">Ecosystem</p>
        </div>
      </motion.div>
    </div>
  );
}
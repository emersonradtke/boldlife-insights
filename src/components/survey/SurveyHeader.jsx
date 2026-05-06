import React from "react";
import { motion } from "framer-motion";

export default function SurveyHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-10"
    >
      {/* Bold Life Logo */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="relative">
          <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-primary font-display font-bold text-2xl">B</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-card" />
        </div>
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight text-secondary font-display">
            Bold Life
          </h1>
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-primary">
            Ecosystem
          </p>
        </div>
      </div>

      <div className="w-16 h-0.5 bg-primary mx-auto mb-6 rounded-full" />

      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
        Pesquisa de Satisfação
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
        Sua opinião é essencial para melhorarmos nosso ecossistema. 
        Conte-nos quais marcas e produtos você gostaria de encontrar na plataforma.
      </p>
    </motion.div>
  );
}
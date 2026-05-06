import React from "react";
import { motion } from "framer-motion";

const LOGO_URL = "https://media.base44.com/images/public/69fb67ec22eeed7efb852e91/64630ae96_BOLDLIFE02-LOGO1.png";

export default function SurveyHeader({ associateData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-10"
    >
      {/* Bold Life Logo */}
      <div className="flex items-center justify-center mb-6">
        <img
          src={LOGO_URL}
          alt="Bold Life"
          className="h-14 md:h-16 object-contain"
        />
      </div>

      <div className="w-16 h-0.5 bg-primary mx-auto mb-6 rounded-full" />

      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
        Pesquisa de Opinião
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
        Sua opinião é essencial para o crescimento do ecossistema Bold Life.
        Compartilhe suas sugestões de marcas, produtos e melhorias.
      </p>

      {/* Associate Info Badge (when coming from external login) */}
      {associateData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Olá, {associateData.full_name} — Código: {associateData.associate_code}
        </motion.div>
      )}
    </motion.div>
  );
}
import React from "react";
import { motion } from "framer-motion";
import { useFormConfig } from "@/components/admin/FormConfigManager";

export default function SurveyHeader({ associateData, surveyTitle, surveyDescription }) {
  const { getConfig } = useFormConfig();
  const logoUrl = getConfig("logo_url");
  // Use survey-level title/description if provided, else fall back to global config
  const title = surveyTitle || getConfig("form_title");
  const subtitle = surveyDescription || getConfig("form_subtitle");

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-10"
    >
      <div className="flex items-center justify-center mb-6">
        <img src={logoUrl} alt="Bold Life" className="h-14 md:h-16 object-contain" />
      </div>

      <div className="w-16 h-0.5 bg-primary mx-auto mb-6 rounded-full" />

      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
        {title}
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
        {subtitle}
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
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LOGO_URL = "https://media.base44.com/images/public/69fb67ec22eeed7efb852e91/64630ae96_BOLDLIFE02-LOGO1.png";

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

        <img src={LOGO_URL} alt="Bold Life" className="h-10 object-contain mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Obrigado!
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Sua opinião foi registrada com sucesso. Agradecemos por contribuir
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
      </motion.div>
    </div>
  );
}
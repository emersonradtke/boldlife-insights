import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

const PASSWORD_KEY = "boldlife_admin_password";
function getAdminPassword() {
  return localStorage.getItem(PASSWORD_KEY) || "boldlife@2024";
}

export default function ResetSurveyStatsButton({ surveyId, surveyTitle }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const queryClient = useQueryClient();

  const { data: responses = [] } = useQuery({
    queryKey: ["survey-responses"],
    queryFn: () => base44.entities.SurveyResponse.list("-created_date", 500),
  });

  const targetResponses = responses.filter((r) => r.survey_id === surveyId);

  const handleReset = async () => {
    setError("");
    if (password !== getAdminPassword()) {
      setError("Senha incorreta. Tente novamente.");
      return;
    }
    setLoading(true);
    try {
      await Promise.all(targetResponses.map((r) => base44.entities.SurveyResponse.delete(r.id)));
      queryClient.invalidateQueries({ queryKey: ["survey-responses"] });
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setPassword("");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive"
        onClick={() => {
          setPassword("");
          setError("");
          setDone(false);
          setOpen(true);
        }}
      >
        <Trash2 className="w-3.5 h-3.5" />
        Zerar dados
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Zerar Estatísticas
            </DialogTitle>
            <DialogDescription>
              Você está excluindo todas as respostas de "<strong>{surveyTitle}</strong>". Esta ação é permanente e não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {targetResponses.length > 0 && (
              <p className="text-xs text-destructive font-medium bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                ⚠️ Serão excluídas <strong>{targetResponses.length} respostas</strong>.
              </p>
            )}

            {targetResponses.length === 0 && (
              <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                Nenhuma resposta encontrada para esta pesquisa.
              </p>
            )}

            <div>
              <Label htmlFor="reset-password">Confirme com a senha do administrador</Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="Digite a senha..."
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleReset()}
                className="mt-1.5"
              />
              {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
                disabled={loading || !password || done || targetResponses.length === 0}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                {done ? "Zerado!" : "Confirmar e Zerar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
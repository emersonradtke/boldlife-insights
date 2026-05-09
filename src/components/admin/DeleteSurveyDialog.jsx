import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
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

export default function DeleteSurveyDialog({ surveyId, surveyTitle, isOpen, onOpenChange, onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setError("");
    if (password !== getAdminPassword()) {
      setError("Senha incorreta. Tente novamente.");
      return;
    }
    setLoading(true);
    try {
      await base44.entities.Survey.delete(surveyId);
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      setDone(true);
      setTimeout(() => {
        onOpenChange(false);
        setDone(false);
        setPassword("");
        onSuccess?.();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Excluir Pesquisa
          </DialogTitle>
          <DialogDescription>
            Você está excluindo a pesquisa "<strong>{surveyTitle}</strong>". Esta ação é permanente e não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-xs text-destructive font-medium bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
            ⚠️ A pesquisa será removida permanentemente do sistema.
          </p>

          <div>
            <Label htmlFor="delete-password">Confirme com a senha do administrador</Label>
            <Input
              id="delete-password"
              type="password"
              placeholder="Digite a senha..."
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleDelete()}
              className="mt-1.5"
            />
            {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || !password || done}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {done ? "Excluído!" : "Confirmar e Excluir"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
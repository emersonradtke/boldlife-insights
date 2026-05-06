import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

// Senha atual padrão (a definida no ambiente ou fallback)
const CURRENT_PASSWORD_KEY = "boldlife_admin_password";

function getStoredPassword() {
  return localStorage.getItem(CURRENT_PASSWORD_KEY) || "boldlife@2024";
}

function setStoredPassword(pwd) {
  localStorage.setItem(CURRENT_PASSWORD_KEY, pwd);
}

export default function PasswordManager() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const handleSave = () => {
    setMessage(null);

    const stored = getStoredPassword();

    if (currentPassword !== stored) {
      setMessage({ type: "error", text: "Senha atual incorreta." });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "A confirmação da senha não confere." });
      return;
    }

    setStoredPassword(newPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage({ type: "success", text: "Senha alterada com sucesso!" });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Gerenciar Senha do Administrador</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Altere a senha usada para confirmar ações críticas no painel
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-w-sm">
        <div>
          <Label htmlFor="current-pwd">Senha Atual</Label>
          <div className="relative mt-1.5">
            <Input
              id="current-pwd"
              type={showCurrent ? "text" : "password"}
              placeholder="Digite a senha atual..."
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="new-pwd">Nova Senha</Label>
          <div className="relative mt-1.5">
            <Input
              id="new-pwd"
              type={showNew ? "text" : "password"}
              placeholder="Mínimo 6 caracteres..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirm-pwd">Confirmar Nova Senha</Label>
          <Input
            id="confirm-pwd"
            type="password"
            placeholder="Repita a nova senha..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1.5"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {message.text}
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={!currentPassword || !newPassword || !confirmPassword}
          className="w-full"
        >
          <KeyRound className="w-4 h-4 mr-2" />
          Alterar Senha
        </Button>

        <p className="text-xs text-muted-foreground">
          A senha padrão inicial é <code className="font-mono bg-muted px-1 py-0.5 rounded">boldlife@2024</code>.
          A senha é armazenada localmente neste navegador.
        </p>
      </CardContent>
    </Card>
  );
}
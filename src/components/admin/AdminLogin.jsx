import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Eye, EyeOff, AlertCircle } from "lucide-react";

const CURRENT_PASSWORD_KEY = "boldlife_admin_password";

function getStoredPassword() {
  return localStorage.getItem(CURRENT_PASSWORD_KEY) || "boldlife@2024";
}

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = () => {
    if (password === getStoredPassword()) {
      onSuccess();
    } else {
      setError(true);
      setPassword("");
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img
            src="https://media.base44.com/images/public/69fb67ec22eeed7efb852e91/64630ae96_BOLDLIFE02-LOGO1.png"
            alt="Bold Life"
            className="h-10 object-contain"
          />
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Acesso Administrativo</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Digite a senha para acessar o painel
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="admin-password">Senha</Label>
              <div className="relative mt-1.5">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a senha..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Senha incorreta. Tente novamente.
              </div>
            )}

            <Button onClick={handleLogin} disabled={!password} className="w-full">
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
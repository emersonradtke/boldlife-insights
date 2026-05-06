import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Code2, LogIn, Database } from "lucide-react";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function CodeBlock({ code }) {
  return (
    <div className="relative">
      <pre className="bg-secondary text-secondary-foreground rounded-xl p-4 text-xs overflow-x-auto leading-relaxed font-mono">
        {code}
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

const BASE_URL = "https://bold-life-survey.base44.app";
const FUNCTIONS_URL = `${BASE_URL}/api/functions`;

const LOGIN_EXAMPLE = JSON.stringify({
  secret_key: "SEU_SECRET_KEY",
  associate_code: "BL-10042",
  full_name: "João Silva",
  email: "joao@email.com",
  phone: "11999990000",
  external_platform: "minha-plataforma"
}, null, 2);

const LOGIN_RESPONSE = JSON.stringify({
  success: true,
  message: "Autenticação realizada com sucesso. Redirecione o usuário para redirect_url.",
  redirect_url: "https://bold-life-survey.base44.app?token=eyJhbGciO...",
  token: "eyJhbGciO...",
  associate_data: {
    associate_code: "BL-10042",
    full_name: "João Silva",
    email: "joao@email.com",
    phone: "11999990000",
    is_associate: true,
    external_platform: "minha-plataforma"
  }
}, null, 2);

const SUBMIT_EXAMPLE = JSON.stringify({
  secret_key: "SEU_SECRET_KEY",
  full_name: "João Silva",
  email: "joao@email.com",
  phone: "11999990000",
  is_associate: true,
  associate_code: "BL-10042",
  desired_brands: ["Nike", "Apple", "Samsung"],
  desired_products: ["Tênis esportivos", "Eletrônicos"],
  satisfaction_rating: 5,
  comments: "Ótima plataforma!",
  external_platform: "minha-plataforma"
}, null, 2);

const SUBMIT_RESPONSE = JSON.stringify({
  success: true,
  id: "uuid-do-registro",
  message: "Resposta de pesquisa registrada com sucesso.",
  submitted_at: "2025-05-06T14:00:00.000Z",
  source: "minha-plataforma"
}, null, 2);

export default function IntegrationDocs() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Documentação de Integração JSON</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Endpoints para integração com plataformas externas e coleta de dados para BI
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant={activeTab === "login" ? "default" : "outline"}
            onClick={() => setActiveTab("login")}
            className="gap-2"
          >
            <LogIn className="w-3.5 h-3.5" />
            Login Associado
          </Button>
          <Button
            size="sm"
            variant={activeTab === "submit" ? "default" : "outline"}
            onClick={() => setActiveTab("submit")}
            className="gap-2"
          >
            <Database className="w-3.5 h-3.5" />
            Envio Direto (BI)
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {activeTab === "login" && (
          <>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Login com Associado — Pré-preenchimento do Formulário
              </p>
              <p className="text-xs text-muted-foreground">
                Use este endpoint para autenticar um associado da sua plataforma e redirecioná-lo ao formulário Bold Life com nome, e-mail, telefone e vínculo Bold Life já preenchidos automaticamente.
              </p>
            </div>

            {/* Endpoint */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Endpoint</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-green-600 text-white text-xs px-2.5 py-1">POST</Badge>
                <code className="text-xs bg-muted px-3 py-1.5 rounded-lg font-mono text-foreground break-all">
                  {FUNCTIONS_URL}/surveyLogin
                </code>
              </div>
            </div>

            {/* Campos */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Campos do Payload</p>
              <div className="rounded-xl border overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Campo</th>
                      <th className="text-left px-3 py-2 font-semibold">Tipo</th>
                      <th className="text-left px-3 py-2 font-semibold">Obrigatório</th>
                      <th className="text-left px-3 py-2 font-semibold">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { field: "secret_key", type: "string", req: true, desc: "Chave secreta compartilhada" },
                      { field: "associate_code", type: "string", req: true, desc: "Código do associado (ex: BL-10042)" },
                      { field: "full_name", type: "string", req: true, desc: "Nome completo — pré-preenche o formulário" },
                      { field: "email", type: "string", req: true, desc: "E-mail — pré-preenche o formulário" },
                      { field: "phone", type: "string", req: false, desc: "Telefone — pré-preenche o formulário" },
                      { field: "external_platform", type: "string", req: false, desc: "Identificador da plataforma de origem" },
                    ].map((row) => (
                      <tr key={row.field} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-primary">{row.field}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.type}</td>
                        <td className="px-3 py-2">
                          <Badge variant={row.req ? "default" : "secondary"} className="text-[10px] px-1.5">
                            {row.req ? "Sim" : "Não"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Exemplo de Request</p>
                <CodeBlock code={LOGIN_EXAMPLE} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Resposta de Sucesso</p>
                <CodeBlock code={LOGIN_RESPONSE} />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <strong>Como usar:</strong> Após receber a resposta, redirecione o navegador do usuário para o campo <code className="font-mono">redirect_url</code>. O formulário será aberto com os dados do associado preenchidos automaticamente e o campo "Vínculo Bold Life" marcado como <strong>Sim</strong>.
            </div>
          </>
        )}

        {activeTab === "submit" && (
          <>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Envio Direto de Dados — Coleta para BI
              </p>
              <p className="text-xs text-muted-foreground">
                Use este endpoint para enviar respostas de pesquisa diretamente via API, sem necessidade de interação do usuário. Ideal para pipelines de BI e integrações automáticas.
              </p>
            </div>

            {/* Endpoint */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Endpoint</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-green-600 text-white text-xs px-2.5 py-1">POST</Badge>
                <code className="text-xs bg-muted px-3 py-1.5 rounded-lg font-mono text-foreground break-all">
                  {FUNCTIONS_URL}/submitSurvey
                </code>
              </div>
            </div>

            {/* Campos */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Campos do Payload</p>
              <div className="rounded-xl border overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Campo</th>
                      <th className="text-left px-3 py-2 font-semibold">Tipo</th>
                      <th className="text-left px-3 py-2 font-semibold">Obrigatório</th>
                      <th className="text-left px-3 py-2 font-semibold">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { field: "secret_key", type: "string", req: true, desc: "Chave secreta compartilhada" },
                      { field: "full_name", type: "string", req: true, desc: "Nome completo do respondente" },
                      { field: "email", type: "string", req: true, desc: "E-mail do respondente" },
                      { field: "is_associate", type: "boolean", req: true, desc: "true = associado Bold Life, false = não associado" },
                      { field: "phone", type: "string", req: false, desc: "Telefone do respondente" },
                      { field: "associate_code", type: "string", req: false, desc: "Código do associado (obrigatório se is_associate=true)" },
                      { field: "desired_brands", type: "array<string>", req: false, desc: "Lista de marcas desejadas" },
                      { field: "desired_products", type: "array<string>", req: false, desc: "Lista de produtos desejados" },
                      { field: "satisfaction_rating", type: "number (1–5)", req: false, desc: "Nota de satisfação" },
                      { field: "comments", type: "string", req: false, desc: "Comentários e sugestões" },
                      { field: "external_platform", type: "string", req: false, desc: "Identificador da plataforma de origem" },
                    ].map((row) => (
                      <tr key={row.field} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-primary">{row.field}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.type}</td>
                        <td className="px-3 py-2">
                          <Badge variant={row.req ? "default" : "secondary"} className="text-[10px] px-1.5">
                            {row.req ? "Sim" : "Não"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Exemplo de Request</p>
                <CodeBlock code={SUBMIT_EXAMPLE} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Resposta de Sucesso</p>
                <CodeBlock code={SUBMIT_RESPONSE} />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
              <strong>Para BI:</strong> Os dados enviados ficam disponíveis imediatamente no painel administrativo e podem ser consultados via API. O campo <code className="font-mono">desired_products</code> agora aceita <strong>array de strings</strong> (lista de produtos individuais) para melhor granularidade nas estatísticas.
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
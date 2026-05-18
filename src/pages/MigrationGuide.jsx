import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Database, Server, Globe, Code2, AlertTriangle, CheckCircle, FolderOpen, Download, ShieldCheck, Package } from "lucide-react";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function CodeBlock({ code }) {
  return (
    <div className="relative">
      <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
        {code}
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {children}
    </div>
  );
}

function InfoBox({ color = "blue", children }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    red: "bg-red-50 border-red-200 text-red-800",
  };
  return (
    <div className={`p-3 rounded-lg border text-xs ${colors[color]}`}>
      {children}
    </div>
  );
}

// ─── Código ───────────────────────────────────────────────────────────────────

const SUPABASE_SCHEMA = `-- Execute no Supabase → SQL Editor

-- Tabela de pesquisas
create table surveys (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  title text not null,
  description text,
  is_visible boolean default true,
  sort_order int default 0,
  show_brands_section boolean default true,
  show_rating_section boolean default true,
  show_associate_code boolean default true,
  require_associate_code boolean default false,
  submit_button_text text,
  thankyou_title text,
  thankyou_message text,
  label_full_name text,
  label_email text,
  label_phone text,
  label_is_associate text,
  label_associate_yes text,
  label_associate_no text,
  label_associate_code text,
  placeholder_associate_code text,
  label_brands text,
  label_products text,
  label_rating text,
  label_comments text,
  placeholder_comments text,
  section1_title text,
  section2_title text,
  section3_title text,
  section4_title text,
  footer_text text
);

-- Tabela de respostas
create table survey_responses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  survey_id uuid references surveys(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  is_associate boolean default false,
  associate_code text,
  desired_brands text[],
  desired_products jsonb,
  comments text,
  satisfaction_rating int,
  custom_answers jsonb
);

-- Tabela de perguntas personalizadas
create table custom_questions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  survey_id uuid references surveys(id) on delete cascade,
  question_text text not null,
  question_type text not null check (question_type in (
    'text','textarea','multiple_choice','checkbox','dropdown',
    'file_upload','linear_scale','choice_grid','date','time','rating','yesno'
  )),
  options text[],
  scale_min int default 1,
  scale_max int default 5,
  scale_min_label text,
  scale_max_label text,
  grid_rows text[],
  grid_columns text[],
  is_required boolean default false,
  is_active boolean default true,
  sort_order int default 0
);

-- Tabela de configurações do formulário
create table form_config (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  key text not null unique,
  value text,
  label text,
  grp text check (grp in ('textos','campos','geral'))
);

-- RLS (Row Level Security)
alter table surveys enable row level security;
alter table survey_responses enable row level security;
alter table custom_questions enable row level security;
alter table form_config enable row level security;

-- Surveys: leitura pública, escrita apenas service role
create policy "Public read surveys" on surveys for select using (true);
create policy "Service role manages surveys" on surveys for all using (auth.role() = 'service_role');

-- Respostas: qualquer um insere, só service role lê/gerencia
create policy "Anyone can insert survey" on survey_responses for insert with check (true);
create policy "Service role reads all" on survey_responses for select using (auth.role() = 'service_role');
create policy "Service role manages responses" on survey_responses for update using (auth.role() = 'service_role');
create policy "Service role deletes responses" on survey_responses for delete using (auth.role() = 'service_role');

-- Perguntas: leitura pública, escrita service role
create policy "Public read questions" on custom_questions for select using (true);
create policy "Service role manages questions" on custom_questions for all using (auth.role() = 'service_role');

-- Config: leitura pública, escrita service role
create policy "Public read config" on form_config for select using (true);
create policy "Service role manages config" on form_config for all using (auth.role() = 'service_role');

-- Índices para performance
create index idx_responses_survey_id on survey_responses(survey_id);
create index idx_questions_survey_id on custom_questions(survey_id);
create index idx_surveys_sort_order on surveys(sort_order);
create index idx_responses_created_at on survey_responses(created_at desc);`;

const PROJECT_STRUCTURE = `bold-voice-hub/
├── api/                        ← Vercel Serverless Functions
│   ├── submitSurvey.js
│   ├── surveyLogin.js
│   └── getSecretKey.js
├── src/
│   ├── api/
│   │   └── supabaseClient.js   ← substitui base44Client.js
│   ├── pages/
│   ├── components/
│   └── lib/
├── .env.local                  ← variáveis locais (não commitar)
├── vercel.json                 ← configuração Vercel
├── vite.config.js
└── package.json`;

const VERCEL_JSON = `// vercel.json — na raiz do projeto
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}`;

const SUPABASE_CLIENT = `// src/api/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Cliente público (frontend) — usa anon key
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);`;

const REPLACE_ENTITIES = `// ── ANTES (Base44) ──────────────────────────────────────────
import { base44 } from "@/api/base44Client";

const surveys  = await base44.entities.Survey.list("sort_order", 100);
const questions = await base44.entities.CustomQuestion.list("sort_order", 100);
await base44.entities.SurveyResponse.create({ ...formData, survey_id: id });

// ── DEPOIS (Supabase) ────────────────────────────────────────
import { supabase } from "@/api/supabaseClient";

// Listar pesquisas visíveis
const { data: surveys } = await supabase
  .from("surveys")
  .select("*")
  .eq("is_visible", true)
  .order("sort_order");

// Listar perguntas ativas (globais + da pesquisa ativa)
const { data: questions } = await supabase
  .from("custom_questions")
  .select("*")
  .eq("is_active", true)
  .or(\`survey_id.eq.\${surveyId},survey_id.is.null\`)
  .order("sort_order");

// Submeter resposta via API Route (usa service role no backend)
await fetch("/api/submitSurvey", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...formData, survey_id: activeSurvey.id, secret_key: SURVEY_SECRET_KEY }),
});

// Ler/escrever surveys e questions no admin — use supabaseAdmin no backend
// ou via API Routes que usem SUPABASE_SERVICE_ROLE_KEY`;

const API_SUBMIT = `// api/submitSurvey.js
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const { secret_key, survey_id, full_name, email, phone,
          is_associate, associate_code, desired_brands,
          desired_products, comments, satisfaction_rating, custom_answers } = req.body;

  if (secret_key !== process.env.SURVEY_SECRET_KEY)
    return res.status(401).json({ error: 'Chave inválida.' });

  if (!full_name || !email)
    return res.status(400).json({ error: 'full_name e email são obrigatórios.' });

  const { data, error } = await supabaseAdmin
    .from('survey_responses')
    .insert({ survey_id: survey_id || null, full_name, email, phone,
              is_associate, associate_code, desired_brands, desired_products,
              comments, satisfaction_rating, custom_answers })
    .select().single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true, id: data.id });
}`;

const API_LOGIN = `// api/surveyLogin.js
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const { secret_key, associate_code, full_name, email, phone, external_platform } = req.body;

  if (secret_key !== process.env.SURVEY_SECRET_KEY)
    return res.status(401).json({ error: 'Chave inválida.' });

  if (!associate_code || !full_name || !email)
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });

  const payload = { associate_code, full_name, email, phone, is_associate: true, external_platform };
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  const redirectUrl = \`\${process.env.APP_BASE_URL}?token=\${token}\`;

  return res.status(200).json({ success: true, redirect_url: redirectUrl, token });
}`;

const API_SECRET = `// api/getSecretKey.js
// ⚠️ APENAS para uso interno do admin — proteja com senha admin
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { admin_password } = req.body || {};

  // Valide a senha do admin antes de expor a chave
  if (admin_password !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Não autorizado.' });

  return res.status(200).json({ secret_key: process.env.SURVEY_SECRET_KEY });
}`;

const ENV_VARS = `# .env.local — desenvolvimento local (NÃO commitar no git)
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Adicionar no Vercel Dashboard → Settings → Environment Variables:
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SURVEY_SECRET_KEY=boldlife-survey-2024
ADMIN_PASSWORD=sua-senha-admin
APP_BASE_URL=https://seu-projeto.vercel.app`;

const GITIGNORE = `# .gitignore — certifique-se que tem estas entradas:
.env
.env.local
.env.*.local
node_modules/
dist/`;

const ADMIN_AUTH = `// src/lib/adminAuth.js — autenticação local do admin (sem mudanças)
// A senha do admin continua salva no sessionStorage do browser.
// No AdminDashboard, substitua a chamada à base44 function "getSecretKey"
// pela nova API Route:

const res = await fetch("/api/getSecretKey", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ admin_password: enteredPassword }),
});
const { secret_key } = await res.json();
// salvar secret_key no sessionStorage como antes`;

const EXPORT_DATA = `-- Exportar dados do Base44 via Dashboard:
-- 1. Acesse Base44 Dashboard → seu app → Data
-- 2. Para cada entidade (Survey, SurveyResponse, CustomQuestion, FormConfig):
--    clique em "Export" → baixe o CSV

-- Importar no Supabase:
-- Opção A: Supabase Dashboard → Table Editor → Import CSV
-- Opção B: usar psql ou qualquer cliente PostgreSQL

-- Atenção ao importar survey_responses:
-- O campo desired_products é JSON — certifique-se que o CSV exportado
-- contém JSON válido nessa coluna antes de importar.

-- Converter arrays (desired_brands) do formato Base44 para PostgreSQL:
-- Base44 exporta como: ["marca1","marca2"]
-- Supabase espera array PostgreSQL: {"marca1","marca2"}
-- Use o script de conversão abaixo se necessário:

UPDATE survey_responses
SET desired_brands = ARRAY(
  SELECT jsonb_array_elements_text(desired_brands::jsonb)
)
WHERE desired_brands IS NOT NULL;`;

const VITE_CONFIG = `// vite.config.js — adicionar proxy para dev local
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  // Proxy para as API Routes rodarem localmente via "vercel dev"
  // (com vercel dev, as API routes rodam automaticamente em /api)
});

// Para rodar localmente COM as API Routes, use:
// npx vercel dev
// Em vez de: npm run dev`;

const STEPS = [
  { icon: Database, label: "Supabase", desc: "Banco de dados + Schema" },
  { icon: Download, label: "Exportar Dados", desc: "Migrar dados existentes" },
  { icon: FolderOpen, label: "Estrutura", desc: "Projeto e arquivos" },
  { icon: Code2, label: "Frontend", desc: "Substituir SDK Base44" },
  { icon: Server, label: "API Routes", desc: "Backend Vercel Functions" },
  { icon: ShieldCheck, label: "Admin Auth", desc: "Autenticação do admin" },
  { icon: Globe, label: "Deploy", desc: "Publicar no Vercel" },
  { icon: Package, label: "Checklist", desc: "Revisão final" },
];

const CHECKLIST = [
  { group: "Supabase", items: ["Projeto criado em supabase.com", "Schema SQL executado com sucesso", "RLS habilitado em todas as tabelas", "Políticas de acesso criadas", "Chaves anon e service_role copiadas"] },
  { group: "Dados", items: ["CSVs exportados do Base44", "Tabela surveys importada", "Tabela survey_responses importada", "Tabela custom_questions importada", "Tabela form_config importada", "Arrays e JSON validados após importação"] },
  { group: "Código Frontend", items: ["supabaseClient.js criado em src/api/", "Todas as chamadas base44.entities substituídas por supabase.from()", "Arquivo base44Client.js removido (ou mantido só para compatibilidade)", "Imports atualizados em todos os componentes admin"] },
  { group: "API Routes", items: ["Pasta api/ criada na raiz do projeto", "api/submitSurvey.js criado", "api/surveyLogin.js criado", "api/getSecretKey.js criado", "vercel.json criado com rewrites"] },
  { group: "Variáveis de Ambiente", items: [".env.local configurado para dev", "Variáveis adicionadas no Vercel Dashboard", ".env.local adicionado ao .gitignore", "APP_BASE_URL atualizado para URL de produção"] },
  { group: "Deploy", items: ["Repositório GitHub sincronizado", "Projeto importado no Vercel", "Build bem-sucedido (npm run build sem erros)", "API Routes funcionando em /api/*", "Formulário público testado", "Dashboard admin testado"] },
];

export default function MigrationGuide() {
  const [activeStep, setActiveStep] = useState(0);
  const [checked, setChecked] = useState({});

  const toggleCheck = (key) => setChecked(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="min-h-screen bg-background">
      <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary" />
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <img src="https://media.base44.com/images/public/69fb67ec22eeed7efb852e91/64630ae96_BOLDLIFE02-LOGO1.png" alt="Bold Life" className="h-8 object-contain" />
          <div>
            <h1 className="text-2xl font-bold">Guia de Migração</h1>
            <p className="text-sm text-muted-foreground">Base44 → Supabase + Vercel</p>
          </div>
        </div>

        {/* Alert */}
        <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Atenção:</strong> Esta migração requer conhecimento técnico em Node.js, Supabase e Vercel.
            Teste em ambiente de desenvolvimento antes de migrar a produção.
            O SDK <code className="font-mono bg-amber-100 px-1 rounded">@base44/sdk</code> deve ser substituído pelo <code className="font-mono bg-amber-100 px-1 rounded">@supabase/supabase-js</code>.
          </div>
        </div>

        {/* Step selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${activeStep === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
              >
                <Icon className={`w-4 h-4 mb-1.5 ${activeStep === i ? "text-primary" : "text-muted-foreground"}`} />
                <p className="font-semibold text-xs">{step.label}</p>
                <p className="text-xs text-muted-foreground leading-tight">{step.desc}</p>
              </button>
            );
          })}
        </div>

        {/* ── Passo 0: Supabase ── */}
        {activeStep === 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-primary" />1. Configurar Supabase</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                <li>Crie uma conta em <strong className="text-foreground">supabase.com</strong> e crie um novo projeto</li>
                <li>Aguarde o projeto inicializar (~1 minuto)</li>
                <li>Vá em <strong className="text-foreground">SQL Editor</strong> e execute o script abaixo para criar todas as tabelas, RLS e índices</li>
                <li>Vá em <strong className="text-foreground">Settings → API</strong> e copie:
                  <ul className="ml-6 mt-1 space-y-1 list-disc">
                    <li><code className="font-mono bg-muted px-1 rounded text-xs">Project URL</code></li>
                    <li><code className="font-mono bg-muted px-1 rounded text-xs">anon / public key</code></li>
                    <li><code className="font-mono bg-muted px-1 rounded text-xs">service_role key</code> (nunca expor no frontend)</li>
                  </ul>
                </li>
              </ol>
              <InfoBox color="amber">
                <strong>⚠️ service_role key</strong> tem acesso total ao banco, sem RLS. Use apenas em variáveis de ambiente do servidor (API Routes / Vercel backend). Nunca use no frontend.
              </InfoBox>
              <Section title="Schema SQL completo">
                <CodeBlock code={SUPABASE_SCHEMA} />
              </Section>
            </CardContent>
          </Card>
        )}

        {/* ── Passo 1: Exportar Dados ── */}
        {activeStep === 1 && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Download className="w-5 h-5 text-primary" />2. Exportar e Migrar Dados</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                <li>No Base44, acesse <strong className="text-foreground">Dashboard → seu app → Data</strong></li>
                <li>Exporte cada entidade como CSV: <strong className="text-foreground">Survey, SurveyResponse, CustomQuestion, FormConfig</strong></li>
                <li>No Supabase, acesse <strong className="text-foreground">Table Editor → [tabela] → Import data</strong> e importe os CSVs</li>
                <li>Verifique os dados importados, especialmente colunas JSON (desired_products, custom_answers)</li>
              </ol>
              <InfoBox color="blue">
                <strong>Mapeamento de nomes:</strong> Base44 usa CamelCase (SurveyResponse) → Supabase usa snake_case (survey_responses). Os campos internos também mudam: <code>is_visible</code> permanece igual, mas confira cada coluna após importar.
              </InfoBox>
              <Section title="Script de correção pós-importação (se necessário)">
                <CodeBlock code={EXPORT_DATA} />
              </Section>
            </CardContent>
          </Card>
        )}

        {/* ── Passo 2: Estrutura ── */}
        {activeStep === 2 && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><FolderOpen className="w-5 h-5 text-primary" />3. Estrutura do Projeto</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <Section title="Estrutura de pastas esperada">
                <CodeBlock code={PROJECT_STRUCTURE} />
              </Section>
              <Section title="vercel.json — obrigatório para SPA + API Routes">
                <CodeBlock code={VERCEL_JSON} />
              </Section>
              <Section title=".gitignore — certifique-se que as variáveis de ambiente estão protegidas">
                <CodeBlock code={GITIGNORE} />
              </Section>
              <InfoBox color="green">
                O Vercel detecta automaticamente projetos Vite. Certifique-se que o <code className="font-mono">build command</code> é <code className="font-mono">npm run build</code> e o <code className="font-mono">output directory</code> é <code className="font-mono">dist</code>.
              </InfoBox>
            </CardContent>
          </Card>
        )}

        {/* ── Passo 3: Frontend ── */}
        {activeStep === 3 && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Code2 className="w-5 h-5 text-primary" />4. Substituir SDK Base44 no Frontend</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <Section title="Instalar dependência">
                <CodeBlock code="npm install @supabase/supabase-js" />
              </Section>
              <Section title="Criar src/api/supabaseClient.js">
                <CodeBlock code={SUPABASE_CLIENT} />
              </Section>
              <Section title="Substituir chamadas de entidades">
                <CodeBlock code={REPLACE_ENTITIES} />
              </Section>
              <InfoBox color="blue">
                <strong>Arquivos a modificar:</strong>
                <ul className="mt-1 space-y-0.5 list-disc list-inside">
                  <li><code>pages/SurveyForm.jsx</code></li>
                  <li><code>pages/AdminDashboard.jsx</code></li>
                  <li><code>components/admin/SurveyManager.jsx</code></li>
                  <li><code>components/admin/SurveyDashboard.jsx</code></li>
                  <li><code>components/admin/QuestionsManager.jsx</code></li>
                  <li><code>components/admin/ResponsesTable.jsx</code></li>
                  <li><code>components/admin/ResetStatsDialog.jsx</code></li>
                  <li><code>components/admin/FormConfigManager.jsx</code></li>
                </ul>
              </InfoBox>
              <Section title="Configurar vite.config.js">
                <CodeBlock code={VITE_CONFIG} />
              </Section>
            </CardContent>
          </Card>
        )}

        {/* ── Passo 4: API Routes ── */}
        {activeStep === 4 && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Server className="w-5 h-5 text-primary" />5. Criar Vercel API Routes</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">Crie uma pasta <code className="font-mono bg-muted px-1 rounded">api/</code> na <strong>raiz</strong> do projeto. Cada arquivo <code>.js</code> se torna um endpoint serverless automaticamente.</p>
              <InfoBox color="amber">
                As URLs mudam: <code className="font-mono">/api/functions/submitSurvey</code> → <code className="font-mono">/api/submitSurvey</code>. Atualize qualquer integração externa (ex: plataforma parceira que chama surveyLogin).
              </InfoBox>
              <Section title="api/submitSurvey.js">
                <CodeBlock code={API_SUBMIT} />
              </Section>
              <Section title="api/surveyLogin.js">
                <CodeBlock code={API_LOGIN} />
              </Section>
              <Section title="api/getSecretKey.js">
                <CodeBlock code={API_SECRET} />
              </Section>
            </CardContent>
          </Card>
        )}

        {/* ── Passo 5: Admin Auth ── */}
        {activeStep === 5 && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" />6. Autenticação do Admin</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">A autenticação do admin usa <strong>senha local + sessionStorage</strong> — não depende do sistema de auth do Base44. Essa parte muda minimamente.</p>
              <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                <li>A lógica de login (senha no sessionStorage) permanece igual em <code className="font-mono bg-muted px-1 rounded text-xs">components/admin/AdminLogin.jsx</code></li>
                <li>Substitua a chamada à base44 function <code className="font-mono bg-muted px-1 rounded text-xs">getSecretKey</code> pela nova API Route</li>
                <li>Todas as operações CRUD do admin (criar/editar surveys, perguntas, config) devem ir para API Routes usando <code className="font-mono bg-muted px-1 rounded text-xs">supabaseAdmin</code></li>
              </ol>
              <Section title="Substituição da chamada getSecretKey">
                <CodeBlock code={ADMIN_AUTH} />
              </Section>
              <InfoBox color="green">
                O sistema de auth do Base44 (<code>AuthProvider</code>, <code>AuthContext</code>, <code>useAuth</code>) pode ser simplificado ou removido completamente, já que o app não usa login de usuários — apenas a senha do admin via sessionStorage.
              </InfoBox>
              <InfoBox color="blue">
                <strong>Proteção das rotas admin:</strong> mantendo o mesmo padrão de verificar <code>sessionStorage.getItem("admin_authenticated")</code> antes de renderizar o dashboard.
              </InfoBox>
            </CardContent>
          </Card>
        )}

        {/* ── Passo 6: Deploy ── */}
        {activeStep === 6 && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />7. Deploy no Vercel</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <ol className="space-y-3 text-sm">
                {[
                  { n: 1, text: <>Sincronize o código com o <strong>GitHub</strong> via Base44 Dashboard → GitHub Sync (ou exporte e faça push manualmente)</> },
                  { n: 2, text: <>Acesse <strong>vercel.com</strong> → Add New Project → importe o repositório GitHub</> },
                  { n: 3, text: <><strong>Framework Preset:</strong> Vite. <strong>Build Command:</strong> <code className="font-mono bg-muted px-1 rounded">npm run build</code>. <strong>Output Directory:</strong> <code className="font-mono bg-muted px-1 rounded">dist</code></> },
                  { n: 4, text: <>Configure todas as <strong>variáveis de ambiente</strong> no painel do Vercel (Settings → Environment Variables)</> },
                  { n: 5, text: <>Clique em <strong>Deploy</strong> e aguarde o build completar</> },
                  { n: 6, text: <>Após o deploy, teste o formulário público e o dashboard admin</> },
                  { n: 7, text: <>Configure um <strong>domínio customizado</strong> em Vercel → Domains se necessário</> },
                ].map(({ n, text }) => (
                  <li key={n} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">{n}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
              <Section title="Variáveis de Ambiente (todas obrigatórias)">
                <CodeBlock code={ENV_VARS} />
              </Section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {[
                  { label: "Frontend React/Vite", desc: "Detectado automaticamente pelo Vercel" },
                  { label: "API Routes", desc: "Pasta api/ vira serverless functions" },
                  { label: "Banco de dados", desc: "Supabase PostgreSQL gerenciado" },
                  { label: "CORS + Rewrites", desc: "Configurado no vercel.json" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-green-800">{item.label}</p>
                      <p className="text-xs text-green-700">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Passo 7: Checklist ── */}
        {activeStep === 7 && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" />8. Checklist de Migração</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {CHECKLIST.map((group) => {
                const done = group.items.filter((_, i) => checked[`${group.group}-${i}`]).length;
                return (
                  <div key={group.group} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{group.group}</p>
                      <span className="text-xs text-muted-foreground">{done}/{group.items.length}</span>
                    </div>
                    <div className="space-y-1.5">
                      {group.items.map((item, i) => {
                        const key = `${group.group}-${i}`;
                        return (
                          <label key={key} className="flex items-start gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={!!checked[key]}
                              onChange={() => toggleCheck(key)}
                              className="mt-0.5 accent-primary w-4 h-4 shrink-0"
                            />
                            <span className={`text-sm transition-colors ${checked[key] ? "line-through text-muted-foreground" : "group-hover:text-primary"}`}>
                              {item}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <InfoBox color="green">
                <strong>🎉 Pronto!</strong> Quando todos os itens estiverem marcados, a migração está completa. Monitore os logs no Vercel Dashboard e o Supabase Studio por alguns dias após a migração.
              </InfoBox>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" disabled={activeStep === 0} onClick={() => setActiveStep(s => s - 1)}>← Anterior</Button>
          <span className="text-sm text-muted-foreground self-center">Passo {activeStep + 1} de {STEPS.length}</span>
          <Button disabled={activeStep === STEPS.length - 1} onClick={() => setActiveStep(s => s + 1)}>Próximo →</Button>
        </div>
      </div>
    </div>
  );
}
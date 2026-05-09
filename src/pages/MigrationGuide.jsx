import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Database, Server, Globe, Code2, AlertTriangle, CheckCircle } from "lucide-react";

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

function CodeBlock({ code, lang = "js" }) {
  return (
    <div className="relative">
      <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
        {code}
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

const SUPABASE_SCHEMA = `-- Execute no Supabase SQL Editor

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

-- Tabela de respostas (com survey_id)
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

-- Tabela de perguntas personalizadas (com survey_id)
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

-- Tabela de configurações globais do formulário
create table form_config (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  key text not null unique,
  value text,
  label text,
  grp text check (grp in ('textos','campos','geral'))
);

-- Habilitar RLS (Row Level Security)
alter table surveys enable row level security;
alter table survey_responses enable row level security;
alter table custom_questions enable row level security;
alter table form_config enable row level security;

-- Surveys: leitura pública, escrita apenas service role
create policy "Public read surveys" on surveys for select using (true);
create policy "Service role manages surveys" on surveys for all using (auth.role() = 'service_role');

-- Respostas: qualquer um insere, só service role lê
create policy "Anyone can insert survey" on survey_responses for insert with check (true);
create policy "Service role reads all" on survey_responses for select using (auth.role() = 'service_role');
create policy "Service role manages responses" on survey_responses for all using (auth.role() = 'service_role');

-- Perguntas: leitura pública, escrita service role
create policy "Public read questions" on custom_questions for select using (true);
create policy "Service role manages questions" on custom_questions for all using (auth.role() = 'service_role');

-- Config: leitura pública, escrita service role
create policy "Public read config" on form_config for select using (true);
create policy "Service role manages config" on form_config for all using (auth.role() = 'service_role');

-- Índices para performance
create index idx_responses_survey_id on survey_responses(survey_id);
create index idx_questions_survey_id on custom_questions(survey_id);
create index idx_surveys_sort_order on surveys(sort_order);`;

const SUPABASE_CLIENT = `// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Para operações admin (backend/API routes)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);`;

const REPLACE_ENTITIES = `// ANTES (Base44):
import { base44 } from "@/api/base44Client";

// Listar pesquisas visíveis
const surveys = await base44.entities.Survey.list("sort_order", 100);

// Listar perguntas de uma pesquisa específica
const questions = await base44.entities.CustomQuestion.list("sort_order", 100);

// Submeter resposta com survey_id
await base44.entities.SurveyResponse.create({ ...formData, survey_id: activeSurvey.id });

// DEPOIS (Supabase):
import { supabase } from "@/lib/supabaseClient";

// Listar pesquisas visíveis
const { data: surveys } = await supabase
  .from("surveys")
  .select("*")
  .eq("is_visible", true)
  .order("sort_order");

// Listar perguntas de uma pesquisa específica
const { data: questions } = await supabase
  .from("custom_questions")
  .select("*")
  .eq("is_active", true)
  .or(\`survey_id.eq.\${surveyId},survey_id.is.null\`)
  .order("sort_order");

// Submeter resposta com survey_id
const { data } = await supabase
  .from("survey_responses")
  .insert({ ...formData, survey_id: activeSurvey.id });

// Filtrar respostas por pesquisa no dashboard
const { data: responses } = await supabase
  .from("survey_responses")
  .select("*")
  .eq("survey_id", surveyId)
  .order("created_at", { ascending: false });`;

const VERCEL_API_SUBMIT = `// api/submitSurvey.js (Vercel API Route)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const {
    secret_key, full_name, email, phone,
    is_associate, associate_code,
    desired_brands, desired_products,
    comments, satisfaction_rating,
    custom_answers,
    survey_id  // ← novo campo: ID da pesquisa respondida
  } = req.body;

  if (secret_key !== process.env.SURVEY_SECRET_KEY)
    return res.status(401).json({ error: 'Chave inválida.' });

  if (!full_name || !email)
    return res.status(400).json({ error: 'full_name e email obrigatórios.' });

  const { data, error } = await supabase
    .from('survey_responses')
    .insert({
      survey_id: survey_id || null,
      full_name, email, phone,
      is_associate, associate_code,
      desired_brands, desired_products,
      comments, satisfaction_rating,
      custom_answers
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true, id: data.id });
}`;

const VERCEL_API_LOGIN = `// api/surveyLogin.js (Vercel API Route)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();

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

const ENV_VARS = `# .env.local (frontend - Vercel)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Variáveis de ambiente no Vercel Dashboard (backend)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SURVEY_SECRET_KEY=boldlife-survey-2024
APP_BASE_URL=https://seu-app.vercel.app`;

const STEPS = [
  { icon: Database, label: "Supabase", desc: "Banco de dados + Auth" },
  { icon: Code2, label: "Código", desc: "Substituir SDK Base44" },
  { icon: Server, label: "API Routes", desc: "Vercel Functions" },
  { icon: Globe, label: "Deploy", desc: "Publicar no Vercel" },
];

export default function MigrationGuide() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary" />
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">

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
            As backend functions precisam ser reescritas como <strong>Vercel API Routes</strong>.
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
                className={`p-4 rounded-xl border-2 text-left transition-all ${activeStep === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
              >
                <Icon className={`w-5 h-5 mb-2 ${activeStep === i ? "text-primary" : "text-muted-foreground"}`} />
                <p className="font-semibold text-sm">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Step 0: Supabase */}
        {activeStep === 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-primary" />1. Configurar Supabase</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                <li>Crie uma conta em <strong className="text-foreground">supabase.com</strong> e crie um novo projeto</li>
                <li>Vá em <strong className="text-foreground">SQL Editor</strong> e execute o script abaixo para criar as tabelas</li>
                <li>Copie a <strong className="text-foreground">URL do projeto</strong> e as chaves <strong className="text-foreground">anon</strong> e <strong className="text-foreground">service_role</strong> em Settings → API</li>
                <li>Exporte os dados atuais do Base44 (Dashboard → Data → Export CSV) e importe no Supabase</li>
              </ol>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Schema SQL</p>
              <CodeBlock code={SUPABASE_SCHEMA} />
            </CardContent>
          </Card>
        )}

        {/* Step 1: Código */}
        {activeStep === 1 && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Code2 className="w-5 h-5 text-primary" />2. Substituir o SDK Base44</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold">Instalar dependência</p>
                <CodeBlock code="npm install @supabase/supabase-js" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Criar cliente Supabase</p>
                <CodeBlock code={SUPABASE_CLIENT} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Substituir chamadas de entidades</p>
                <CodeBlock code={REPLACE_ENTITIES} />
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
                <strong>Arquivos a modificar:</strong> <code>pages/SurveyForm.jsx</code>, <code>pages/AdminDashboard.jsx</code>, <code>components/admin/SurveyManager.jsx</code>, <code>components/admin/SurveyDashboard.jsx</code>, <code>components/admin/QuestionsManager.jsx</code>, <code>components/admin/ResponsesTable.jsx</code>, <code>components/admin/ResetStatsDialog.jsx</code>, <code>components/admin/FormConfigManager.jsx</code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: API Routes */}
        {activeStep === 2 && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Server className="w-5 h-5 text-primary" />3. Recriar Backend Functions como Vercel API Routes</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">Crie uma pasta <code className="font-mono bg-muted px-1 rounded">api/</code> na raiz do projeto. Cada arquivo <code>.js</code> vira um endpoint.</p>
              <div className="space-y-2">
                <p className="text-sm font-semibold">api/submitSurvey.js</p>
                <CodeBlock code={VERCEL_API_SUBMIT} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold">api/surveyLogin.js</p>
                <CodeBlock code={VERCEL_API_LOGIN} />
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-800">
                As URLs dos endpoints mudam de <code className="font-mono">/api/functions/submitSurvey</code> para <code className="font-mono">/api/submitSurvey</code> — atualize a documentação de integração.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Deploy */}
        {activeStep === 3 && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />4. Deploy no Vercel</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">1</span><span>Faça push do código para o <strong>GitHub</strong> (use a opção de sync do Base44)</span></li>
                <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">2</span><span>Acesse <strong>vercel.com</strong> → New Project → importe o repositório GitHub</span></li>
                <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">3</span><span>Configure as variáveis de ambiente abaixo no Vercel Dashboard</span></li>
                <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">4</span><span>Clique em <strong>Deploy</strong> — o Vercel detecta automaticamente o Vite e as API Routes</span></li>
              </ol>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Variáveis de Ambiente necessárias</p>
                <CodeBlock code={ENV_VARS} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {[
                  { label: "✅ Frontend React/Vite", desc: "Detectado automaticamente pelo Vercel" },
                  { label: "✅ API Routes", desc: "Pasta api/ vira serverless functions" },
                  { label: "✅ Banco de dados", desc: "Supabase PostgreSQL na nuvem" },
                  { label: "✅ Auth do admin", desc: "Manter senha local (sessionStorage)" },
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

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" disabled={activeStep === 0} onClick={() => setActiveStep(s => s - 1)}>← Anterior</Button>
          <span className="text-sm text-muted-foreground self-center">Passo {activeStep + 1} de 4</span>
          <Button disabled={activeStep === 3} onClick={() => setActiveStep(s => s + 1)}>Próximo →</Button>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, BarChart2, CheckSquare, Star, List } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#0090ff", "#1a3a6e", "#60b0ff", "#2a5090", "#80c8ff", "#0060cc"];

function countValues(responses, questionId) {
  const counts = {};
  responses.forEach((r) => {
    const val = r.custom_answers?.[questionId];
    if (val === undefined || val === null || val === "") return;
    if (Array.isArray(val)) {
      val.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
    } else {
      const key = String(val);
      counts[key] = (counts[key] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function avgNumericValues(responses, questionId) {
  const vals = responses
    .map((r) => r.custom_answers?.[questionId])
    .filter((v) => v !== undefined && v !== null && v !== "" && !isNaN(Number(v)))
    .map(Number);
  if (vals.length === 0) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

function BarResult({ data }) {
  if (data.length === 0) return <p className="text-xs text-muted-foreground">Sem respostas ainda.</p>;
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [`${v} respostas`]} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function TextAnswers({ responses, questionId }) {
  const answers = responses
    .map((r) => r.custom_answers?.[questionId])
    .filter((v) => v && String(v).trim());
  if (answers.length === 0) return <p className="text-xs text-muted-foreground">Sem respostas ainda.</p>;
  return (
    <ul className="space-y-1 max-h-40 overflow-y-auto">
      {answers.map((a, i) => (
        <li key={i} className="text-xs bg-muted rounded-lg px-3 py-2 text-foreground">{String(a)}</li>
      ))}
    </ul>
  );
}

function QuestionCard({ question, responses }) {
  const answered = responses.filter((r) => {
    const v = r.custom_answers?.[question.id];
    if (v === undefined || v === null || v === "") return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  }).length;

  const type = question.question_type;
  const isChoice = ["multiple_choice", "checkbox", "dropdown", "yesno"].includes(type);
  const isScale = ["linear_scale", "rating"].includes(type);
  const isText = ["text", "textarea"].includes(type);

  const chartData = isChoice ? countValues(responses, question.id) : [];
  const avg = isScale ? avgNumericValues(responses, question.id) : null;

  const typeIcon = isChoice ? <List className="w-3.5 h-3.5" /> :
                   isScale ? <Star className="w-3.5 h-3.5" /> :
                   isText ? <CheckSquare className="w-3.5 h-3.5" /> :
                   <HelpCircle className="w-3.5 h-3.5" />;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            {typeIcon}
            <span className="uppercase tracking-wide">{type.replace("_", " ")}</span>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {answered}/{responses.length} responderam
          </Badge>
        </div>
        <CardTitle className="text-sm font-semibold leading-snug mt-1">{question.question_text}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isScale && (
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold text-primary">{avg ?? "—"}</div>
            <div className="text-xs text-muted-foreground">
              média<br />
              {avg && <span>de {question.scale_min ?? 1}–{question.scale_max ?? 5}</span>}
            </div>
            {/* Mini distribution */}
            {countValues(responses, question.id).length > 0 && (
              <div className="flex-1 ml-2">
                <BarResult data={countValues(responses, question.id)} />
              </div>
            )}
          </div>
        )}
        {isChoice && <BarResult data={chartData} />}
        {isText && <TextAnswers responses={responses} questionId={question.id} />}
        {!isScale && !isChoice && !isText && (
          <TextAnswers responses={responses} questionId={question.id} />
        )}
      </CardContent>
    </Card>
  );
}

export default function QuestionStats({ surveyId, responses }) {
  const { data: allQuestions = [] } = useQuery({
    queryKey: ["custom-questions"],
    queryFn: () => base44.entities.CustomQuestion.list("sort_order", 100),
  });

  const questions = allQuestions
    .filter((q) => q.is_active === true && (q.survey_id === surveyId))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  if (questions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">Estatísticas por Pergunta</h3>
        <Badge variant="secondary" className="text-xs">{questions.length} perguntas</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questions.map((q) => (
          <QuestionCard key={q.id} question={q} responses={responses} />
        ))}
      </div>
    </div>
  );
}
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

function RatingInput({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className="transition-all hover:scale-110">
          <Star className={cn("w-7 h-7", star <= value ? "fill-primary text-primary" : "fill-none text-border hover:text-primary/40")} />
        </button>
      ))}
    </div>
  );
}

function YesNoInput({ value, onChange }) {
  return (
    <div className="flex gap-3">
      {["Sim", "Não"].map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "px-5 py-2 rounded-lg border-2 font-medium text-sm transition-all",
            value === opt ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function DynamicQuestions({ questions, answers, onChange }) {
  const active = questions.filter((q) => q.is_active);
  if (active.length === 0) return null;

  return (
    <div className="space-y-4">
      {active.map((q, i) => (
        <div key={q.id} className="space-y-2">
          <Label>
            {q.question_text}
            {q.is_required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {q.question_type === "text" && (
            <Input
              required={q.is_required}
              placeholder="Sua resposta..."
              value={answers[q.id] || ""}
              onChange={(e) => onChange(q.id, e.target.value)}
            />
          )}
          {q.question_type === "textarea" && (
            <Textarea
              required={q.is_required}
              placeholder="Sua resposta..."
              value={answers[q.id] || ""}
              onChange={(e) => onChange(q.id, e.target.value)}
              className="min-h-[80px]"
            />
          )}
          {q.question_type === "rating" && (
            <RatingInput value={answers[q.id] || 0} onChange={(val) => onChange(q.id, val)} />
          )}
          {q.question_type === "yesno" && (
            <YesNoInput value={answers[q.id] || ""} onChange={(val) => onChange(q.id, val)} />
          )}
        </div>
      ))}
    </div>
  );
}
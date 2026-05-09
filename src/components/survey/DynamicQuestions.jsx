import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

function isAnswered(value) {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

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

function MultipleChoiceInput({ options = [], value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="accent-primary w-4 h-4"
          />
          <span className="text-sm group-hover:text-primary transition-colors">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function CheckboxInput({ options = [], value = [], onChange }) {
  const toggle = (opt) => {
    const current = Array.isArray(value) ? value : [];
    const next = current.includes(opt) ? current.filter((v) => v !== opt) : [...current, opt];
    onChange(next);
  };
  const current = Array.isArray(value) ? value : [];
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={current.includes(opt)}
            onChange={() => toggle(opt)}
            className="accent-primary w-4 h-4"
          />
          <span className="text-sm group-hover:text-primary transition-colors">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function DropdownInput({ options = [], value, onChange }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <option value="">Selecionar...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function LinearScaleInput({ min = 1, max = 5, minLabel, maxLabel, value, onChange }) {
  const nums = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return (
    <div>
      <div className="flex gap-2 flex-wrap">
        {nums.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "w-10 h-10 rounded-lg border-2 text-sm font-medium transition-all",
              value === n ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">{minLabel}</span>
          <span className="text-xs text-muted-foreground">{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

function ChoiceGridInput({ rows = [], columns = [], value = {}, onChange }) {
  const handleChange = (row, col) => {
    onChange({ ...value, [row]: col });
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 pr-4 font-medium text-muted-foreground w-1/3"></th>
            {columns.map((col) => (
              <th key={col} className="text-center py-2 px-2 font-medium text-xs">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row} className="border-t">
              <td className="py-2 pr-4 text-sm">{row}</td>
              {columns.map((col) => (
                <td key={col} className="text-center py-2 px-2">
                  <input
                    type="radio"
                    name={`grid-${row}`}
                    checked={value[row] === col}
                    onChange={() => handleChange(row, col)}
                    className="accent-primary w-4 h-4"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FileUploadInput({ value, onChange }) {
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Store file name as value (actual upload handled by parent if needed)
    onChange(file.name);
  };
  return (
    <div>
      <input
        type="file"
        onChange={handleFile}
        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
      />
      {value && <p className="text-xs text-muted-foreground mt-1">Arquivo: {value}</p>}
    </div>
  );
}

export default function DynamicQuestions({ questions, answers, onChange }) {
  const active = questions.filter((q) => q.is_active);
  if (active.length === 0) return null;

  const handleChange = (id, val) => onChange({ ...answers, [id]: val });

  return (
    <div className="bg-card rounded-2xl border p-6 space-y-5">
      <h3 className="font-semibold text-foreground">Perguntas adicionais</h3>
      {active.map((q, i) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="space-y-2"
        >
          <Label>
            {q.question_text}
            {q.is_required && <span className="text-destructive ml-1">*</span>}
          </Label>

          {q.question_type === "text" && (
            <Input required={q.is_required} placeholder="Sua resposta..." value={answers[q.id] || ""} onChange={(e) => handleChange(q.id, e.target.value)} />
          )}
          {q.question_type === "textarea" && (
            <Textarea required={q.is_required} placeholder="Sua resposta..." value={answers[q.id] || ""} onChange={(e) => handleChange(q.id, e.target.value)} className="min-h-[80px]" />
          )}
          {q.question_type === "rating" && (
            <RatingInput value={answers[q.id] || 0} onChange={(val) => handleChange(q.id, val)} />
          )}
          {q.question_type === "yesno" && (
            <YesNoInput value={answers[q.id] || ""} onChange={(val) => handleChange(q.id, val)} />
          )}
          {q.question_type === "multiple_choice" && (
            <MultipleChoiceInput options={q.options} value={answers[q.id] || ""} onChange={(val) => handleChange(q.id, val)} />
          )}
          {q.question_type === "checkbox" && (
            <CheckboxInput options={q.options} value={answers[q.id] || []} onChange={(val) => handleChange(q.id, val)} />
          )}
          {q.question_type === "dropdown" && (
            <DropdownInput options={q.options} value={answers[q.id] || ""} onChange={(val) => handleChange(q.id, val)} />
          )}
          {q.question_type === "linear_scale" && (
            <LinearScaleInput
              min={q.scale_min ?? 1}
              max={q.scale_max ?? 5}
              minLabel={q.scale_min_label}
              maxLabel={q.scale_max_label}
              value={answers[q.id]}
              onChange={(val) => handleChange(q.id, val)}
            />
          )}
          {q.question_type === "choice_grid" && (
            <ChoiceGridInput
              rows={q.grid_rows || []}
              columns={q.grid_columns || []}
              value={answers[q.id] || {}}
              onChange={(val) => handleChange(q.id, val)}
            />
          )}
          {q.question_type === "file_upload" && (
            <FileUploadInput value={answers[q.id] || ""} onChange={(val) => handleChange(q.id, val)} />
          )}
          {q.question_type === "date" && (
            <Input type="date" required={q.is_required} value={answers[q.id] || ""} onChange={(e) => handleChange(q.id, e.target.value)} className="w-auto" />
          )}
          {q.question_type === "time" && (
            <Input type="time" required={q.is_required} value={answers[q.id] || ""} onChange={(e) => handleChange(q.id, e.target.value)} className="w-auto" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
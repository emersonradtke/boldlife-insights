import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2, Plus } from "lucide-react";

export default function RestoreSurveyCard() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sort_order: 0,
  });
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const restoreMutation = useMutation({
    mutationFn: (data) => base44.entities.Survey.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      setFormData({ title: "", description: "", sort_order: 0 });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
      }, 2000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    restoreMutation.mutate({
      ...formData,
      is_visible: true,
      sort_order: Number(formData.sort_order) || 0,
    });
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <AlertCircle className="w-5 h-5" />
          Restaurar Pesquisa Deletada
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <p className="text-sm text-amber-800 mb-4">
            Pesquisa foi deletada? Você pode restaurá-la re-inserindo os dados abaixo.
          </p>
        ) : null}

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Título da Pesquisa *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Pesquisa de Satisfação"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Ex: Queremos saber sua opinião sobre..."
                className="mt-1 min-h-20"
              />
            </div>

            <div>
              <Label>Ordem de Exibição (número)</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData((p) => ({ ...p, sort_order: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={restoreMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={restoreMutation.isPending || !formData.title.trim() || success}
              >
                {restoreMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {success ? "✓ Restaurado!" : "Restaurar Pesquisa"}
              </Button>
            </div>
          </form>
        )}

        {!showForm && !success && (
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Restaurar Pesquisa
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
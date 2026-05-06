import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Package, Loader2 } from "lucide-react";

function BrandEditor({ brands, onChange }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !brands.includes(v)) onChange([...brands, v]);
    setInput("");
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input placeholder="Nome da marca" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        <Button type="button" size="icon" onClick={add} disabled={!input.trim()}><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {brands.map((b, i) => (
          <Badge key={i} variant="secondary" className="gap-1 pl-2.5 pr-1 py-1">
            {b}
            <button type="button" onClick={() => onChange(brands.filter((_, j) => j !== i))}
              className="rounded-full hover:bg-destructive/20 p-0.5"><X className="w-3 h-3" /></button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ProductEditor({ products, onChange }) {
  const [input, setInput] = useState("");

  const add = () => {
    const v = input.trim();
    if (!v) return;
    const existing = typeof products[0] === "object" ? products : [];
    onChange([...existing, { name: v, quantity: "", frequency: "mensal" }]);
    setInput("");
  };

  const remove = (i) => onChange(products.filter((_, j) => j !== i));

  const updateName = (i, value) => {
    const updated = [...products];
    updated[i] = typeof updated[i] === "object" ? { ...updated[i], name: value } : { name: value };
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input placeholder="Nome do produto" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        <Button type="button" size="icon" onClick={add} disabled={!input.trim()}><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="space-y-1.5">
        {products.map((p, i) => {
          const label = typeof p === "string" ? p : p.name;
          return (
            <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 border">
              <Package className="w-3.5 h-3.5 text-primary shrink-0" />
              <Input className="h-7 text-xs flex-1 bg-transparent border-0 p-0 focus-visible:ring-0"
                value={label} onChange={(e) => updateName(i, e.target.value)} />
              <button type="button" onClick={() => remove(i)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"><X className="w-3.5 h-3.5" /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EditResponseModal({ response, onClose }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    desired_brands: response.desired_brands || [],
    desired_products: response.desired_products || [],
  });

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.SurveyResponse.update(response.id, data);
    queryClient.invalidateQueries({ queryKey: ["survey-responses"] });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Resposta — {response.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Marcas */}
          <div>
            <Label className="mb-2 block">Marcas Desejadas</Label>
            <BrandEditor brands={data.desired_brands} onChange={(brands) => setData({ ...data, desired_brands: brands })} />
          </div>

          {/* Produtos */}
          <div>
            <Label className="mb-2 block">Produtos Desejados</Label>
            <ProductEditor products={data.desired_products} onChange={(products) => setData({ ...data, desired_products: products })} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
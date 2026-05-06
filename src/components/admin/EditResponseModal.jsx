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
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [freq, setFreq] = useState("mensal");

  const add = () => {
    if (!name.trim() || !qty) return;
    onChange([...products, { name: name.trim(), quantity: qty, frequency: freq }]);
    setName(""); setQty(""); setFreq("mensal");
  };

  const remove = (i) => onChange(products.filter((_, j) => j !== i));

  const updateProduct = (i, field, value) => {
    const updated = [...products];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">Produto</p>
          <Input placeholder="Nome do produto" value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        </div>
        <div className="w-24">
          <p className="text-xs text-muted-foreground mb-1">Qtd</p>
          <Input type="number" min="1" placeholder="Ex: 2" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div className="w-32">
          <p className="text-xs text-muted-foreground mb-1">Frequência</p>
          <Select value={freq} onValueChange={setFreq}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="ocasional">Ocasional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="button" size="icon" onClick={add} disabled={!name.trim() || !qty}><Plus className="w-4 h-4" /></Button>
      </div>

      <div className="space-y-1.5">
        {products.map((p, i) => {
          const label = typeof p === "string" ? p : p.name;
          const quantity = typeof p === "object" ? p.quantity : "";
          const frequency = typeof p === "object" ? p.frequency : "mensal";
          return (
            <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 border">
              <Package className="w-3.5 h-3.5 text-primary shrink-0" />
              <Input className="h-7 text-xs flex-1 bg-transparent border-0 p-0 focus-visible:ring-0"
                value={label} onChange={(e) => updateProduct(i, "name", e.target.value)} />
              <Input className="h-7 text-xs w-16 text-center" type="number" min="1"
                value={quantity} onChange={(e) => updateProduct(i, "quantity", e.target.value)} />
              <Select value={frequency} onValueChange={(v) => updateProduct(i, "frequency", v)}>
                <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="ocasional">Ocasional</SelectItem>
                </SelectContent>
              </Select>
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
    full_name: response.full_name || "",
    email: response.email || "",
    phone: response.phone || "",
    associate_code: response.associate_code || "",
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
          {/* Dados pessoais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nome Completo</Label>
              <Input className="mt-1" value={data.full_name} onChange={(e) => setData({ ...data, full_name: e.target.value })} />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input className="mt-1" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input className="mt-1" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
            </div>
            <div>
              <Label>Código do Associado</Label>
              <Input className="mt-1" value={data.associate_code} onChange={(e) => setData({ ...data, associate_code: e.target.value })} />
            </div>
          </div>

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
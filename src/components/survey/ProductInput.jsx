import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const UNITS = [
  { value: "UN", label: "UN - Unidade" },
  { value: "KG", label: "KG - Quilograma" },
  { value: "G", label: "G - Grama" },
  { value: "L", label: "L - Litro" },
  { value: "ML", label: "ML - Mililitro" },
  { value: "CX", label: "CX - Caixa" },
  { value: "PCT", label: "PCT - Pacote" },
  { value: "FD", label: "FD - Fardo" },
  { value: "DZ", label: "DZ - Dúzia" },
  { value: "LT", label: "LT - Lata" },
  { value: "FR", label: "FR - Frasco" },
  { value: "GF", label: "GF - Garrafa" },
  { value: "SC", label: "SC - Saco" },
  { value: "MC", label: "MC - Maço" },
  { value: "BDJ", label: "BDJ - Bandeja" },
  { value: "PLT", label: "PLT - Palete" },
];

export default function ProductInput({ products, onChange, availableBrands = [] }) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [frequency, setFrequency] = useState("mensal");

  const addProduct = () => {
    const trimmed = name.trim();
    if (!trimmed || !quantity) return;
    const alreadyExists = products.some(
      (p) => p.name?.toLowerCase() === trimmed.toLowerCase() && (p.brand || "").toLowerCase() === brand.trim().toLowerCase()
    );
    if (alreadyExists) return;
    onChange([...products, { name: trimmed, brand: brand.trim(), quantity: quantity.trim(), unit: unit.trim(), frequency }]);
    setName("");
    setBrand("");
    setQuantity("");
    setUnit("");
    setFrequency("mensal");
  };

  const removeProduct = (index) => {
    onChange(products.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addProduct();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Nome do produto *</p>
          <Input
            placeholder="Digite o nome do produto..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full" />
          
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Marca</p>
          <p className="text-xs text-muted-foreground mb-2">Escolha a marca de sua preferência para o produto informado!</p>
          {availableBrands.length > 0 ?
          <Select value={brand} onValueChange={setBrand} disabled={!name.trim()}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione ou deixe em branco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Nenhuma</SelectItem>
                {availableBrands.map((b) =>
              <SelectItem key={b} value={b}>{b}</SelectItem>
              )}
              </SelectContent>
            </Select> :

          <Input
            placeholder="Marca (opcional)"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!name.trim()} />

          }
        </div>
        <div className="flex gap-2 items-end">
          <div className="w-28">
            <p className="text-xs font-medium text-muted-foreground mb-1">Quantidade média *</p>
            <Input
              type="number"
              min="1"
              placeholder="Ex: 2"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onKeyDown={handleKeyDown} />
          </div>
          <div className="w-32">
            <p className="text-xs font-medium text-muted-foreground mb-1">Unidade</p>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">Periodicidade *</p>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Por mês</SelectItem>
                <SelectItem value="ocasional">Ocasional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={addProduct}
            size="icon"
            disabled={!name.trim() || !quantity}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 mb-0.5">
            
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {products.length > 0 &&
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2">
          
            {products.map((product, index) => {
            const label = typeof product === "string" ? product : product.name;
            const qty = typeof product === "object" && product.quantity;
            const unitVal = typeof product === "object" && product.unit;
            const freq = typeof product === "object" && product.frequency;
            return (
              <motion.div
                key={index}
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                className="flex items-center justify-between gap-2 bg-muted/50 rounded-lg px-3 py-2 border">
                
                  <div className="flex items-center gap-2 min-w-0">
                    <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {label}
                      {typeof product === "object" && product.brand ? ` · ${product.brand}` : ""}
                    </span>
                    {qty &&
                  <span className="text-xs text-muted-foreground shrink-0">
                        · {qty}{unitVal ? ` ${unitVal}` : "x"} {freq === "mensal" ? "por mês" : "ocasional"}
                      </span>
                  }
                    {!qty && freq &&
                  <span className="text-xs text-muted-foreground shrink-0">
                        · {freq === "mensal" ? "mensal" : "ocasional"}
                      </span>
                  }
                  </div>
                  <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="hover:bg-destructive/10 rounded-full p-1 transition-colors text-muted-foreground hover:text-destructive shrink-0">
                  
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>);

          })}
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductInput({ products, onChange }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [frequency, setFrequency] = useState("mensal");

  const addProduct = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const alreadyExists = products.some((p) => p.name?.toLowerCase() === trimmed.toLowerCase());
    if (alreadyExists) return;
    onChange([...products, { name: trimmed, quantity: quantity.trim() || null, frequency }]);
    setName("");
    setQuantity("");
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
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            placeholder="Nome do produto..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addProduct}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            min="1"
            placeholder="Qtd. média (ex: 2)"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-40"
          />
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mensal">Por mês</SelectItem>
              <SelectItem value="ocasional">Ocasional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence>
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {products.map((product, index) => {
              const label = typeof product === "string" ? product : product.name;
              const qty = typeof product === "object" && product.quantity;
              const freq = typeof product === "object" && product.frequency;
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0.97, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.97, opacity: 0 }}
                  className="flex items-center justify-between gap-2 bg-muted/50 rounded-lg px-3 py-2 border"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-sm font-medium truncate">{label}</span>
                    {qty && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        · {qty}x {freq === "mensal" ? "por mês" : "ocasional"}
                      </span>
                    )}
                    {!qty && freq && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        · {freq === "mensal" ? "mensal" : "ocasional"}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="hover:bg-destructive/10 rounded-full p-1 transition-colors text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
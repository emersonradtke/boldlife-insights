import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BrandInput({ brands, onChange }) {
  const [inputValue, setInputValue] = useState("");

  const addBrand = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !brands.includes(trimmed)) {
      onChange([...brands, trimmed]);
      setInputValue("");
    }
  };

  const removeBrand = (brand) => {
    onChange(brands.filter((b) => b !== brand));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBrand();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Digite o nome da marca..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addBrand}
          size="icon"
          className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <AnimatePresence>
        {brands.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {brands.map((brand) => (
              <motion.div
                key={brand}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-1.5 text-sm gap-1.5 bg-secondary text-secondary-foreground"
                >
                  {brand}
                  <button
                    type="button"
                    onClick={() => removeBrand(brand)}
                    className="hover:bg-secondary-foreground/10 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
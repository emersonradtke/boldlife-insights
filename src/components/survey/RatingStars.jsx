import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RatingStars({ rating, onChange }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-all duration-200 hover:scale-110 focus:outline-none"
        >
          <Star
            className={cn(
              "w-8 h-8 transition-colors duration-200",
              star <= rating
                ? "fill-primary text-primary"
                : "fill-none text-border hover:text-primary/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}
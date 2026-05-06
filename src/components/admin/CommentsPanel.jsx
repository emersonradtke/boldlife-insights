import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, UserCheck, User } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CommentsPanel({ responses }) {
  const withComments = responses
    .filter((r) => r.comments && r.comments.trim())
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Últimos Comentários</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-3">
          {withComments.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-10">
              Nenhum comentário ainda
            </p>
          ) : (
            <div className="space-y-4">
              {withComments.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                        {r.is_associate ? (
                          <UserCheck className="w-3.5 h-3.5 text-secondary-foreground" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-secondary-foreground" />
                        )}
                      </div>
                      <span className="font-medium text-sm">{r.full_name}</span>
                      {r.is_associate && (
                        <Badge className="bg-primary/10 text-primary text-xs border-0">
                          Associado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (r.satisfaction_rating || 0)
                              ? "fill-primary text-primary"
                              : "fill-none text-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{r.comments}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.created_date ? format(new Date(r.created_date), "dd/MM/yyyy 'às' HH:mm") : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
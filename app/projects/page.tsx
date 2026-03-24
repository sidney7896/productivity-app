"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, ExternalLink } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projecten</h1>
        <p className="text-sm text-muted-foreground">
          Gekoppeld aan FileMaker
        </p>
      </div>

      <Card className="border-border bg-muted p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
          <FolderKanban className="h-6 w-6 text-blue-400" />
        </div>
        <h3 className="mb-2 text-lg font-medium">FileMaker Integratie</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Deze pagina toont projecten en uren uit je FileMaker database.
          Configureer de verbinding via de environment variabelen:
        </p>
        <div className="mx-auto mt-4 max-w-sm space-y-2 text-left">
          <code className="block rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
            FILEMAKER_HOST=jouw-server.claris.com
          </code>
          <code className="block rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
            FILEMAKER_DATABASE=jouw-database
          </code>
          <code className="block rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
            FILEMAKER_USERNAME=gebruikersnaam
          </code>
          <code className="block rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
            FILEMAKER_PASSWORD=wachtwoord
          </code>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
            Niet verbonden
          </Badge>
        </div>
      </Card>

      {/* Placeholder project cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="border-border bg-muted p-4 opacity-40"
          >
            <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="mb-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </Card>
        ))}
      </div>
    </div>
  );
}

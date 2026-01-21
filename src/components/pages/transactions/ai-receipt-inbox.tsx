import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Sparkles,
  FileText,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";

export default function AIReceiptInbox() {
  return (
    <div className="w-80 bg-card border-l border-border p-6 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold">AI Receipt Inbox</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Automatically extract data from your bills and receipts
        </p>
      </div>

      {/* Upload Area */}
      <div className="mb-6 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary hover:bg-secondary/50 transition-all cursor-pointer group">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-secondary group-hover:bg-primary/10 flex items-center justify-center transition-colors">
          <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          Drop receipts here
        </p>
        <p className="text-xs text-muted-foreground">JPG, PNG, DR PDF</p>
      </div>

      {/* Recent Processing */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Recent Processing
          </h3>
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
          >
            2 Active
          </Badge>
        </div>

        {/* Processing Item */}
        <Card className="mb-3 p-3 border-border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground mb-1">
                receipt_4291.jpg
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Uploading 82%...
              </div>
              <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-linear-to-r from-cyan-400 to-blue-500 animate-pulse" />
              </div>
            </div>
          </div>
        </Card>

        {/* Completed Item */}
        <Card className="mb-3 p-3 border-emerald-200 dark:border-emerald-800 bg-emerald-500/10">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded bg-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">
                Starbucks Coffee
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Extraction Ready
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-emerald-500/20"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
          <div className="pl-13 mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold text-foreground">$14.50</span>
            </div>
          </div>
          <Button className="w-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
            Review & Add
          </Button>
        </Card>
      </div>

      {/* AI Info */}
      <div className="mt-8 p-4 bg-secondary/50 rounded-xl border border-border">
        <div className="flex items-start gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary mt-0.5" />
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            &ldquo;Our AI engine categorizes 98% of business receipts
            automatically based on merchant data.&rdquo;
          </p>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-8">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Shortcuts
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Scan Receipt</span>
            <kbd className="px-2 py-1 bg-secondary border border-border rounded text-xs font-mono">
              ⌘ S
            </kbd>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Global Search</span>
            <kbd className="px-2 py-1 bg-secondary border border-border rounded text-xs font-mono">
              ⌘ K
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

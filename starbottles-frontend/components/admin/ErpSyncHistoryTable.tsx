"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useErpSyncStatus } from "@/hooks/useErpSync";
import { History, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ErpSyncHistoryTable() {
  const { data, isLoading } = useErpSyncStatus();
  const logs = data?.logs ?? [];

  return (
    <Card className="border shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/25 hover:bg-muted/25">
              <TableHead className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground h-9 pl-5">
                Date / Time
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground h-9">
                Status
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground h-9 text-right">
                Added
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground h-9 text-right">
                Updated
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground h-9 pr-5">
                Error
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j} className="py-3">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <History size={24} className="text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">No sync history yet.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/10">
                  <TableCell className="text-sm text-muted-foreground pl-5 py-3 tabular-nums">
                    {format(new Date(log.synced_at), "dd MMM yyyy, HH:mm")}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold gap-1",
                        log.status === "success"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      )}
                    >
                      {log.status === "success" ? (
                        <CheckCircle2 size={10} />
                      ) : (
                        <XCircle size={10} />
                      )}
                      {log.status === "success" ? "Success" : "Failed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums py-3">
                    <span className={cn(
                      "font-medium",
                      log.products_added > 0 ? "text-emerald-600" : "text-muted-foreground"
                    )}>
                      {log.products_added > 0 ? `+${log.products_added}` : "0"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums py-3">
                    <span className={cn(
                      "font-medium",
                      log.products_updated > 0 ? "text-accent" : "text-muted-foreground"
                    )}>
                      {log.products_updated > 0 ? log.products_updated : "0"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs pr-5 py-3">
                    {log.error_message ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help truncate block max-w-[200px] text-red-600 text-xs">
                            {log.error_message.length > 50
                              ? log.error_message.slice(0, 50) + "..."
                              : log.error_message}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm text-xs break-words">
                          {log.error_message}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

import { Skeleton } from "./ui/skeleton";
import { Card, CardHeader, CardContent } from "./ui/card";

export function DashboardCardSkeleton() {
  return (
    <Card className="rounded-2xl border shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-1/2 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

export function FolderSkeleton() {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-card">
      <div className="flex items-center gap-3 min-w-0 w-full">
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        <div className="flex flex-col gap-1.5 w-full">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function DocumentCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border bg-card p-4 h-full">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}

export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3">
      <div className="rounded-2xl border shadow-sm overflow-hidden bg-card">
        <div className="border-b px-6 py-4 flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6 hidden md:block" />
          <Skeleton className="h-4 w-1/6 hidden md:block" />
          <Skeleton className="h-4 w-1/6" />
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex gap-4 items-center">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6 hidden md:block" />
              <Skeleton className="h-4 w-1/6 hidden md:block" />
              <div className="w-1/6 flex justify-end">
                 <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border border-transparent hover:border-border transition-colors hover:bg-muted/30">
      <Skeleton className="mt-1 h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-4 mt-2 pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function TaskItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border bg-card mb-3">
      <div className="hidden sm:flex shrink-0">
        <Skeleton className="h-5 w-5 rounded-md" />
      </div>
      <Skeleton className="h-7 w-7 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full shrink-0" />
    </div>
  );
}

export function DetailedCardSkeleton() {
  return (
    <Card className="rounded-2xl border shadow-sm h-full flex flex-col">
      <CardHeader>
        <Skeleton className="h-5 w-1/3 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

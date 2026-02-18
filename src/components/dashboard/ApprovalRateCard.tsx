import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalRateCardProps {
  approvedCount: number;
  totalCount: number;
  loading?: boolean;
  compact?: boolean;
}

export function ApprovalRateCard({ approvedCount, totalCount, loading, compact }: ApprovalRateCardProps) {
  const rate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  const strokeColor = rate >= 80 ? 'text-green-500' : rate >= 50 ? 'text-yellow-500' : 'text-red-500';
  const bgColor = rate >= 80 ? 'bg-green-500/10' : rate >= 50 ? 'bg-yellow-500/10' : 'bg-red-500/10';
  const label = rate >= 80 ? 'Sangat Baik' : rate >= 50 ? 'Cukup Baik' : 'Perlu Perhatian';

  const circumference = 2 * Math.PI * 40;
  const dashArray = `${(rate / 100) * circumference} ${circumference}`;

  if (loading) {
    return (
      <Card className="glass-card h-full">
        <CardContent className="p-6 flex items-center justify-center min-h-[140px]">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="glass-card hover:shadow-xl transition-all">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <div className={cn('p-2 rounded-full mb-2', bgColor)}>
              <TrendingUp className={cn('h-5 w-5', strokeColor)} />
            </div>
            <p className={cn('text-2xl font-bold', strokeColor)}>{rate}%</p>
            <p className="text-xs text-muted-foreground">Approval Rate</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Tingkat Persetujuan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center w-full min-h-[200px]">
          <div className="relative w-28 h-28 flex-shrink-0 mb-4">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
              <circle
                cx="48" cy="48" r="40"
                stroke="currentColor" strokeWidth="8" fill="transparent"
                strokeDasharray={dashArray}
                strokeLinecap="round"
                className={cn('transition-all duration-700', strokeColor)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn('text-2xl font-bold', strokeColor)}>{rate}%</span>
            </div>
          </div>
          <p className={cn('text-sm font-semibold mb-3', strokeColor)}>{label}</p>
          <div className="w-full max-w-[200px] space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Disetujui</span>
              <span className="font-medium text-green-600">{approvedCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Masuk</span>
              <span className="font-medium">{totalCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ExifData, RiskAnalysis } from '@/types';
import { formatExifForDisplay } from '@/lib/exif-utils';

interface ExifViewerProps {
  exifData: ExifData;
  riskAnalysis: RiskAnalysis;
  title?: string;
}

export function ExifViewer({ exifData, riskAnalysis, title = 'EXIF情報' }: ExifViewerProps) {
  const displayItems = formatExifForDisplay(exifData);

  const getRiskIcon = () => {
    switch (riskAnalysis.level) {
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'medium':
        return <Info className="h-5 w-5" />;
      case 'low':
        return <CheckCircle2 className="h-5 w-5" />;
    }
  };

  const getRiskVariant = () => {
    switch (riskAnalysis.level) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'default';
    }
  };

  const getRiskBadge = () => {
    switch (riskAnalysis.level) {
      case 'high':
        return <Badge variant="destructive">高リスク</Badge>;
      case 'medium':
        return <Badge variant="secondary">中リスク</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-green-500 text-green-500">低リスク</Badge>;
    }
  };

  return (
    <Card className="p-6 min-w-0 w-full" style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}>
      <div className="mb-4 flex items-center justify-between gap-2 flex-wrap" style={{ writingMode: 'horizontal-tb' }}>
        <h3 className="text-lg font-semibold break-words" style={{ writingMode: 'horizontal-tb' }}>{title}</h3>
        {getRiskBadge()}
      </div>

      <Alert variant={getRiskVariant()} className="mb-4 flex items-start gap-3">
        {getRiskIcon()}
        <div className="flex-1 min-w-0" style={{ writingMode: 'horizontal-tb' }}>
          <AlertTitle style={{ writingMode: 'horizontal-tb' }}>プライバシーリスク評価</AlertTitle>
          <AlertDescription className="mt-1" style={{ writingMode: 'horizontal-tb' }}>
            {riskAnalysis.message}
          </AlertDescription>
        </div>
      </Alert>

      <Separator className="my-4" />

      <ScrollArea className="h-[300px] w-full">
        <div className="space-y-3 pr-4" style={{ writingMode: 'horizontal-tb' }}>
          {displayItems.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col gap-1 rounded-lg p-3 min-w-0 ${
                item.isWarning
                  ? 'bg-destructive/10 border border-destructive/20'
                  : 'bg-accent/50'
              }`}
              style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
            >
              <div className="flex items-center gap-2 flex-wrap" style={{ writingMode: 'horizontal-tb' }}>
                <span className="text-sm font-medium text-muted-foreground break-words" style={{ writingMode: 'horizontal-tb', display: 'inline-block' }}>
                  {item.key}
                </span>
                {item.isWarning && (
                  <Badge variant="destructive" className="h-5 text-xs shrink-0">
                    危険
                  </Badge>
                )}
              </div>
              <span
                className={`text-sm break-all ${
                  item.isWarning ? 'font-semibold text-destructive' : ''
                }`}
                style={{ writingMode: 'horizontal-tb', display: 'block' }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}


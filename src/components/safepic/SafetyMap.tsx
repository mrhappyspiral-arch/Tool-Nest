 'use client';

import { AlertTriangle, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { GPS } from '@/types';

interface SafetyMapProps {
  gps: GPS;
}

export function SafetyMap({ gps }: SafetyMapProps) {
  const { latitude, longitude } = gps;
  const zoom = 15;
  const delta = 0.01;

  // OpenStreetMap のシンプルな埋め込み地図
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <Card className="overflow-hidden">
      <div className="bg-destructive/10 p-4 border-b border-destructive/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-destructive break-words">
              危険: あなたの位置情報が特定されます
            </h3>
            <p className="text-sm text-muted-foreground mt-1 break-words">
              この画像には撮影場所のGPS情報が含まれています。
              地図表示は省略していますが、以下の座標から自宅やよく行く場所が推測される可能性があります。
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">検出された撮影位置</p>
            <p className="text-xs text-muted-foreground mt-1">
              緯度・経度はおおよその撮影地点を示します。この情報が含まれたままSNS等に投稿すると、
              あなたの生活圏が第三者に知られるリスクがあります。
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
          <p className="font-mono text-sm">
            緯度: <span className="font-semibold">{latitude.toFixed(6)}</span>
          </p>
          <p className="font-mono text-sm mt-1">
            経度: <span className="font-semibold">{longitude.toFixed(6)}</span>
          </p>
        </div>

        {/* 簡易地図表示（OpenStreetMap埋め込み） */}
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="aspect-[4/3] w-full">
            <iframe
              title="撮影位置の地図"
              src={mapSrc}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <Alert variant="destructive" className="mt-2">
          <MapPin className="h-4 w-4 shrink-0" />
          <AlertTitle>プライバシー警告</AlertTitle>
          <AlertDescription className="text-xs">
            位置情報を含んだまま画像を共有すると、自宅や職場、よく行く場所などが特定される危険性があります。
            EXIF情報を削除してからの共有をおすすめします。
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}


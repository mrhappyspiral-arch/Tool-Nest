import fs from 'fs';
import path from 'path';

// データファイルのパス
// Vercel などのサーバーレス環境ではプロジェクトディレクトリは読み取り専用のため、
// 一時ディレクトリ（/tmp）配下を使用する。
const DATA_DIR =
  process.env.VERCEL === '1'
    ? path.join('/tmp', 'tool-nest-data')
    : path.join(process.cwd(), 'data');
const QR_CODES_FILE = path.join(DATA_DIR, 'qr-codes.json');
const SCAN_LOGS_FILE = path.join(DATA_DIR, 'scan-logs.json');

// データディレクトリを確保
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// QRコードの型定義
export interface QrCode {
  id: string;
  name: string | null;
  targetUrl: string;
  manageToken: string;
  createdAt: string;
  updatedAt: string;
}

// スキャンログの型定義
export interface QrScanLog {
  id: string;
  qrId: string;
  scannedAt: string;
  userAgent: string | null;
  ipHash: string | null;
}

// QRコードの読み込み
function loadQrCodes(): QrCode[] {
  ensureDataDir();
  if (!fs.existsSync(QR_CODES_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(QR_CODES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// QRコードの保存
function saveQrCodes(codes: QrCode[]) {
  ensureDataDir();
  fs.writeFileSync(QR_CODES_FILE, JSON.stringify(codes, null, 2));
}

// スキャンログの読み込み
function loadScanLogs(): QrScanLog[] {
  ensureDataDir();
  if (!fs.existsSync(SCAN_LOGS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(SCAN_LOGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// スキャンログの保存
function saveScanLogs(logs: QrScanLog[]) {
  ensureDataDir();
  fs.writeFileSync(SCAN_LOGS_FILE, JSON.stringify(logs, null, 2));
}

// シンプルなデータベース操作オブジェクト
export const db = {
  qrCode: {
    create: (data: { data: Omit<QrCode, 'id' | 'createdAt' | 'updatedAt'> & { id?: string } }): QrCode => {
      const codes = loadQrCodes();
      const now = new Date().toISOString();
      const newCode: QrCode = {
        id: data.data.id || crypto.randomUUID(),
        name: data.data.name,
        targetUrl: data.data.targetUrl,
        manageToken: data.data.manageToken,
        createdAt: now,
        updatedAt: now,
      };
      codes.push(newCode);
      saveQrCodes(codes);
      return newCode;
    },

    findUnique: (args: { where: { id?: string; manageToken?: string } }): QrCode | null => {
      const codes = loadQrCodes();
      if (args.where.id) {
        return codes.find(c => c.id === args.where.id) || null;
      }
      if (args.where.manageToken) {
        return codes.find(c => c.manageToken === args.where.manageToken) || null;
      }
      return null;
    },

    update: (args: { where: { id: string }; data: Partial<QrCode> }): QrCode => {
      const codes = loadQrCodes();
      const index = codes.findIndex(c => c.id === args.where.id);
      if (index === -1) {
        throw new Error('QR code not found');
      }
      codes[index] = {
        ...codes[index],
        ...args.data,
        updatedAt: new Date().toISOString(),
      };
      saveQrCodes(codes);
      return codes[index];
    },
  },

  qrScanLog: {
    create: (data: { data: { qrId: string; userAgent?: string; ipHash?: string } }): QrScanLog => {
      const logs = loadScanLogs();
      const newLog: QrScanLog = {
        id: crypto.randomUUID(),
        qrId: data.data.qrId,
        scannedAt: new Date().toISOString(),
        userAgent: data.data.userAgent || null,
        ipHash: data.data.ipHash || null,
      };
      logs.push(newLog);
      saveScanLogs(logs);
      return newLog;
    },

    count: (args?: { where?: { qrId?: string; scannedAt?: { gte?: Date } } }): number => {
      const logs = loadScanLogs();
      let filtered = logs;

      if (args?.where?.qrId) {
        filtered = filtered.filter(l => l.qrId === args.where!.qrId);
      }

      if (args?.where?.scannedAt?.gte) {
        const gteDate = args.where.scannedAt.gte;
        filtered = filtered.filter(l => new Date(l.scannedAt) >= gteDate);
      }

      return filtered.length;
    },

    findMany: (args?: { where?: { qrId?: string; scannedAt?: { gte?: Date } }; select?: { scannedAt?: boolean } }): QrScanLog[] | { scannedAt: string }[] => {
      const logs = loadScanLogs();
      let filtered = logs;

      if (args?.where?.qrId) {
        filtered = filtered.filter(l => l.qrId === args.where!.qrId);
      }

      if (args?.where?.scannedAt?.gte) {
        const gteDate = args.where.scannedAt.gte;
        filtered = filtered.filter(l => new Date(l.scannedAt) >= gteDate);
      }

      if (args?.select?.scannedAt) {
        return filtered.map(l => ({ scannedAt: l.scannedAt }));
      }

      return filtered;
    },
  },
};

export default db;

import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, QrCode } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';

export default function QRCodePanel({ projectId, projectTitle }) {
  const url = `${window.location.origin}/projects/${projectId}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: projectTitle, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <Card className="border-brand-200/50 bg-gradient-to-br from-white to-brand-50/30">
      <CardHeader
        title="Public Site QR Code"
        subtitle="Display at the project location"
      />
      <div className="flex flex-col items-center text-center">
        <div className="p-1 rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-600 shadow-lg mb-4">
          <div className="p-4 bg-white rounded-xl">
            <QRCodeSVG value={url} size={168} level="M" includeMargin />
          </div>
        </div>
        <p className="text-sm text-slate-700 font-medium leading-relaxed max-w-xs">
          Scan this QR code at the project site to view public budget details.
        </p>
        <p className="text-[10px] text-slate-400 mt-2 break-all max-w-[220px]">{url}</p>
        <div className="flex gap-2 mt-5 w-full">
          <Button variant="secondary" size="sm" icon={Share2} className="flex-1" onClick={handleShare}>
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Download}
            className="flex-1"
            onClick={() => {
              const svg = document.querySelector(`#qr-${projectId} svg`);
              if (svg) {
                const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `wardwatch-${projectId}.svg`;
                a.click();
              }
            }}
          >
            Save
          </Button>
        </div>
      </div>
      <div id={`qr-${projectId}`} className="hidden">
        <QRCodeSVG value={url} size={512} level="M" includeMargin />
      </div>
    </Card>
  );
}

export function QRCodeBanner({ projectId }) {
  const url = `${window.location.origin}/projects/${projectId}`;
  return (
    <div className="hidden lg:flex items-center gap-4 p-4 rounded-xl bg-brand-50 border border-brand-100">
      <QrCode className="h-8 w-8 text-brand-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-brand-800">Site QR Code Available</p>
        <p className="text-xs text-brand-600/80 truncate">Scan at project site → {url}</p>
      </div>
      <div className="p-2 bg-white rounded-lg border border-brand-100 shrink-0">
        <QRCodeSVG value={url} size={64} level="M" />
      </div>
    </div>
  );
}

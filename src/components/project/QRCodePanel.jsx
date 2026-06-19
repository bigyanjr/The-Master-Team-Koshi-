import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2 } from 'lucide-react';
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
    <Card>
      <CardHeader
        title="Public QR Code"
        subtitle="Scan to view this project on any device"
      />
      <div className="flex flex-col items-center">
        <div className="p-4 bg-white rounded-xl border-2 border-slate-100">
          <QRCodeSVG value={url} size={160} level="M" includeMargin />
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center break-all max-w-[200px]">{url}</p>
        <div className="flex gap-2 mt-4 w-full">
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

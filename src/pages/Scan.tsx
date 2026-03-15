import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Camera, Edit3 } from 'lucide-react';
import { useT } from '../lib/i18n';

export function Scan() {
  const { t } = useT();
  const navigate = useNavigate();
  const [isManual, setIsManual] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    if (isManual) return;
    const scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 10, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA, Html5QrcodeScanType.SCAN_TYPE_FILE] }, false);
    scanner.render(
      (decodedText: string) => { scanner.clear(); setTimeout(() => navigate(`/stock?code=${encodeURIComponent(decodedText)}`), 500); },
      () => {}
    );
    return () => { scanner.clear().catch(console.error); };
  }, [navigate, isManual]);

  const handleManualSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (manualCode.trim()) navigate(`/stock?code=${encodeURIComponent(manualCode.trim())}`);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 pb-24">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex gap-6 justify-between">
          <p className="text-slate-700 dark:text-slate-300 text-base font-medium leading-normal">{t.step(2, 4)}</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">50%</p>
        </div>
        <div className="rounded-full h-2 bg-slate-200 dark:bg-primary/20 overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: '50%' }} />
        </div>
      </div>

      <div className="px-6 pt-6 pb-4">
        <h3 className="text-slate-900 dark:text-slate-100 tracking-tight text-2xl font-bold leading-tight text-center">
          {isManual ? t.manualTitle : t.scanTitle}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-2">
          {isManual ? t.manualDesc : t.scanDesc}
        </p>
      </div>

      {isManual ? (
        <div className="mx-6 my-4 space-y-4">
          <form onSubmit={handleManualSubmit}>
            <input type="text" value={manualCode} onChange={e => setManualCode(e.target.value)} placeholder={t.enterCode}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-4 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              autoFocus
            />
            <button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all">{t.continue}</button>
          </form>
        </div>
      ) : (
        <div className="flex-1 relative mx-4 my-2 overflow-hidden rounded-xl border-2 border-primary/30 bg-slate-800 min-h-[300px]">
          <div id="reader" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center justify-center gap-8 p-6 mt-4">
        <button onClick={() => setIsManual(false)} className={`flex flex-col items-center gap-2 group ${!isManual ? 'text-primary' : ''}`}>
          <div className="flex shrink-0 items-center justify-center rounded-full size-12 bg-slate-100 dark:bg-primary/10 text-slate-700 dark:text-slate-300 group-active:scale-95 transition-transform">
            <Camera size={24} className={!isManual ? 'text-primary' : ''} />
          </div>
          <span className="text-xs font-medium text-slate-500">{t.scan}</span>
        </button>
        <button onClick={() => setIsManual(true)} className={`flex flex-col items-center gap-2 group ${isManual ? 'text-primary' : ''}`}>
          <div className="flex shrink-0 items-center justify-center rounded-full size-12 bg-slate-100 dark:bg-primary/10 text-slate-700 dark:text-slate-300 group-active:scale-95 transition-transform">
            <Edit3 size={24} className={isManual ? 'text-primary' : ''} />
          </div>
          <span className="text-xs font-medium text-slate-500">Manual</span>
        </button>
      </div>

      <style>{`
        #reader { border: none !important; }
        #reader__dashboard_section_csr span { color: white !important; }
        #reader__dashboard_section_csr button { background: #19207b !important; color: white !important; border: none !important; padding: 8px 16px !important; border-radius: 8px !important; margin: 4px !important; }
      `}</style>
    </div>
  );
}

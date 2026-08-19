import React from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface LightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ imageUrl, onClose }) => {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  if (!imageUrl) return null;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      {/* Top Toolbar */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-800 text-neutral-300">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleRotate}
          className="p-2 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          title="Rotate"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = 'telegram-image.jpg';
            a.click();
          }}
          className="p-2 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-neutral-800 mx-1" />
        <button
          onClick={onClose}
          className="p-2 hover:text-white hover:bg-red-500/20 text-neutral-300 hover:text-red-400 rounded-xl transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image Display */}
      <div className="relative z-10 max-w-4xl max-h-[85vh] flex items-center justify-center select-none overflow-hidden">
        <img
          src={imageUrl}
          alt="Enlarged media"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease',
          }}
          className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
        />
      </div>
    </div>
  );
};

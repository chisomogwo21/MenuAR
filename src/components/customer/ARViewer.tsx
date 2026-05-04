import React from 'react';
import { Camera } from 'lucide-react';

interface ARViewerProps {
  modelUrl?: string;
  dishName: string;
  imageUrl?: string;
}

const ARViewer: React.FC<ARViewerProps> = ({ modelUrl, dishName, imageUrl }) => {
  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center relative">
      {modelUrl ? (
        <model-viewer
          src={modelUrl}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          alt={dishName}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <>
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={dishName} 
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          )}
          <div className="relative z-10 p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-center flex flex-col items-center gap-3">
            <div className="p-4 bg-white/10 rounded-full">
              <Camera size={32} className="text-white" />
            </div>
            <p className="text-white font-medium text-sm">3D preview coming soon for this dish</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ARViewer;

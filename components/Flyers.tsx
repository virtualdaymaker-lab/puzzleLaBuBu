import React, { useRef, useState, useEffect } from 'react';
import { Button } from './Button';

interface FlyerProps {
  onBack: () => void;
}

export const Flyers: React.FC<FlyerProps> = ({ onBack }) => {
  const flyer1Ref = useRef<HTMLDivElement>(null);
  const flyer2Ref = useRef<HTMLDivElement>(null);
  const flyer3Ref = useRef<HTMLDivElement>(null);
  
  const [daysLeft, setDaysLeft] = useState(14);
  
  useEffect(() => {
    // Calculate days until Christmas Eve (Dec 24, 2025)
    const christmasEve = new Date('2025-12-24T23:59:59');
    const now = new Date();
    const diff = christmasEve.getTime() - now.getTime();
    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    setDaysLeft(days);
  }, []);

  const downloadFlyer = async (flyerRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!flyerRef.current) return;
    
    // Create a canvas from the flyer
    const flyer = flyerRef.current;
    const canvas = document.createElement('canvas');
    const scale = 2; // Higher resolution
    canvas.width = flyer.offsetWidth * scale;
    canvas.height = flyer.offsetHeight * scale;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw background
    ctx.scale(scale, scale);
    
    // Use html2canvas-like approach with foreignObject
    const data = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${flyer.offsetWidth}" height="${flyer.offsetHeight}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${flyer.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;
    
    const img = new Image();
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.download = filename;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        }
      }, 'image/png');
    };
    
    img.src = url;
  };

  // Simple download using print/screenshot instruction
  const handleDownload = (flyerNumber: number) => {
    const flyerElement = flyerNumber === 1 ? flyer1Ref.current : flyerNumber === 2 ? flyer2Ref.current : flyer3Ref.current;
    if (!flyerElement) return;
    
    // Create a new window with just the flyer for easy screenshot/save
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PuzLabu Flyer ${flyerNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              background: #0f172a; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              font-family: 'Rajdhani', sans-serif;
            }
            .flyer {
              width: 400px;
              padding: 40px;
              border-radius: 20px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            .flyer-1 {
              background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
              border: 2px solid #06b6d4;
              box-shadow: 0 0 40px rgba(6, 182, 212, 0.3);
            }
            .flyer-2 {
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
              border: 2px solid #8b5cf6;
              box-shadow: 0 0 40px rgba(139, 92, 246, 0.3);
            }
            .flyer-3 {
              background: linear-gradient(135deg, #0c0c0c 0%, #1a0a0a 50%, #2d1f1f 100%);
              border: 2px solid #ef4444;
              box-shadow: 0 0 40px rgba(239, 68, 68, 0.3);
            }
            .title { 
              font-family: 'Orbitron', sans-serif; 
              font-size: 36px; 
              font-weight: 900; 
              letter-spacing: 4px;
              margin-bottom: 10px;
            }
            .gradient-cyan { background: linear-gradient(90deg, #06b6d4, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .gradient-purple { background: linear-gradient(90deg, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .gradient-red { background: linear-gradient(90deg, #ef4444, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .limited { 
              font-family: 'Orbitron', sans-serif;
              font-size: 14px; 
              letter-spacing: 3px; 
              padding: 8px 20px; 
              border-radius: 4px; 
              display: inline-block; 
              margin: 15px 0;
            }
            .limited-cyan { background: rgba(6, 182, 212, 0.2); border: 1px solid #06b6d4; color: #06b6d4; }
            .limited-purple { background: rgba(139, 92, 246, 0.2); border: 1px solid #8b5cf6; color: #8b5cf6; }
            .limited-red { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #ef4444; }
            .christmas { font-size: 48px; margin: 20px 0; }
            .count { 
              font-family: 'Orbitron', sans-serif;
              font-size: 64px; 
              font-weight: 900; 
              margin: 10px 0;
            }
            .count-cyan { color: #06b6d4; text-shadow: 0 0 30px rgba(6, 182, 212, 0.5); }
            .count-purple { color: #8b5cf6; text-shadow: 0 0 30px rgba(139, 92, 246, 0.5); }
            .count-red { color: #ef4444; text-shadow: 0 0 30px rgba(239, 68, 68, 0.5); }
            .remaining { color: #94a3b8; font-size: 18px; letter-spacing: 4px; text-transform: uppercase; }
            .cta { 
              font-family: 'Orbitron', sans-serif;
              font-size: 16px; 
              padding: 15px 30px; 
              border-radius: 8px; 
              margin-top: 25px; 
              display: inline-block; 
              letter-spacing: 2px;
              font-weight: 700;
            }
            .cta-cyan { background: linear-gradient(90deg, #06b6d4, #0891b2); color: #000; }
            .cta-purple { background: linear-gradient(90deg, #8b5cf6, #7c3aed); color: #fff; }
            .cta-red { background: linear-gradient(90deg, #ef4444, #dc2626); color: #fff; }
            .snowflakes { position: absolute; top: 10px; left: 0; right: 0; font-size: 24px; opacity: 0.3; }
            .tagline { color: #64748b; font-size: 14px; margin-top: 20px; letter-spacing: 2px; }
            p { margin: 5px 0; color: #cbd5e1; }
            .instruction { 
              margin-top: 30px; 
              padding: 15px; 
              background: #1e293b; 
              border-radius: 8px; 
              color: #94a3b8; 
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          ${flyerElement.innerHTML}
          <div class="instruction">
            Right-click the flyer and select "Save image as..." or use Ctrl+P to print/save as PDF
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4 animate-fade-in">
      <Button onClick={onBack} variant="secondary" size="sm" className="self-start mb-6">
        ← Back to Menu
      </Button>
      
      <h2 className="text-2xl md:text-3xl text-gray-800 font-bold mb-8 text-center tracking-widest uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
        Download Flyers
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        
        {/* Flyer 1 - Deep Christmas Red */}
        <div className="flex flex-col items-center gap-4">
          <div 
            ref={flyer1Ref}
            className="w-full aspect-[3/4] rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center"
            style={{
              background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0a0a 50%, #3d1515 100%)',
              border: '2px solid #b91c1c',
              boxShadow: '0 0 40px rgba(185, 28, 28, 0.3)'
            }}
          >
            <div className="text-lg font-bold text-red-400 tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {daysLeft} DAYS LEFT
            </div>
            
            <div className="mt-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#b91c1c' }}>
              <h3 className="text-2xl font-black tracking-wider text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                PuzLabu
              </h3>
            </div>
            
            <div className="mt-3 px-3 py-1 rounded text-[10px] tracking-[0.2em] uppercase" style={{ background: 'rgba(185, 28, 28, 0.3)', border: '1px solid #b91c1c', color: '#fca5a5', fontFamily: 'Orbitron, sans-serif' }}>
              Limited Edition
            </div>
            
            {/* One Big Image */}
            <div className="my-4">
              <img src="./images/PuzLabu/lpbb1.png" alt="Limited Edition" className="w-32 h-32 object-contain rounded-xl" style={{ background: '#f5f0ff' }} />
            </div>
            
            <div className="text-gray-300 text-sm tracking-wide mb-2">
              5 Puzzles - 2 Limited Edition
            </div>
            
            <div className="text-3xl font-black text-red-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              $20
            </div>
            
            {/* Other 4 puzzles */}
            <div className="flex gap-1 mt-2">
              <img src="./images/PuzLabu/lpbb2.png" alt="Puzzle" className="w-8 h-8 object-contain rounded" style={{ background: '#e8f5e9' }} />
              <img src="./images/PuzLabu/lbpp3.png" alt="Puzzle" className="w-8 h-8 object-contain rounded" style={{ background: '#e3f2fd' }} />
              <img src="./images/PuzLabu/lpbb8.png" alt="Puzzle" className="w-8 h-8 object-contain rounded" style={{ background: '#fff8e1' }} />
              <img src="./images/PuzLabu/lpbb12.png" alt="Puzzle" className="w-8 h-8 object-contain rounded" style={{ background: '#efebe9' }} />
            </div>
            
            <a 
              href="https://www.paypal.com/paypalme/YOURUSERNAME/20" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-3 text-white text-sm px-6 py-2 rounded-lg inline-block font-bold tracking-wider hover:opacity-90 transition-opacity" 
              style={{ backgroundColor: '#b91c1c', fontFamily: 'Orbitron, sans-serif' }}
            >
              BUY NOW
            </a>
            
            <div className="mt-2 text-gray-500 text-[10px] tracking-wider">Dec 10 - Dec 24, 2025</div>
          </div>
          
          <Button onClick={() => handleDownload(1)} variant="primary" size="sm">
            Download Flyer 1
          </Button>
        </div>

        {/* Flyer 2 - Deep Forest Green */}
        <div className="flex flex-col items-center gap-4">
          <div 
            ref={flyer2Ref}
            className="w-full aspect-[3/4] rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center"
            style={{
              background: 'linear-gradient(135deg, #0a1a0a 0%, #0a2d0a 50%, #153d15 100%)',
              border: '2px solid #166534',
              boxShadow: '0 0 40px rgba(22, 101, 52, 0.3)'
            }}
          >
            <div className="text-lg font-bold text-green-400 tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {daysLeft} DAYS LEFT
            </div>
            
            <div className="mt-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#b91c1c' }}>
              <h3 className="text-2xl font-black tracking-wider text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                PuzLabu
              </h3>
            </div>
            
            <div className="mt-3 px-3 py-1 rounded text-[10px] tracking-[0.2em] uppercase" style={{ background: 'rgba(22, 101, 52, 0.3)', border: '1px solid #166534', color: '#86efac', fontFamily: 'Orbitron, sans-serif' }}>
              Christmas Drop
            </div>
            
            {/* One Big Image */}
            <div className="my-4">
              <img src="./images/PuzLabu/lpbb12.png" alt="Limited Edition" className="w-32 h-32 object-contain rounded-xl" style={{ background: '#efebe9' }} />
            </div>
            
            <div className="text-gray-300 text-sm tracking-wide mb-2">
              5 Puzzles - 2 Limited Edition
            </div>
            
            <div className="text-3xl font-black text-green-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              $20
            </div>
            
            {/* Other 4 puzzles */}
            <div className="flex gap-1 mt-2">
              <img src="./images/PuzLabu/lpbb1.png" alt="Puzzle" className="w-8 h-8 object-contain rounded" style={{ background: '#f5f0ff' }} />
              <img src="./images/PuzLabu/lpbb2.png" alt="Puzzle" className="w-8 h-8 object-contain rounded" style={{ background: '#e8f5e9' }} />
              <img src="./images/PuzLabu/lbpp3.png" alt="Puzzle" className="w-8 h-8 object-contain rounded" style={{ background: '#e3f2fd' }} />
              <img src="./images/PuzLabu/lpbb8.png" alt="Puzzle" className="w-8 h-8 object-contain rounded" style={{ background: '#fff8e1' }} />
            </div>
            
            <a 
              href="https://www.paypal.com/paypalme/YOURUSERNAME/20" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-3 text-white text-sm px-6 py-2 rounded-lg inline-block font-bold tracking-wider hover:opacity-90 transition-opacity" 
              style={{ backgroundColor: '#b91c1c', fontFamily: 'Orbitron, sans-serif' }}
            >
              BUY NOW
            </a>
            
            <div className="mt-2 text-gray-500 text-[10px] tracking-wider">Ends Christmas Eve 2025</div>
          </div>
          
          <Button onClick={() => handleDownload(2)} variant="primary" size="sm">
            Download Flyer 2
          </Button>
        </div>

        {/* Flyer 3 - Deep Gold */}
        <div className="flex flex-col items-center gap-4">
          <div 
            ref={flyer3Ref}
            className="w-full aspect-[3/4] rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center"
            style={{
              background: 'linear-gradient(135deg, #1a150a 0%, #2d1f0a 50%, #3d2a15 100%)',
              border: '2px solid #b45309',
              boxShadow: '0 0 40px rgba(180, 83, 9, 0.3)'
            }}
          >
            <div className="text-lg font-bold text-amber-400 tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {daysLeft} DAYS LEFT
            </div>
            
            <div className="mt-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#b91c1c' }}>
              <h3 className="text-2xl font-black tracking-wider text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                PuzLabu
              </h3>
            </div>
            
            <div className="mt-3 px-3 py-1 rounded text-[10px] tracking-[0.2em] uppercase" style={{ background: 'rgba(180, 83, 9, 0.3)', border: '1px solid #b45309', color: '#fcd34d', fontFamily: 'Orbitron, sans-serif' }}>
              Final Stock
            </div>
            
            {/* One Big Image */}
            <div className="my-4">
              <img src="./images/PuzLabu/lpbb2.png" alt="Stock" className="w-32 h-32 object-contain rounded-xl" style={{ background: '#e8f5e9' }} />
            </div>
            
            <div className="text-gray-300 text-sm tracking-wide mb-2">
              5 Puzzles - 2 Limited Edition
            </div>
            
            <div className="text-3xl font-black text-amber-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              $20
            </div>
            
            {/* Other 4 puzzles */}
            <div className="flex gap-1 mt-2">
              <img src="./images/PuzLabu/lpbb1.png" alt="Puzzle" className="w-8 h-8 object-contain rounded" style={{ background: '#f5f0ff' }} />
              <img src="./images/PuzLabu/lbpp3.png" alt="Puzzle" className="w-8 h-8 object-contain rounded" style={{ background: '#e3f2fd' }} />
              <img src="./images/PuzLabu/lpbb8.png" alt="Puzzle" className="w-8 h-8 object-contain rounded" style={{ background: '#fff8e1' }} />
              <img src="./images/PuzLabu/lpbb12.png" alt="Puzzle" className="w-8 h-8 object-contain rounded" style={{ background: '#efebe9' }} />
            </div>
            
            <a 
              href="https://www.paypal.com/paypalme/YOURUSERNAME/20"
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-3 text-white text-sm px-6 py-2 rounded-lg inline-block font-bold tracking-wider hover:opacity-90 transition-opacity" 
              style={{ backgroundColor: '#b91c1c', fontFamily: 'Orbitron, sans-serif' }}
            >
              BUY NOW
            </a>
            
            <div className="mt-2 text-gray-500 text-[10px] tracking-wider">Sale ends Dec 24, 2025</div>
          </div>
          
          <Button onClick={() => handleDownload(3)} variant="primary" size="sm">
            Download Flyer 3
          </Button>
        </div>
        
      </div>
      
      <p className="mt-8 text-gray-400 text-center text-sm tracking-wide">
        Click download to open flyer in new tab - Right click to save
      </p>
    </div>
  );
};

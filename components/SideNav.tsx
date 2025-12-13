import React, { useState } from 'react';

export const SideNav: React.FC = () => {
  const [open, setOpen] = useState(false);
  const setView = (view: 'menu' | 'puzzle', id?: string) => {
    try {
      (window as any).setPuzView && (window as any).setPuzView(view, id);
    } catch {}
  };

  const dispatch = (detail: any) => {
    try { window.dispatchEvent(new CustomEvent('puzlabu-nav', { detail })); } catch {}
  };
  const openDemo = () => dispatch({ action: 'showDemo' });
  const openCheckout = () => dispatch({ action: 'openCheckout' });
  const showCodes = () => dispatch({ action: 'showCodes' });
  const showActivation = () => dispatch({ action: 'showActivation' });
  const goToLayer = (layer: 'activation'|'menu'|'puzzle'|'demo'|'checkout'|'codes') => {
    switch (layer) {
      case 'menu':
        dispatch({ action: 'setView', view: 'menu' });
        break;
      case 'puzzle':
        dispatch({ action: 'setView', view: 'puzzle' });
        break;
      case 'demo':
        openDemo();
        break;
      case 'checkout':
        openCheckout();
        break;
      case 'codes':
        showCodes();
        break;
      case 'activation':
      default:
        showActivation();
        break;
    }
  };

  return (
    // fixed container so it appears as a side wall; width animates between small tab and full nav
    <div className={`fixed left-0 top-0 h-screen z-50 flex items-start transition-all duration-300 ${open ? 'w-56' : 'w-12'}`}>
      {/* Main nav panel */}
      <aside className={`h-full bg-white border-r border-gray-100 p-3 flex flex-col ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ width: 224 }}>
        <div className="text-sm font-semibold mb-2 text-gray-700">Navigation</div>
        <button onClick={() => { try { (window as any).setPuzView && (window as any).setPuzView('page1'); } catch {} }} className="text-left px-3 py-2 rounded-md hover:bg-gray-100">Page 1</button>
        <button onClick={() => { try { (window as any).setPuzView && (window as any).setPuzView('page2'); } catch {} }} className="text-left px-3 py-2 rounded-md hover:bg-gray-100">Page 2</button>
        <button onClick={() => { try { (window as any).setPuzView && (window as any).setPuzView('testgame'); } catch {} }} className="text-left px-3 py-2 rounded-md hover:bg-gray-100">Test Game</button>
        <div className="h-px my-2 bg-gray-100" />
        <button onClick={() => goToLayer('menu')} className="text-left px-3 py-2 rounded-md hover:bg-gray-100">Menu</button>
        <button onClick={() => goToLayer('puzzle')} className="text-left px-3 py-2 rounded-md hover:bg-gray-100">Open Puzzle</button>
        <button onClick={() => goToLayer('demo')} className="text-left px-3 py-2 rounded-md hover:bg-gray-100">Demo</button>
        <button onClick={() => goToLayer('checkout')} className="text-left px-3 py-2 rounded-md hover:bg-gray-100">Checkout</button>
        <button onClick={() => goToLayer('codes')} className="text-left px-3 py-2 rounded-md hover:bg-gray-100">Codes</button>
        <button onClick={() => goToLayer('activation')} className="text-left px-3 py-2 rounded-md hover:bg-gray-100">Activation</button>
      </aside>

      {/* Half-circle tab: visible when collapsed; sits halfway outside the window */}
      <div className="flex items-center" style={{ width: open ? 0 : 48 }}>
        <button
          onClick={() => setOpen((s) => !s)}
          aria-label="Open navigation"
          className="-ml-6 w-12 h-12 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center"
          style={{ transform: 'translateX(-50%)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
            {open ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SideNav;

import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const MiddleScroller: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div className="w-full max-w-4xl mx-auto p-4">
        <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}`}</style>
        <div className="hide-scrollbar overflow-y-auto" style={{ maxHeight: '76vh', padding: '8px 4px' }}>
          <div className="flex flex-col gap-6 items-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiddleScroller;

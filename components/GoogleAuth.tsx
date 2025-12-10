import React from 'react';

// GoogleAuth has been removed from the app. This component is a no-op replacement
// kept to avoid accidental imports and runtime errors.
export const GoogleAuth: React.FC<{ onAuthenticated?: (any: unknown) => void }> = () => {
  return null;
};

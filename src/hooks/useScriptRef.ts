import { useEffect, useRef } from 'react';

// ==============================|| ELEMENT REFERENCE HOOKS ||============================== //

export default function useScriptRef() {
  const scripted = useRef(false);

  useEffect(() => {
    scripted.current = true;

    return () => {
      scripted.current = false;
    };
  }, []);

  return scripted;
}

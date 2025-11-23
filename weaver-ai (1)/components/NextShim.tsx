import React, { createContext, useContext, useState, useEffect } from 'react';

// --- ROUTER CONTEXT ---
const RouterContext = createContext<any>(null);

export const RouterShimProvider = ({ children }: any) => {
  // Default to Root ('/') so the Auth logic determines where to go.
  const [path, setPath] = useState('/'); 
  
  // Simple history push mock
  const push = (newPath: string) => {
    setPath(newPath);
    try {
        // In sandboxed environments (iframe/blob), pushState might fail due to security restrictions.
        // We wrap it to ensure the app navigation (setPath) works even if the URL bar doesn't update.
        window.history.pushState({}, '', newPath);
    } catch (e) {
        console.debug("Navigation URL update skipped in preview environment");
    }
  };

  return (
    <RouterContext.Provider value={{ path, push }}>
      {children}
    </RouterContext.Provider>
  );
};

// --- HOOKS ---
export const useRouter = () => {
  const context = useContext(RouterContext);
  return { push: context.push };
};

export const usePathname = () => {
  const context = useContext(RouterContext);
  return context.path;
};

// --- COMPONENT: LINK ---
export const Link = ({ href, children, className }: any) => {
  const { push } = useRouter();
  return (
    <a 
      href={href} 
      onClick={(e) => { e.preventDefault(); push(href); }} 
      className={className}
    >
      {children}
    </a>
  );
};

// --- COMPONENT: IMAGE (Mock) ---
export const Image = ({ src, alt, className, width, height }: any) => {
    return <img src={src} alt={alt} className={className} style={{ width, height }} />;
};
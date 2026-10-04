import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext({
  path: '/',
  params: {},
  queryParams: {},
  navigate: () => {}
});

export function useRouter() {
  return useContext(RouterContext);
}

// Chuyển hash thành path, params và queryParams
function parseHash(hashString) {
  let clean = hashString.replace(/^#\/?/, '/');
  if (!clean.startsWith('/')) clean = '/' + clean;

  const [pathPart, queryPart] = clean.split('?');
  const queryParams = {};
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    for (const [k, v] of searchParams.entries()) {
      queryParams[k] = v;
    }
  }

  // Tách các phân đoạn path
  const segments = pathPart.split('/').filter(Boolean);

  return {
    fullPath: pathPart,
    segments,
    queryParams
  };
}

export function RouterProvider({ children }) {
  const [currentHash, setCurrentHash] = useState(() => window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (to) => {
    const targetHash = to.startsWith('#') ? to : '#' + (to.startsWith('/') ? to : '/' + to);
    if (window.location.hash === targetHash) {
      window.scrollTo(0, 0);
    } else {
      window.location.hash = targetHash;
    }
  };

  const parsed = parseHash(currentHash);

  // Phân tích pattern khớp đường dẫn
  const path = parsed.fullPath;
  const segments = parsed.segments;
  const params = {};

  // Khớp các đường dẫn động phổ biến:
  // /movie/:id
  // /cinema/:id
  // /showtime/:id/seat
  // /booking/:id
  // /ticket/:id
  if (segments[0] === 'movie' && segments[1]) {
    params.id = segments[1];
  } else if (segments[0] === 'cinema' && segments[1]) {
    params.id = segments[1];
  } else if (segments[0] === 'showtime' && segments[1] && segments[2] === 'seat') {
    params.id = segments[1];
  } else if (segments[0] === 'booking' && segments[1]) {
    params.id = segments[1];
  } else if (segments[0] === 'ticket' && segments[1]) {
    params.id = segments[1];
  }

  return (
    <RouterContext.Provider value={{ path, segments, params, queryParams: parsed.queryParams, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

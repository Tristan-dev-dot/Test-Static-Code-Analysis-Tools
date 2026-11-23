import { useEffect, useState } from 'react';
import { routes } from '../domain/catalog.js';
import { hydrateFindings, serializeFindings, storageKey } from '../domain/storage.js';

export function readRoute(hash) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const requested = params.get('page');
  const page = Object.hasOwn(routes, requested) ? requested : 'overview';

  return {
    page,
    scanner: page === 'findings' ? params.get('scanner') ?? '' : '',
  };
}

export function routeHref(page, scanner) {
  const params = new URLSearchParams({ page });
  if (page === 'findings' && scanner) params.set('scanner', scanner);
  return '#' + params.toString();
}

export function useRoute() {
  const [route, setRoute] = useState(() => readRoute(window.location.hash));

  useEffect(() => {
    const update = () => setRoute(readRoute(window.location.hash));
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  return route;
}

export function useWorkspace() {
  const [findings, setFindings] = useState(() => {
    try {
      return hydrateFindings(window.localStorage.getItem(storageKey));
    } catch {
      return hydrateFindings(null);
    }
  });
  const [storageProblem, setStorageProblem] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, serializeFindings(findings));
      setStorageProblem(false);
    } catch {
      setStorageProblem(true);
    }
  }, [findings]);

  return { findings, setFindings, storageProblem };
}

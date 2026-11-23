import { useEffect } from 'react';
import { Layout } from './components/Layout.jsx';
import { routes } from './domain/catalog.js';
import { useRoute, useWorkspace } from './hooks/useWorkspace.js';
import { Comparison } from './pages/Comparison.jsx';
import { Findings } from './pages/Findings.jsx';
import { Guide } from './pages/Guide.jsx';
import { Overview } from './pages/Overview.jsx';

export function App() {
  const route = useRoute();
  const workspace = useWorkspace();
  const { page, scanner } = route;

  useEffect(() => {
    document.title = routes[page].label + ' · Scanboard';
    window.scrollTo(0, 0);
  }, [page]);

  let content;

  switch (page) {
    case 'findings':
      content = <Findings key={scanner} initialScanner={scanner} {...workspace} />;
      break;
    case 'comparison':
      content = <Comparison findings={workspace.findings} />;
      break;
    case 'guide':
      content = <Guide />;
      break;
    default:
      content = <Overview findings={workspace.findings} />;
  }

  return <Layout page={page}>{content}</Layout>;
}

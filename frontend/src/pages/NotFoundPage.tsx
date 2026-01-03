import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Pagina non trovata</h1>
      <p>La pagina che stai cercando non esiste.</p>
      <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
        Torna alla home
      </Link>
    </div>
  );
}


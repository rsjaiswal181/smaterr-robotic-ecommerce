import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const NotFoundPage = () => (
  <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
    <p className="font-display text-6xl text-forest">404</p>
    <h1 className="mt-4 font-display text-2xl text-ink">Page not found</h1>
    <p className="mt-2 text-sm text-ink/60">The page you're looking for doesn't exist or has moved.</p>
    <Link to="/"><Button className="mt-6">Back to home</Button></Link>
  </div>
);

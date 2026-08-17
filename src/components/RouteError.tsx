import { AlertTriangle } from 'lucide-react';
import { Link, useRouteError } from 'react-router';

import { Button } from '@/components/ui/button';

/**
 * Route-level fallback so an unexpected render error (e.g. a malformed API
 * shape) is contained to the affected route instead of blanking the whole app.
 */
export function RouteError() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : 'Something went wrong.';

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle className="size-8 text-destructive" aria-hidden />
      <h1 className="text-lg font-semibold">This page hit a snag</h1>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button asChild variant="outline">
        <Link to="/">Back to devices</Link>
      </Button>
    </div>
  );
}

<?php

namespace Letterbook\Letterbook\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class AuthorizeLetterbookAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $gate = config('letterbook.gate');

        if ($gate === null) {
            return $next($request);
        }

        if (is_string($gate) && Gate::has($gate)) {
            abort_unless(Gate::allows($gate), 403);
        } elseif ($gate instanceof Closure) {
            abort_unless($gate($request), 403);
        }

        return $next($request);
    }
}

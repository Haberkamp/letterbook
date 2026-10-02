<?php

namespace Letterbook\Letterbook\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class SetLetterbookRootView
{
    public function handle(Request $request, Closure $next): Response
    {
        Inertia::setRootView('letterbook::app');

        return $next($request);
    }
}

<?php

namespace Letterbook\Letterbook;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Letterbook\Letterbook\Http\Middleware\SetLetterbookRootView;
use Letterbook\Letterbook\Support\Letterbook;
use Letterbook\Letterbook\Support\StoryRegistry;

class LetterbookServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/letterbook.php', 'letterbook');

        $this->app->singleton(StoryRegistry::class);
        $this->app->singleton(Letterbook::class);
    }

    public function boot(): void
    {
        $this->registerStories();
        $this->registerRoutes();
        $this->configureInertia();

        $this->loadViewsFrom(__DIR__.'/../resources/views', 'letterbook');

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../config/letterbook.php' => config_path('letterbook.php'),
            ], 'letterbook-config');

            $this->publishes([
                __DIR__.'/../public/build' => public_path('vendor/letterbook'),
            ], 'letterbook-assets');
        }
    }

    private function registerStories(): void
    {
        $registry = $this->app->make(StoryRegistry::class);

        $stories = config('letterbook.stories');

        if (is_string($stories)) {
            if (is_dir($stories)) {
                $registry->registerDirectory($stories);
            } else {
                $registry->registerFile($stories);
            }
        }
    }

    private function registerRoutes(): void
    {
        Route::middleware($this->gateMiddleware())
            ->group(__DIR__.'/../routes/web.php');
    }

    /**
     * @return array<int, string|\Closure>
     */
    private function gateMiddleware(): array
    {
        $middleware = array_merge(
            config('letterbook.middleware', ['web']),
            [SetLetterbookRootView::class],
        );

        $gate = config('letterbook.gate');

        if ($gate) {
            $middleware[] = function ($request, $next) use ($gate) {
                if (is_string($gate) && Gate::has($gate)) {
                    abort_unless(Gate::allows($gate), 403);
                } elseif ($gate instanceof \Closure) {
                    abort_unless($gate($request), 403);
                }

                return $next($request);
            };
        }

        return $middleware;
    }

    private function configureInertia(): void
    {
        $pagePath = realpath(__DIR__.'/../resources/js/letterbook/Pages') ?: __DIR__.'/../resources/js/letterbook/Pages';
        $paths = config('inertia.pages.paths', []);

        if (! in_array($pagePath, $paths, true)) {
            config()->set('inertia.pages.paths', [
                ...$paths,
                $pagePath,
            ]);
        }
    }
}

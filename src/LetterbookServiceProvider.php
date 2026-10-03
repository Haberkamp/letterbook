<?php

namespace Letterbook\Letterbook;

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
        Route::middleware($this->middleware())
            ->group(__DIR__.'/../routes/web.php');
    }

    /**
     * @return array<int, string>
     */
    private function middleware(): array
    {
        return [
            ...config('letterbook.middleware', ['web']),
            SetLetterbookRootView::class,
            AuthorizeLetterbookAccess::class,
        ];
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

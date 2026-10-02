<?php

namespace Letterbook\Letterbook\Tests;

use Orchestra\Testbench\TestCase as Orchestra;

abstract class TestCase extends Orchestra
{
    protected function getPackageProviders($app): array
    {
        return [
            \Inertia\ServiceProvider::class,
            \Letterbook\Letterbook\LetterbookServiceProvider::class,
        ];
    }

    protected function defineEnvironment($app): void
    {
        $app['config']->set('letterbook.stories', null);

        // Point Laravel's public_path() to the package's own public/ directory
        // so Vite can resolve the committed build manifest during tests and
        // so Pest Browser can serve the compiled assets.
        $app->usePublicPath(realpath(__DIR__.'/../public'));
    }
}

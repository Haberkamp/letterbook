<?php

use Illuminate\Support\Facades\Route;
use Letterbook\Letterbook\Http\Controllers\LetterbookController;

$middleware = config('letterbook.middleware', ['web']);

Route::middleware($middleware)
    ->prefix(config('letterbook.path', 'letterbook'))
    ->name('letterbook.')
    ->group(function (): void {
        Route::get('/', [LetterbookController::class, 'index'])->name('index');
        Route::get('/{slug}', [LetterbookController::class, 'show'])->name('show');
        Route::post('/{slug}/send', [LetterbookController::class, 'send'])->name('send');
    });

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    @php
        $letterbookVite = (clone app(Illuminate\Foundation\Vite::class))
            ->useHotFile(public_path('vendor/letterbook/hot'))
            ->useBuildDirectory('vendor/letterbook');
    @endphp

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{ $letterbookVite->fonts() }}
        {{ $letterbookVite('resources/css/letterbook.css', 'vendor/letterbook') }}
        {{ $letterbookVite('resources/js/letterbook/app.tsx', 'vendor/letterbook') }}
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
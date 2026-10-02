<?php

namespace Letterbook\Letterbook\Support\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @method static \Letterbook\Letterbook\Support\Story story(string $title, \Closure $mailable, ?string $group = null)
 *
 * @see \Letterbook\Letterbook\Support\Letterbook
 */
class Letterbook extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return \Letterbook\Letterbook\Support\Letterbook::class;
    }
}

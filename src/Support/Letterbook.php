<?php

namespace Letterbook\Letterbook\Support;

use Closure;
use Illuminate\Mail\Mailable;

/**
 * Fluent API for registering email stories.
 */
class Letterbook
{
    public function __construct(
        protected readonly StoryRegistry $registry,
    ) {}

    /**
     * Register an email story.
     *
     * @param  Closure(): Mailable  $mailable
     */
    public function story(string $title, Closure $mailable, ?string $group = null): Story
    {
        return $this->registry->add($title, $mailable, $group);
    }

    /**
     * Register a single story file to be loaded lazily.
     */
    public function stories(string $path): void
    {
        $this->registry->registerFile($path);
    }

    /**
     * Register every PHP file in a directory as story files.
     */
    public function storiesIn(string $path): void
    {
        $this->registry->registerDirectory($path);
    }
}

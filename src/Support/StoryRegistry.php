<?php

namespace Letterbook\Letterbook\Support;

use Closure;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Collection;

class StoryRegistry
{
    /**
     * @var array<string, Story>
     */
    protected array $stories = [];

    /**
     * @var array<int, string>
     */
    protected array $files = [];

    protected bool $filesLoaded = false;

    public function __construct(
        protected ?string $storiesPath = null,
    ) {}

    /**
     * Register an email story.
     *
     * @param  Closure(): Mailable  $mailable
     */
    public function add(string $title, Closure $mailable, ?string $group = null): Story
    {
        $story = new Story($title, $mailable, $group);

        $this->stories[$story->slug()] = $story;

        return $story;
    }

    /**
     * Register a story file to be loaded lazily.
     */
    public function registerFile(string $path): void
    {
        if (! in_array($path, $this->files, true)) {
            $this->files[] = $path;
        }
    }

    /**
     * Register every PHP file in a directory as a story file.
     */
    public function registerDirectory(string $path): void
    {
        if (! is_dir($path)) {
            return;
        }

        foreach (glob($path.'/*.php') ?: [] as $file) {
            $this->registerFile($file);
        }
    }

    /**
     * Load all registered story files.
     */
    public function loadFiles(): void
    {
        if ($this->filesLoaded) {
            return;
        }

        $this->filesLoaded = true;

        foreach ($this->files as $file) {
            if (file_exists($file)) {
                require $file;
            }
        }
    }

    /**
     * @return Collection<int, Story>
     */
    public function all(): Collection
    {
        $this->loadFiles();

        return collect($this->stories)
            ->flatMap(fn (Story $story) => [$story, ...$story->variants()])
            ->sortBy(fn (Story $story) => [$story->group ?? '', $story->title])
            ->values();
    }

    public function find(string $slug): ?Story
    {
        return $this->all()->first(fn (Story $story) => $story->slug() === $slug);
    }

    /**
     * @return array<int, array{slug: string, title: string, group: ?string, description: ?string}>
     */
    public function toArray(): array
    {
        return $this->all()
            ->map(fn (Story $story) => [
                'slug' => $story->slug(),
                'title' => $story->title,
                'group' => $story->group,
                'description' => $story->description,
                'depth' => $story->depth(),
            ])
            ->all();
    }

    public function reset(): void
    {
        $this->stories = [];
        $this->files = [];
        $this->filesLoaded = false;
    }
}

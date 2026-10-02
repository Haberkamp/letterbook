<?php

namespace Letterbook\Letterbook\Support;

use Closure;
use Illuminate\Container\Container;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Str;
use ReflectionMethod;

class Story
{
    public ?string $description = null;

    /**
     * @var array<int, Story>
     */
    protected array $variants = [];

    public function __construct(
        public readonly string $title,
        protected readonly Closure $mailable,
        public readonly ?string $group = null,
        public readonly ?Story $parent = null,
    ) {}

    /**
     * Add a nested variant of this story.
     */
    public function variant(string $title, Closure $mailable): static
    {
        $variant = new self($title, $mailable, $this->group, $this);
        $variant->description = $this->description;

        $this->variants[] = $variant;

        return $variant;
    }

    /**
     * @return array<int, Story>
     */
    public function variants(): array
    {
        return $this->variants;
    }

    public function description(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function slug(): string
    {
        $prefix = $this->parent
            ? $this->parent->slug().'-'
            : '';

        return $prefix.Str::slug(($this->group ? $this->group.'-' : '').$this->title);
    }

    public function depth(): int
    {
        return $this->parent ? $this->parent->depth() + 1 : 0;
    }

    /**
     * Resolve the story to a rendered mailable instance.
     */
    public function resolve(): Mailable
    {
        $mailable = call_user_func($this->mailable);

        if (! $mailable instanceof Mailable) {
            throw new \InvalidArgumentException("Letterbook story [{$this->title}] must return an instance of ".Mailable::class.', got '.get_debug_type($mailable).'.');
        }

        return $mailable;
    }

    /**
     * Render the story to HTML and text.
     */
    public function render(): RenderedEmail
    {
        $mailable = $this->resolve();

        $mailer = Container::getInstance()->make('mailer');
        $html = $mailable->render();

        $view = $this->buildView($mailable);
        $text = '';

        if (is_array($view) && isset($view['text'])) {
            $text = $mailer->render($view['text'], $mailable->buildViewData());
        }

        return new RenderedEmail(
            html: $html,
            text: $text,
            subject: $mailable->envelope()->subject ?? $mailable->subject ?? Str::headline($this->title),
        );
    }

    /**
     * Build the mailable's view definition without triggering delivery.
     *
     * @return array<string, mixed>|string
     */
    protected function buildView(Mailable $mailable): array|string
    {
        $reflection = new ReflectionMethod($mailable, 'buildView');

        return $reflection->invoke($mailable);
    }
}

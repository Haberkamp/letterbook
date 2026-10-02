<?php

namespace Letterbook\Letterbook\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Letterbook\Letterbook\Support\StoryRegistry;

class LetterbookController
{
    public function __construct(
        protected readonly StoryRegistry $registry,
    ) {}

    public function index(?string $slug = null): Response
    {
        $stories = $this->registry->toArray();

        $slug ??= $stories[0]['slug'] ?? null;

        return Inertia::render('Letterbook/Index', [
            'stories' => $stories,
            'slug' => $slug,
            'email' => fn () => $this->renderStory($slug),
        ]);
    }

    public function show(string $slug): Response
    {
        return $this->index($slug);
    }

    public function send(Request $request, string $slug): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $story = $this->registry->find($slug);

        abort_if($story === null, 404, "Letterbook story [{$slug}] not found.");

        Mail::to($validated['email'])->send($story->resolve());

        return back()->with('success', "Email sent to {$validated['email']}.");
    }

    /**
     * @return array{html: string, text: string, subject: string}
     */
    protected function renderStory(?string $slug): array
    {
        $story = $slug ? $this->registry->find($slug) : null;

        if (! $story) {
            return ['html' => '', 'text' => '', 'subject' => ''];
        }

        $rendered = $story->render();

        return [
            'html' => $rendered->html,
            'text' => $rendered->text,
            'subject' => $rendered->subject,
        ];
    }
}

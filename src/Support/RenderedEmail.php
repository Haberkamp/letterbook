<?php

namespace Letterbook\Letterbook\Support;

class RenderedEmail
{
    public function __construct(
        public readonly string $html,
        public readonly string $text,
        public readonly string $subject,
    ) {}
}

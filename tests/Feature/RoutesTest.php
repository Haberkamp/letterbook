<?php

it('renders the letterbook index page', function () {
    $response = $this->get('/letterbook');

    $response->assertOk();

    $page = $response->original->getData()['page'];

    expect($page['component'])->toBe('Letterbook/Index');

    $response->assertSee('"component":"Letterbook\/Index', false);
    expect($response->getContent())->toContain('data-page');
});

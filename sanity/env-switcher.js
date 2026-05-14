(function () {
    function setupSanityEnvBar() {
        const bar = document.getElementById('sanityEnvBar');

        if (!bar) {
            return;
        }

        const current = typeof env === 'undefined' ? '' : env;

        bar.querySelectorAll('button[data-sanity-env]').forEach((el) => {
            const key = el.getAttribute('data-sanity-env');
            const isActive = key === current;

            el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            el.classList.toggle('sanity-env-active', isActive);
        });

        bar.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-sanity-env]');

            if (!btn) {
                return;
            }

            if (btn.getAttribute('data-sanity-env') === current) {
                return;
            }

            const next = btn.getAttribute('data-sanity-env');

            try {
                sessionStorage.setItem('sanityEnv', next);
            } catch (err) {
                /* ignore quota / private mode */
            }

            const url = new URL(window.location.href);

            url.searchParams.delete('env');
            window.location.assign(url.pathname + url.search + url.hash);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSanityEnvBar);
    } else {
        setupSanityEnvBar();
    }
})();

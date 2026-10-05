(function () {
    function setupCfEnvBar() {
        const bar = document.getElementById('cfEnvBar');

        if (!bar) {
            return;
        }

        const current = typeof env === 'undefined' ? '' : env;

        bar.querySelectorAll('button[data-cf-env]').forEach((el) => {
            const key = el.getAttribute('data-cf-env');
            const isActive = key === current;

            el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            el.classList.toggle('cf-env-active', isActive);
        });

        bar.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-cf-env]');

            if (!btn) {
                return;
            }

            if (btn.getAttribute('data-cf-env') === current) {
                return;
            }

            const next = btn.getAttribute('data-cf-env');

            try {
                sessionStorage.setItem('cfEnv', next);
            } catch (err) {
                /* ignore quota / private mode */
            }

            const url = new URL(window.location.href);

            url.searchParams.delete('env');
            window.location.assign(url.pathname + url.search + url.hash);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupCfEnvBar);
    } else {
        setupCfEnvBar();
    }
})();

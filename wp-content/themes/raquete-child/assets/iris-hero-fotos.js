(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function init(root) {
    var figures = Array.prototype.slice.call(root.querySelectorAll(':scope > figure'));
    if (figures.length < 2) return;

    var btnPrev = root.querySelector('[data-rq-foto="prev"]');
    var btnPause = root.querySelector('[data-rq-foto="pause"]');
    var btnNext = root.querySelector('[data-rq-foto="next"]');
    if (!btnPrev || !btnPause || !btnNext) return;

    var index = 0;
    var activeAt = figures.findIndex(function (fig) {
      return fig.classList.contains('is-active');
    });
    if (activeAt >= 0) index = activeAt;

    function visibleIndex() {
      var best = index;
      var bestOp = -1;
      figures.forEach(function (fig, i) {
        var op = parseFloat(window.getComputedStyle(fig).opacity);
        if (isNaN(op)) op = 0;
        if (op > bestOp) {
          bestOp = op;
          best = i;
        }
      });
      return best;
    }

    function setActive(i) {
      index = ((i % figures.length) + figures.length) % figures.length;
      figures.forEach(function (fig, n) {
        fig.classList.toggle('is-active', n === index);
      });
    }

    function syncActiveFromVisibility() {
      setActive(visibleIndex());
    }

    function enterManual(i) {
      setActive(i);
      root.classList.add('is-paused');
      btnPause.setAttribute('aria-pressed', 'true');
      btnPause.textContent = 'Retomar';
    }

    function resumeAuto() {
      // Confirma .is-active na foto que estava/está visível.
      syncActiveFromVisibility();
      root.classList.remove('is-paused');
      btnPause.setAttribute('aria-pressed', 'false');
      btnPause.textContent = 'Pausar';
      // Reinicia a animação alinhada à foto ativa (0 → delays padrão; 1 → invertidos).
      figures.forEach(function (fig, n) {
        fig.style.animation = 'none';
        if (index === 0) {
          fig.style.animationDelay = n === 1 ? '-6s' : '0s';
        } else {
          fig.style.animationDelay = n === index ? '0s' : '-6s';
        }
      });
      void root.offsetWidth;
      figures.forEach(function (fig) {
        fig.style.animation = '';
        // keep delay so restart matches active photo
      });
      // After restart, keep delays via style for alignment; clear on next full cycle sync if needed.
      // Re-apply animation name/duration from stylesheet while preserving delay:
      figures.forEach(function (fig, n) {
        var delay = (index === 0)
          ? (n === 1 ? '-6s' : '0s')
          : (n === index ? '0s' : '-6s');
        fig.style.animation = '';
        fig.style.animationDelay = delay;
      });
    }

    // Durante o ciclo automático, mantém .is-active na foto mais visível
    // (preserva a correta ao entrar com mouse/teclado antes de qualquer clique).
    var syncTimer = window.setInterval(function () {
      if (root.classList.contains('is-paused')) return;
      syncActiveFromVisibility();
    }, 200);

    root.addEventListener('mouseenter', syncActiveFromVisibility);
    root.addEventListener('focusin', syncActiveFromVisibility);

    btnPause.addEventListener('click', function () {
      if (root.classList.contains('is-paused')) {
        resumeAuto();
      } else {
        enterManual(visibleIndex());
      }
    });

    btnPrev.addEventListener('click', function () {
      var i = root.classList.contains('is-paused') ? index - 1 : visibleIndex() - 1;
      enterManual(i);
    });

    btnNext.addEventListener('click', function () {
      var i = root.classList.contains('is-paused') ? index + 1 : visibleIndex() + 1;
      enterManual(i);
    });

    // Garante estado inicial.
    setActive(index);
  }

  function boot() {
    document.querySelectorAll('.rq-hero-fotos').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

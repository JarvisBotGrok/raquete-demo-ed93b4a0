(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function init(root) {
    var figures = Array.prototype.slice.call(root.querySelectorAll('figure'));
    if (figures.length < 2) return;

    var btnPrev = root.querySelector('[data-rq-foto="prev"]');
    var btnPause = root.querySelector('[data-rq-foto="pause"]');
    var btnNext = root.querySelector('[data-rq-foto="next"]');
    if (!btnPrev || !btnPause || !btnNext) return;

    var index = 0;

    function visibleIndex() {
      var best = 0;
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

    function enterManual(i) {
      index = ((i % figures.length) + figures.length) % figures.length;
      root.classList.add('is-paused');
      figures.forEach(function (fig, n) {
        fig.classList.toggle('is-active', n === index);
      });
      btnPause.setAttribute('aria-pressed', 'true');
      btnPause.textContent = 'Retomar';
    }

    function resumeAuto() {
      root.classList.remove('is-paused');
      figures.forEach(function (fig) {
        fig.classList.remove('is-active');
      });
      btnPause.setAttribute('aria-pressed', 'false');
      btnPause.textContent = 'Pausar';
      // Reinicia a animação CSS do zero.
      figures.forEach(function (fig) {
        fig.style.animation = 'none';
      });
      // force reflow
      void root.offsetWidth;
      figures.forEach(function (fig) {
        fig.style.animation = '';
      });
    }

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

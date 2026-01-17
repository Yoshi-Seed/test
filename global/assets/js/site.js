(function () {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Active link highlighting (root-relative)
  const path = window.location.pathname.replace(/\/+$/, '/');
  const links = document.querySelectorAll('.sp-nav a');
  links.forEach((a) => {
    try {
      const url = new URL(a.href);
      const hrefPath = url.pathname.replace(/\/+$/, '/');
      if (hrefPath === path) {
        a.setAttribute('aria-current', 'page');
      }
    } catch (_) {}
  });
})();

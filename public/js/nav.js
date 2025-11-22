// public/js/nav.js
document.addEventListener('DOMContentLoaded', function () {
  try {
    const toggler = document.querySelector('.navbar-toggler');
    const collapseEl = document.getElementById('mainNav');

    console.log('nav.js: toggler?', !!toggler, 'collapse?', !!collapseEl, 'bootstrap?', typeof bootstrap !== 'undefined');

    if (!toggler || !collapseEl) return;

    if (typeof bootstrap === 'undefined') {
      console.error('nav.js: bootstrap missing');
      return;
    }

    const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false });

    toggler.addEventListener('click', function (e) {
      e.preventDefault();
      bsCollapse.toggle();
    });
  } catch (err) {
    console.error('nav.js error:', err && err.message);
  }
});

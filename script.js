document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

  function setActiveNav(id) {
    navItems.forEach((item) => {
      if (item.getAttribute('href') === `#${id}`) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Reveal on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('section, footer').forEach((s) => observer.observe(s));

  // Trigger hero on load
  const hero = document.querySelector('#hero');
  if (hero) {
    hero.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
  }

  // Update active nav on scroll
  const sections = document.querySelectorAll('section');
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setActiveNav(e.target.id);
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => navObserver.observe(s));

  // Handle nav clicks
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('href').replace('#', '');
      setActiveNav(targetId);
    });
  });
});

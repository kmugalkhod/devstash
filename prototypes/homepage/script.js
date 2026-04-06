document.addEventListener('DOMContentLoaded', () => {
  // Current Year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Scroll Animations (Intersection Observer)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in-up').forEach(el => {
    observer.observe(el);
  });

  // Trigger initial fade in for elements at the top immediately
  setTimeout(() => {
    document.querySelectorAll('.fade-in-up').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight) {
        el.classList.add('in-view');
        observer.unobserve(el);
      }
    });
  }, 100);

  // Navbar behavior on scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Pricing Toggle Logic
  const pricingSwitch = document.getElementById('pricingSwitch');
  const proPrice = document.getElementById('proPrice');
  
  if (pricingSwitch && proPrice) {
    pricingSwitch.addEventListener('change', (e) => {
      if (e.target.checked) {
        proPrice.textContent = '$72';
        proPrice.nextElementSibling.textContent = '/yr';
      } else {
        proPrice.textContent = '$8';
        proPrice.nextElementSibling.textContent = '/mo';
      }
    });
  }

  // Mouse Glow effect for Bento Cards (Aceternity style)
  const bentoItems = document.querySelectorAll('.bento-item, .price-card');
  bentoItems.forEach(item => {
    item.addEventListener('mousemove', e => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update custom properties for radial gradient cursor tracking if needed
      // Aceternity usually does a shiny border or inner shadow tracking
      item.style.setProperty('--mouse-x', `${x}px`);
      item.style.setProperty('--mouse-y', `${y}px`);
    });

    item.addEventListener('mouseleave', () => {
      item.style.setProperty('--mouse-x', '50%');
      item.style.setProperty('--mouse-y', '50%');
    });
  });

  const dashboardWrapper = document.querySelector('.dashboard-wrapper');
  if (dashboardWrapper) {
    dashboardWrapper.addEventListener('mousemove', e => {
      const rect = dashboardWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      dashboardWrapper.style.setProperty('--image-mouse-x', `${x}px`);
      dashboardWrapper.style.setProperty('--image-mouse-y', `${y}px`);
    });

    dashboardWrapper.addEventListener('mouseleave', () => {
      dashboardWrapper.style.setProperty('--image-mouse-x', '50%');
      dashboardWrapper.style.setProperty('--image-mouse-y', '50%');
    });
  }
});

/**
 * ACCESS DIGITAL SOLUTIONS ARENA (ADSA) - INTERACTIVE ENGINE
 * Governs:
 * - Cinematic Loader & Sequence Sequence
 * - Sticky Intelligent Navigation Controls
 * - Scroll Reveal Choreography (IntersectionObserver)
 * - Interactive ADSA Solution Path™ State Manager
 * - Accessibility Safeguards & Performance Tweaks
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Cinematic Entrance Loader Sequence
  const loader = document.getElementById('cinematic-loader');
  const loaderBar = document.querySelector('.loader-bar');

  if (loader && loaderBar) {
    // Animate loader bar progress
    setTimeout(() => {
      loaderBar.style.width = '100%';
    }, 100);

    // Fade out screen after progress completes
    setTimeout(() => {
      loader.classList.add('fade-out');
    }, 1300);
  }

  // 2. Intelligent Header Scroll Behavior
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // 3. Scroll Reveal Choreography (IntersectionObserver)
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  const observerOptions = {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // 4. ADSA Solution Path™ Interactive Tab Controller
  const stepButtons = document.querySelectorAll('.path-step-btn');
  const panels = document.querySelectorAll('.path-panel');

  stepButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetStep = button.getAttribute('data-step');

      // Update active nav state
      stepButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');

      // Transition panels
      panels.forEach((panel, index) => {
        if (index === parseInt(targetStep, 10)) {
          panel.removeAttribute('hidden');
          panel.classList.add('active');
        } else {
          panel.setAttribute('hidden', 'true');
          panel.classList.remove('active');
        }
      });
    });
  });

  // 5. Accessible Mobile Navigation Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navList = document.querySelector('.nav-list');

  if (mobileToggle && navList) {
    mobileToggle.addEventListener('click', () => {
      const expanded = mobileToggle.getAttribute('aria-expanded') === 'true' || false;
      mobileToggle.setAttribute('aria-expanded', !expanded);
      
      if (!expanded) {
        navList.style.display = 'flex';
        navList.style.flexDirection = 'column';
        navList.style.position = 'absolute';
        navList.style.top = '100%';
        navList.style.left = '0';
        navList.style.width = '100%';
        navList.style.background = '#FFFFFF';
        navList.style.padding = '1.5rem';
        navList.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
      } else {
        navList.style.display = '';
      }
    });
  }
});
  

(function () {
  "use strict";

  const body = document.body;
  const root = document.documentElement;
  const header = document.getElementById("siteHeader");
  const backTop = document.getElementById("backTop");
  const menuToggle = document.getElementById("menuToggle");
  const drawer = document.getElementById("mobileDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const drawerClose = document.getElementById("drawerClose");
  const searchPopup = document.getElementById("searchPopup");
  const searchClose = document.getElementById("searchClose");
  const searchTriggers = document.querySelectorAll(".search-open");
  const searchInput = searchPopup ? searchPopup.querySelector("input[type='search']") : null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let lastFocusedElement = null;
  let lockedScrollY = 0;

  if (drawer && !drawer.classList.contains("open")) drawer.inert = true;

  function lockScroll() {
    if (body.dataset.scrollLocked === "true") return;
    lockedScrollY = window.scrollY;
    body.dataset.scrollLocked = "true";
    body.style.position = "fixed";
    body.style.top = "-" + lockedScrollY + "px";
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
  }

  function unlockScroll() {
    if (body.dataset.scrollLocked !== "true") return;
    body.dataset.scrollLocked = "false";
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflow = "";
    window.scrollTo(0, lockedScrollY);
  }

  function openDrawer() {
    if (!drawer || !drawerBackdrop) return;
    closeSearch(false);
    lastFocusedElement = document.activeElement;
    drawer.inert = false;
    drawer.classList.add("open");
    drawerBackdrop.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
    lockScroll();
    if (drawerClose) drawerClose.focus({ preventScroll: true });
  }

  function closeDrawer(restoreFocus) {
    if (!drawer || !drawerBackdrop) return;
    drawer.classList.remove("open");
    drawerBackdrop.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    drawer.inert = true;
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    unlockScroll();
    if (restoreFocus !== false && lastFocusedElement) {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  function openSearch(trigger) {
    if (!searchPopup) return;
    closeDrawer(false);
    lastFocusedElement = trigger || document.activeElement;
    searchPopup.classList.add("open");
    searchPopup.setAttribute("aria-hidden", "false");
    lockScroll();
    window.setTimeout(function () {
      if (searchInput) searchInput.focus({ preventScroll: true });
    }, 80);
  }

  function closeSearch(restoreFocus) {
    if (!searchPopup || !searchPopup.classList.contains("open")) return;
    searchPopup.classList.remove("open");
    searchPopup.setAttribute("aria-hidden", "true");
    unlockScroll();
    if (restoreFocus !== false && lastFocusedElement) {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  let ticking = false;

  function updateScrollState() {
    const scrollY = window.scrollY;
    if (header) header.classList.toggle("scrolled", scrollY > 30);
    if (backTop) backTop.classList.toggle("show", scrollY > 600);
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollState);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", updateScrollState);
  updateScrollState();

  if (menuToggle) menuToggle.addEventListener("click", openDrawer);
  if (drawerClose) drawerClose.addEventListener("click", function () { closeDrawer(true); });
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", function () { closeDrawer(true); });
  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { closeDrawer(false); });
    });
  }

  searchTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () { openSearch(trigger); });
  });

  if (searchClose) searchClose.addEventListener("click", function () { closeSearch(true); });
  if (searchPopup) {
    searchPopup.addEventListener("click", function (event) {
      if (event.target === searchPopup) closeSearch(true);
    });
    const searchForm = searchPopup.querySelector(".search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        closeSearch(false);
      });
    }
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (searchPopup && searchPopup.classList.contains("open")) {
      closeSearch(true);
      return;
    }
    if (drawer && drawer.classList.contains("open")) closeDrawer(true);
  });

  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  const accordion = document.getElementById("faqAccordion");
  if (accordion) {
    const items = Array.from(accordion.querySelectorAll(".accordion-item"));
    items.forEach(function (item) {
      const trigger = item.querySelector(".accordion-trigger");
      if (!trigger) return;
      trigger.setAttribute("aria-expanded", item.classList.contains("active") ? "true" : "false");
      trigger.addEventListener("click", function () {
        const willOpen = !item.classList.contains("active");
        items.forEach(function (other) {
          other.classList.remove("active");
          const otherTrigger = other.querySelector(".accordion-trigger");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        });
        if (willOpen) {
          item.classList.add("active");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  const counters = document.querySelectorAll(".counter[data-counter]");
  function runCounter(element) {
    if (element.dataset.counted === "true") return;
    element.dataset.counted = "true";
    const target = Number(element.dataset.counter) || 0;
    if (prefersReducedMotion) {
      element.textContent = String(target);
      return;
    }
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));
      if (progress < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    counters.forEach(function (counter) { counterObserver.observe(counter); });

    const revealElements = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealElements.forEach(function (element) { revealObserver.observe(element); });
  } else {
    counters.forEach(runCounter);
    document.querySelectorAll(".reveal").forEach(function (element) {
      element.classList.add("in-view");
    });
  }

  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const submitButton = contactForm.querySelector("button[type='submit']");
      if (submitButton) submitButton.disabled = true;
      if (formSuccess) formSuccess.classList.add("show");
      contactForm.reset();
      window.setTimeout(function () {
        if (formSuccess) formSuccess.classList.remove("show");
        if (submitButton) submitButton.disabled = false;
      }, 5000);
    });
  }

  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const button = newsletterForm.querySelector("button");
      if (button) {
        const icon = button.querySelector("i");
        const originalClass = icon ? icon.className : "";
        if (icon) icon.className = "fa-solid fa-check";
        button.setAttribute("aria-label", "Subscribed");
        window.setTimeout(function () {
          if (icon) icon.className = originalClass;
          button.setAttribute("aria-label", "Subscribe");
        }, 2600);
      }
      newsletterForm.reset();
    });
  }

  const quickContact = document.createElement("div");
  quickContact.className = "quick-contact";
  quickContact.setAttribute("aria-label", "Quick contact");
  quickContact.innerHTML =
    '<a class="quiz-fab" id="quizFab" href="quiz.html" aria-label="Quiz"><i class="fa-solid fa-clipboard-list"></i><span>Quiz</span></a>' +
    '<a class="quick-contact-btn quick-contact-call" href="tel:+918872401632" aria-label="Call"><i class="fa-solid fa-phone" aria-hidden="true"></i><span>Call</span></a>' +
    '<a class="quick-contact-btn quick-contact-wa" href="https://wa.me/918872401632?text=Hello%20Healmedetox%2C%20I%20would%20like%20to%20know%20more%20about%20your%20nutrition%20programs." target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i><span>WhatsApp</span></a>';
  body.appendChild(quickContact);

  root.classList.add("ready");
})();

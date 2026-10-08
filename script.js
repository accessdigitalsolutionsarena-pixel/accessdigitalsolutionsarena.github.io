/* =========================================================
   ADSA — ACCESS DIGITAL SOLUTIONS ARENA
   Interactive Experience
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       01. ELEMENT REFERENCES
    ===================================================== */

    const header = document.getElementById("site-header");
    const menuToggle = document.getElementById("menu-toggle");
    const navigation = document.getElementById("site-navigation");

    const navLinks = document.querySelectorAll(
        ".main-nav a"
    );

    const revealElements = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right"
    );

    const currentYear = document.getElementById(
        "current-year"
    );


    /* =====================================================
       02. CURRENT YEAR
    ===================================================== */

    if (currentYear) {
        currentYear.textContent =
            new Date().getFullYear();
    }


    /* =====================================================
       03. MOBILE NAVIGATION
    ===================================================== */

    if (menuToggle && navigation) {

        menuToggle.addEventListener("click", () => {

            const isOpen =
                menuToggle.classList.toggle("active");

            navigation.classList.toggle(
                "active",
                isOpen
            );

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
            );
        });


        /* Close menu after navigation */

        navLinks.forEach(link => {

            link.addEventListener("click", () => {

                menuToggle.classList.remove("active");

                navigation.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );
            });

        });


        /* Close when clicking outside */

        document.addEventListener("click", event => {

            const clickedInsideNavigation =
                navigation.contains(event.target);

            const clickedToggle =
                menuToggle.contains(event.target);

            if (
                !clickedInsideNavigation &&
                !clickedToggle &&
                navigation.classList.contains("active")
            ) {

                menuToggle.classList.remove("active");

                navigation.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );
            }
        });


        /* Escape key */

        document.addEventListener("keydown", event => {

            if (
                event.key === "Escape" &&
                navigation.classList.contains("active")
            ) {

                menuToggle.classList.remove("active");

                navigation.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.focus();
            }

        });

    }


    /* =====================================================
       04. HEADER SCROLL STATE
    ===================================================== */

    const updateHeader = () => {

        if (!header) return;

        if (window.scrollY > 30) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }
    };

    updateHeader();

    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );


    /* =====================================================
       05. SCROLL REVEAL
    ===================================================== */

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (
        reducedMotion ||
        !("IntersectionObserver" in window)
    ) {

        revealElements.forEach(element => {
            element.classList.add("is-visible");
        });

    } else {

        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add(
                            "is-visible"
                        );

                        revealObserver.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -60px 0px"
                }
            );


        revealElements.forEach(element => {

            revealObserver.observe(element);

        });

    }


    /* =====================================================
       06. STAGGERED CARD REVEALS
    ===================================================== */

    const staggerGroups = [
        ".solution-card-item",
        ".path-story-item",
        ".principle"
    ];

    staggerGroups.forEach(selector => {

        const elements =
            document.querySelectorAll(selector);

        elements.forEach((element, index) => {

            element.style.transitionDelay =
                `${index * 90}ms`;

        });

    });


    /* =====================================================
       07. SMOOTH ANCHOR NAVIGATION
    ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener("click", event => {

                const targetId =
                    link.getAttribute("href");

                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }

                const target =
                    document.querySelector(targetId);

                if (!target) {
                    return;
                }

                event.preventDefault();

                const headerHeight =
                    header
                        ? header.offsetHeight
                        : 0;

                const targetPosition =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    headerHeight -
                    15;

                window.scrollTo({
                    top: targetPosition,
                    behavior: reducedMotion
                        ? "auto"
                        : "smooth"
                });

            });

        });


    /* =====================================================
       08. HERO SOLUTION PATH INTERACTION
    ===================================================== */

    const heroPathItems =
        document.querySelectorAll(
            ".hero .path-item"
        );

    if (heroPathItems.length) {

        heroPathItems.forEach((item, index) => {

            item.addEventListener(
                "mouseenter",
                () => {

                    heroPathItems.forEach(
                        other => {
                            other.style.opacity =
                                "0.42";
                        }
                    );

                    item.style.opacity = "1";

                }
            );


            item.addEventListener(
                "mouseleave",
                () => {

                    heroPathItems.forEach(
                        other => {
                            other.style.opacity =
                                "1";
                        }
                    );

                }
            );

        });

    }


    /* =====================================================
       09. HERO CARD POINTER DEPTH
    ===================================================== */

    const heroVisual =
        document.querySelector(".hero-visual");

    const solutionCard =
        document.querySelector(".solution-card");


    if (
        heroVisual &&
        solutionCard &&
        !reducedMotion &&
        window.matchMedia("(pointer:fine)").matches
    ) {

        heroVisual.addEventListener(
            "pointermove",
            event => {

                const rect =
                    heroVisual.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;

                const rotateY =
                    ((x / rect.width) - 0.5) * 7;

                const rotateX =
                    ((y / rect.height) - 0.5) * -5;

                solutionCard.style.transform =
                    `rotateY(${rotateY}deg)
                     rotateX(${rotateX}deg)
                     translateY(-4px)`;

            }
        );


        heroVisual.addEventListener(
            "pointerleave",
            () => {

                solutionCard.style.transform =
                    "";

            }
        );

    }


    /* =====================================================
       10. BOOK INTERACTION
    ===================================================== */

    const bookFrame =
        document.querySelector(".book-frame");

    if (
        bookFrame &&
        !reducedMotion &&
        window.matchMedia("(pointer:fine)").matches
    ) {

        bookFrame.addEventListener(
            "pointermove",
            event => {

                const rect =
                    bookFrame.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;

                const rotateY =
                    ((x / rect.width) - 0.5) * 8;

                const rotateX =
                    ((y / rect.height) - 0.5) * -8;

                bookFrame.style.transform =
                    `rotate(${rotateY / 2}deg)
                     rotateY(${rotateY}deg)
                     rotateX(${rotateX}deg)
                     translateY(-6px)`;

            }
        );


        bookFrame.addEventListener(
            "pointerleave",
            () => {

                bookFrame.style.transform =
                    "";

            }
        );

    }


    /* =====================================================
       11. ACTIVE SECTION NAVIGATION
    ===================================================== */

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );


    if (
        sections.length &&
        "IntersectionObserver" in window
    ) {

        const sectionObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        const currentId =
                            entry.target.id;

                        navLinks.forEach(link => {

                            const href =
                                link.getAttribute("href");

                            if (href === `#${currentId}`) {

                                link.classList.add(
                                    "current-section"
                                );

                            } else {

                                link.classList.remove(
                                    "current-section"
                                );

                            }

                        });

                    });

                },
                {
                    threshold: 0.35
                }
            );


        sections.forEach(section => {

            sectionObserver.observe(section);

        });

    }


    /* =====================================================
       12. RESOURCE LINK SAFETY
       ===================================================== */

    document
        .querySelectorAll(
            '.resource-links a[href="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                }
            );

        });


    /* =====================================================
       13. SUBTLE HERO PARALLAX
       ===================================================== */

    const hero =
        document.querySelector(".hero");

    const heroOrbits =
        document.querySelectorAll(
            ".hero-orbit"
        );


    if (
        hero &&
        heroOrbits.length &&
        !reducedMotion &&
        window.matchMedia("(pointer:fine)").matches
    ) {

        let ticking = false;


        const updateHeroParallax = () => {

            const scrollPosition =
                window.scrollY;

            const heroHeight =
                hero.offsetHeight;

            if (scrollPosition > heroHeight) {
                return;
            }

            heroOrbits.forEach(
                (orbit, index) => {

                    const multiplier =
                        index === 0
                            ? 0.10
                            : 0.16;

                    orbit.style.translate =
                        `0 ${scrollPosition * multiplier}px`;

                }
            );

            ticking = false;
        };


        window.addEventListener(
            "scroll",
            () => {

                if (!ticking) {

                    window.requestAnimationFrame(
                        updateHeroParallax
                    );

                    ticking = true;
                }

            },
            { passive: true }
        );

    }


    /* =====================================================
       14. CTA VISIBILITY
    ===================================================== */

    const cta =
        document.querySelector(".cta-section");

    if (
        cta &&
        !reducedMotion &&
        "IntersectionObserver" in window
    ) {

        const ctaObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            cta.classList.add(
                                "cta-active"
                            );

                        }

                    });

                },
                {
                    threshold: 0.25
                }
            );


        ctaObserver.observe(cta);

    }


    /* =====================================================
       15. INITIAL PAGE STATE
    ===================================================== */

    document.body.classList.add(
        "adsa-page-ready"
    );

});

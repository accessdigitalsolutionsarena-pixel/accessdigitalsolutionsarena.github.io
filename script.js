/* =====================================================
   ADSA — ACCESS DIGITAL SOLUTIONS ARENA
   Premium Website Interaction System
===================================================== */


/* =====================================================
   MOBILE NAVIGATION
===================================================== */

const menuToggle =
    document.querySelector(".menu-toggle");

const mainNav =
    document.querySelector(".main-nav");


if (menuToggle && mainNav) {

    menuToggle.addEventListener("click", () => {

        const isOpen =
            mainNav.classList.toggle("active");

        menuToggle.classList.toggle(
            "active",
            isOpen
        );

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    });


    const navigationLinks =
        mainNav.querySelectorAll("a");


    navigationLinks.forEach((link) => {

        link.addEventListener("click", () => {

            mainNav.classList.remove("active");

            menuToggle.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });


    document.addEventListener("click", (event) => {

        const clickedInsideNav =
            mainNav.contains(event.target);

        const clickedToggle =
            menuToggle.contains(event.target);


        if (
            !clickedInsideNav &&
            !clickedToggle &&
            mainNav.classList.contains("active")
        ) {

            mainNav.classList.remove("active");

            menuToggle.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

}


/* =====================================================
   HEADER SCROLL STATE
===================================================== */

const siteHeader =
    document.querySelector(".site-header");


const updateHeader =
    () => {

        if (!siteHeader) return;


        if (window.scrollY > 20) {

            siteHeader.classList.add("scrolled");

        } else {

            siteHeader.classList.remove("scrolled");

        }

    };


window.addEventListener(
    "scroll",
    updateHeader,
    { passive: true }
);


updateHeader();


/* =====================================================
   SCROLL REVEAL
===================================================== */

const revealElements = [];


const addReveal =
    (elements, className = "reveal") => {

        elements.forEach((element) => {

            element.classList.add(className);

            revealElements.push(element);

        });

    };


/*
   Sections
*/

addReveal(
    document.querySelectorAll(
        ".intro-section, .solutions-section, .featured-section, .products-section, .resources-section, .about-section, .cta-section"
    )
);


/*
   Cards
*/

addReveal(
    document.querySelectorAll(
        ".solution-item, .product-placeholder, .principles div"
    )
);


/*
   Hero elements
*/

addReveal(
    document.querySelectorAll(
        ".hero .eyebrow, .hero h1, .hero-text, .hero-actions"
    )
);


/*
   Featured content
*/

addReveal(
    document.querySelectorAll(
        ".featured-copy"
    ),
    "reveal-left"
);


addReveal(
    document.querySelectorAll(
        ".placeholder-panel"
    ),
    "reveal-right"
);


/*
   Resources
*/

addReveal(
    document.querySelectorAll(
        ".resources-grid > div:first-child"
    ),
    "reveal-left"
);


addReveal(
    document.querySelectorAll(
        ".resources-grid > div:last-child"
    ),
    "reveal-right"
);


/*
   About content
*/

addReveal(
    document.querySelectorAll(
        ".about-content"
    )
);


/*
   Hero visual
*/

addReveal(
    document.querySelectorAll(
        ".hero-visual"
    ),
    "reveal-right"
);


/* =====================================================
   INTERSECTION OBSERVER
===================================================== */

const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


if (
    "IntersectionObserver" in window &&
    !prefersReducedMotion
) {

    const observer =
        new IntersectionObserver(
            (entries, observerInstance) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    entry.target.classList.add(
                        "is-visible"
                    );


                    observerInstance.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -50px 0px"
            }
        );


    revealElements.forEach((element) => {

        observer.observe(element);

    });

} else {

    revealElements.forEach((element) => {

        element.classList.add(
            "is-visible"
        );

    });

}


/* =====================================================
   STAGGERED CARD REVEALS
===================================================== */

const solutionItems =
    document.querySelectorAll(
        ".solution-item"
    );


solutionItems.forEach((item, index) => {

    item.style.transitionDelay =
        `${index * 90}ms`;

});


const principles =
    document.querySelectorAll(
        ".principles div"
    );


principles.forEach((item, index) => {

    item.style.transitionDelay =
        `${index * 100}ms`;

});


/* =====================================================
   SOLUTION PATH INTERACTION
===================================================== */

const pathSteps =
    document.querySelectorAll(
        ".path-step"
    );


if (
    pathSteps.length &&
    !prefersReducedMotion
) {

    pathSteps.forEach((step, index) => {

        step.style.transitionDelay =
            `${index * 80}ms`;

    });

}


/* =====================================================
   CURRENT YEAR
===================================================== */

const currentYear =
    document.querySelector(
        "#current-year"
    );


if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}


/* =====================================================
   ESCAPE KEY — CLOSE MOBILE NAV
===================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Escape") {
            return;
        }


        if (
            mainNav &&
            mainNav.classList.contains("active")
        ) {

            mainNav.classList.remove(
                "active"
            );

        }


        if (menuToggle) {

            menuToggle.classList.remove(
                "active"
            );

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }
);

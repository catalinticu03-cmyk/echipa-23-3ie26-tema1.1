// Navigation function for proper page routing
function navigateToPage(page) {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop().replace('.html', '') || 'index';
    
    if (page === currentPage) {
        return; // Already on the same page
    }
    
    // Handle navigation based on current environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Local development
        window.location.href = page === 'index' ? 'index.html' : `${page}.html`;
    } else {
        // Production/hosted environment - use hash-based routing
        window.location.hash = page;
        loadPage(page);
    }
}

// Hash-based routing for hosted environments
function loadPage(page) {
    const pages = {
        'index': 'index.html',
        'menu': 'menu.html',
        'our-story': 'our-story.html',
        'contact': 'contact.html'
    };
    
    if (pages[page]) {
        fetch(pages[page])
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newMain = doc.querySelector('main');
                const newTitle = doc.querySelector('title').textContent;
                
                if (newMain) {
                    document.querySelector('main').innerHTML = newMain.innerHTML;
                    document.title = newTitle;
                    updateActiveNavLink(page);
                    initializePageSpecificFeatures();
                }
            })
            .catch(error => {
                console.error('Error loading page:', error);
            });
    }
}

// Update active navigation link
function updateActiveNavLink(activePage) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('onclick');
        if (href && href.includes(activePage)) {
            link.classList.add('active');
        }
    });
}

// Initialize page-specific features
function initializePageSpecificFeatures() {
    // Re-initialize contact form if on contact page
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        initializeContactForm();
    }
    
    // Re-initialize animations
    initializeAnimations();
}

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Handle hash-based routing on page load
    const hash = window.location.hash.substring(1);
    if (hash && hash !== 'index') {
        loadPage(hash);
    }
    
    // Listen for hash changes
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1) || 'index';
        loadPage(hash);
    });
    
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.length > 1) { // Not just "#"
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add background to navbar when scrolling
        if (scrollTop > 100) {
            navbar.style.backgroundColor = 'rgba(45, 45, 45, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.backgroundColor = '#2d2d2d';
            navbar.style.backdropFilter = 'none';
        }

        lastScrollTop = scrollTop;
    });

    // Initialize animations
    initializeAnimations();

    // Initialize contact form
    initializeContactForm();

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.cta-button, .learn-more-btn, .view-menu-btn, .submit-btn');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '0';
            this.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 100);
        });
    });

    // Page load animation
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Initialize animations
function initializeAnimations() {
    // Fade in animation for elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add fade-in class to elements that should animate
    const animatedElements = document.querySelectorAll('.feature-card, .menu-item, .value-card, .info-card, .story-section, .menu-item-detailed');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Initialize contact form
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            clearFormErrors();
            
            // Validate form
            if (validateForm()) {
                // Show success message
                showSuccessMessage();
                
                // Reset form
                contactForm.reset();
            }
        });

        // Real-time form validation
        const formInputs = document.querySelectorAll('#contactForm input, #contactForm select, #contactForm textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateSingleField(this);
            });
            
            input.addEventListener('input', function() {
                // Clear error when user starts typing
                const errorElement = document.getElementById(this.name + 'Error');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            });
        });
    }
}

// Form validation functions
function validateForm() {
    let isValid = true;
    
    // Validate name
    const name = document.getElementById('name');
    if (name && name.value.trim().length < 2) {
        showError('nameError', 'Te rog introdu un nume valid (cel puțin 2 caractere)');
        isValid = false;
    }
    
    // Validate email
    const email = document.getElementById('email');
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            showError('emailError', 'Te rog introdu o adresă de email validă');
            isValid = false;
        }
    }
    
    // Validate subject
    const subject = document.getElementById('subject');
    if (subject && subject.value === '') {
        showError('subjectError', 'Te rog selectează un subiect');
        isValid = false;
    }
    
    // Validate message
    const message = document.getElementById('message');
    if (message && message.value.trim().length < 10) {
        showError('messageError', 'Te rog introdu un mesaj (cel puțin 10 caractere)');
        isValid = false;
    }
    
    return isValid;
}

function showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearFormErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.style.display = 'block';
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }
}

function validateSingleField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    const errorElement = document.getElementById(fieldName + 'Error');

    if (!errorElement) return;

    switch(fieldName) {
        case 'name':
            if (value.length < 2) {
                showError(fieldName + 'Error', 'Te rog introdu un nume valid (cel puțin 2 caractere)');
            } else {
                errorElement.style.display = 'none';
            }
            break;
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                showError(fieldName + 'Error', 'Te rog introdu o adresă de email validă');
            } else if (value) {
                errorElement.style.display = 'none';
            }
            break;
        case 'message':
            if (value.length > 0 && value.length < 10) {
                showError(fieldName + 'Error', 'Te rog introdu un mesaj (cel puțin 10 caractere)');
            } else if (value.length >= 10) {
                errorElement.style.display = 'none';
            }
            break;
    }
}

// Add loading state to body
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.3s ease';
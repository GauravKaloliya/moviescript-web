// DOM Elements
const signupForm = document.getElementById('signupForm');
const emailInput = document.getElementById('email');
const successMessage = document.getElementById('successMessage');
const countdownElements = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
};

// Launch date (60 days from now)
const launchDate = new Date();
launchDate.setDate(launchDate.getDate() + 60);

// Email signup functionality
signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (validateEmail(email)) {
        // Simulate API call
        setTimeout(() => {
            showSuccessMessage();
            // Store email in localStorage for demo purposes
            const emails = JSON.parse(localStorage.getItem('moviescript_emails') || '[]');
            if (!emails.includes(email)) {
                emails.push(email);
                localStorage.setItem('moviescript_emails', JSON.stringify(emails));
            }
            emailInput.value = '';
        }, 500);
    }
});

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show success message
function showSuccessMessage() {
    successMessage.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
    
    // Hide on click
    successMessage.addEventListener('click', () => {
        successMessage.classList.remove('show');
    });
}

// Countdown timer functionality
function updateCountdown() {
    const now = new Date().getTime();
    const distance = launchDate.getTime() - now;
    
    if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update display with animation
        updateCountdownDisplay('days', days);
        updateCountdownDisplay('hours', hours);
        updateCountdownDisplay('minutes', minutes);
        updateCountdownDisplay('seconds', seconds);
    } else {
        // Launch date reached
        countdownElements.days.textContent = '00';
        countdownElements.hours.textContent = '00';
        countdownElements.minutes.textContent = '00';
        countdownElements.seconds.textContent = '00';
    }
}

// Update countdown display with animation
function updateCountdownDisplay(unit, value) {
    const element = countdownElements[unit];
    const formattedValue = value.toString().padStart(2, '0');
    
    if (element.textContent !== formattedValue) {
        element.style.transform = 'scale(1.1)';
        element.style.color = '#ff6b35';
        
        setTimeout(() => {
            element.textContent = formattedValue;
            element.style.transform = 'scale(1)';
            element.style.color = '#ff6b35';
        }, 150);
    }
}

// Intersection Observer for animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);
    
    // Observe animated elements
    document.querySelectorAll('.feature, .time-unit, .social-link').forEach(el => {
        observer.observe(el);
    });
}

// Smooth scrolling for better UX (if needed for future sections)
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Parallax effect for floating elements
function initializeParallax() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.01;
            const x = (clientX - centerX) * speed;
            const y = (clientY - centerY) * speed;
            
            element.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// Keyboard navigation for accessibility
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && successMessage.classList.contains('show')) {
            successMessage.classList.remove('show');
        }
    });
}

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Start countdown timer
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Initialize features
    initializeAnimations();
    initializeSmoothScrolling();
    initializeParallax();
    initializeKeyboardNavigation();
    
    // Add loading state management
    document.body.classList.add('loaded');
    
    // Log initialization for debugging
    console.log('MovieScript Coming Soon page initialized');
    console.log('Launch date:', launchDate.toDateString());
});

// Error handling for any uncaught errors
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
});

// Handle form submission errors gracefully
emailInput.addEventListener('input', function() {
    this.setCustomValidity('');
    this.classList.remove('error');
});

emailInput.addEventListener('invalid', function() {
    this.setCustomValidity('Please enter a valid email address');
    this.classList.add('error');
});

// Add CSS class for form validation errors
const style = document.createElement('style');
style.textContent = `
    .input-group input.error {
        border-color: #ff4444 !important;
        box-shadow: 0 0 10px rgba(255, 68, 68, 0.2) !important;
    }
`;
document.head.appendChild(style);

// Preload optimization
function preloadAssets() {
    // Preload critical fonts
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => {
        link.rel = 'preload';
        link.as = 'font';
        link.crossOrigin = 'anonymous';
    });
}

// Call preload function
preloadAssets();

// Add visual feedback for interactive elements
document.querySelectorAll('.feature, .social-link, .time-unit').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Analytics placeholder (for future implementation)
function trackEvent(eventName, eventData = {}) {
    // Placeholder for analytics tracking
    console.log('Event tracked:', eventName, eventData);
}

// Track email signup attempts
signupForm.addEventListener('submit', function() {
    trackEvent('email_signup_attempt', {
        timestamp: new Date().toISOString()
    });
});

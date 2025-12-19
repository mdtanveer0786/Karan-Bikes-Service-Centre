// script.js - BUG FIXED VERSION

(function () {
    console.log('Karan Bikes Service Centre Website - Initializing...');

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

    function initApp() {
        // Set current year in footer
        const currentYearEl = document.getElementById('currentYear');
        if (currentYearEl) {
            currentYearEl.textContent = new Date().getFullYear();
        }

        // Initialize features
        const features = [
            initThemeToggle,
            initMobileMenu,
            initFAQs,
            initSmoothScrolling,
            initScrollAnimations,
            initServiceEstimator,
            initBeforeAfterSlider,
            initBookingForm,
            initCopyButtons,
            initWhatsAppAutoMessage,
            initSpeedTest,
            initLeadCapturePopup,
            initConversionTracking,
            initLazyLoading,
            initPrintButton,
            initPerformanceMonitoring,
            initOfflineDetection
        ];

        features.forEach(feature => {
            try {
                feature();
            } catch (error) {
                console.warn(`Feature ${feature.name} failed:`, error);
            }
        });

        // PWA Support
        if ('serviceWorker' in navigator) {
            initServiceWorker();
        }

        console.log('All features initialized successfully');
    }
})();

// 1. Theme Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const themeIcon = themeToggle.querySelector('i');

    // Check for saved theme or prefer-color-scheme
    const savedTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', function () {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        trackEvent('theme_toggle', { theme: newTheme });
    });

    function updateThemeIcon(theme) {
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// 2. Mobile Menu
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', function () {
        const isActive = navMenu.classList.toggle('active');
        menuToggle.innerHTML = isActive ?
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        menuToggle.setAttribute('aria-expanded', isActive);
        trackEvent('mobile_menu_toggle', { state: isActive ? 'open' : 'closed' });
    });

    // Close menu when clicking links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// 3. FAQ Accordion
function initFAQs() {
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', function () {
            const isActive = this.classList.contains('active');
            const answer = this.nextElementSibling;

            // Close all FAQs
            document.querySelectorAll('.faq-question').forEach(otherButton => {
                otherButton.classList.remove('active');
                otherButton.nextElementSibling.classList.remove('active');
                otherButton.setAttribute('aria-expanded', 'false');
            });

            // Open current if it wasn't active
            if (!isActive) {
                this.classList.add('active');
                answer.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
                trackEvent('faq_open', {
                    question: this.textContent.replace(/[▼▲]/g, '').trim()
                });
            }
        });

        // Add ARIA attributes
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', button.nextElementSibling.id || 'faq-answer');
    });
}

// 4. Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // Calculate offset
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL without page jump
                history.pushState(null, null, targetId);

                trackEvent('internal_link_click', { target: targetId });
            }
        });
    });
}

// 5. Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        'section, .service-card, .feature-card, .price-card, .review-card, .contact-card, .brand-logo'
    );

    animatedElements.forEach(el => {
        el.classList.add('fade-in');
    });

    function checkScroll() {
        const windowHeight = window.innerHeight;
        const triggerPoint = 100;

        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < windowHeight - triggerPoint) {
                element.classList.add('visible');
            }
        });
    }

    // Use Intersection Observer for better performance
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        checkScroll();
        window.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);
    }
}

// 6. Service Time Estimator - FIXED
function initServiceEstimator() {
    const calculateBtn = document.getElementById('calculateTime');
    const estimatorVehicle = document.getElementById('estimatorVehicle');
    const estimatorService = document.getElementById('estimatorService');
    const timeResult = document.getElementById('timeResult');

    if (!calculateBtn || !timeResult) return;

    const serviceTimes = {
        general: { scooty: '1-2 Hours', bike: '1.5-2.5 Hours' },
        engine: { scooty: '4-6 Hours', bike: '5-8 Hours' },
        brake: { scooty: '1-2 Hours', bike: '1.5-3 Hours' },
        battery: { scooty: '30-60 Minutes', bike: '45-90 Minutes' },
        emergency: { scooty: '2-4 Hours', bike: '3-6 Hours' }
    };

    const serviceDetails = {
        general: 'Includes cleaning, lubrication, and basic checkup',
        engine: 'Complete engine diagnostics and repair work',
        brake: 'Brake adjustment, pad replacement, and system check',
        battery: 'Battery testing, charging, and replacement',
        emergency: 'Priority service for breakdown situations'
    };

    function calculateTime() {
        const vehicle = estimatorVehicle ? estimatorVehicle.value : 'scooty';
        const service = estimatorService ? estimatorService.value : 'general';

        const resultBox = timeResult.querySelector('.result-box');
        if (!resultBox) return;

        if (!vehicle || !service) {
            resultBox.innerHTML = '<p style="color: var(--primary-color);">Please select both options</p>';
            return;
        }

        const time = serviceTimes[service]?.[vehicle] || '1-3 Hours';
        const detail = serviceDetails[service] || 'Professional repair service';

        resultBox.innerHTML = `
            <div class="time-result">
                <div class="estimated-time">${time}</div>
                <p>${detail}</p>
                <p class="time-note"><i class="fas fa-info-circle"></i> Time may vary based on actual condition</p>
            </div>
        `;

        trackEvent('service_time_calculated', {
            vehicle: vehicle,
            service: service,
            estimated_time: time
        });
    }

    calculateBtn.addEventListener('click', calculateTime);

    // Auto-calculate on change
    if (estimatorVehicle) estimatorVehicle.addEventListener('change', calculateTime);
    if (estimatorService) estimatorService.addEventListener('change', calculateTime);

    // Initial calculation
    setTimeout(calculateTime, 500);
}

// 7. Before-After Slider - FIXED
function initBeforeAfterSlider() {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');

    if (slides.length === 0) return;

    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        // Ensure index is within bounds
        const slideIndex = (index + slides.length) % slides.length;

        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === slideIndex);
        });

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === slideIndex);
        });

        currentSlide = slideIndex;
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // Event Listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    // Touch support
    let touchStartX = 0;

    slider.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        clearInterval(slideInterval); // Pause auto-slide during interaction
    }, { passive: true });

    slider.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        const swipeThreshold = 50;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide(); // Swipe left
            } else {
                prevSlide(); // Swipe right
            }
        }

        // Restart auto-slide
        startAutoSlide();
    }, { passive: true });

    function startAutoSlide() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    // Start auto-slide
    startAutoSlide();

    // Pause on hover
    slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
    slider.addEventListener('mouseleave', startAutoSlide);
}

// 8. Booking Form - FIXED
function initBookingForm() {
    const bookingForm = document.getElementById('serviceBookingForm');
    if (!bookingForm) return;

    // Form validation function
    function validateForm() {
        let isValid = true;
        const errors = [];

        // Name validation
        const nameInput = bookingForm.querySelector('#customerName');
        if (nameInput && !nameInput.value.trim()) {
            isValid = false;
            nameInput.classList.add('error');
            errors.push('Please enter your name');
        } else if (nameInput) {
            nameInput.classList.remove('error');
        }

        // Phone validation
        const phoneInput = bookingForm.querySelector('#customerPhone');
        if (phoneInput) {
            const phoneDigits = phoneInput.value.replace(/\D/g, '');
            const phoneRegex = /^[6-9]\d{9}$/;

            if (!phoneDigits || !phoneRegex.test(phoneDigits)) {
                isValid = false;
                phoneInput.classList.add('error');
                errors.push('Please enter a valid 10-digit Indian mobile number');
            } else {
                phoneInput.classList.remove('error');
            }
        }

        // Vehicle validation
        const vehicleSelect = bookingForm.querySelector('#vehicleType');
        if (vehicleSelect && !vehicleSelect.value) {
            isValid = false;
            vehicleSelect.classList.add('error');
            errors.push('Please select vehicle type');
        } else if (vehicleSelect) {
            vehicleSelect.classList.remove('error');
        }

        // Service validation
        const serviceSelect = bookingForm.querySelector('#serviceNeeded');
        if (serviceSelect && !serviceSelect.value) {
            isValid = false;
            serviceSelect.classList.add('error');
            errors.push('Please select service needed');
        } else if (serviceSelect) {
            serviceSelect.classList.remove('error');
        }

        return { isValid, errors: errors[0] }; // Return first error
    }

    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const validation = validateForm();
        if (!validation.isValid) {
            showNotification(validation.errors, 3000);
            return;
        }

        // Get form data
        const formData = {
            name: bookingForm.querySelector('#customerName').value,
            phone: bookingForm.querySelector('#customerPhone').value,
            vehicle: bookingForm.querySelector('#vehicleType').value,
            service: bookingForm.querySelector('#serviceNeeded').value,
            problem: bookingForm.querySelector('#problemDesc').value || 'Not specified',
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };

        // Create WhatsApp message
        const whatsappMessage = `*New Service Booking Request - Karan Bikes*\n\n` +
            `👤 Name: ${formData.name}\n` +
            `📞 Phone: ${formData.phone}\n` +
            `🏍️ Vehicle: ${formData.vehicle}\n` +
            `🔧 Service: ${formData.service}\n` +
            `📝 Problem: ${formData.problem}\n` +
            `⏰ Time: ${formData.timestamp}\n\n` +
            `📍 Vijay Park, Gali No. 21, Moujpur`;

        // Encode for URL
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/919999999999?text=${encodedMessage}`;

        // Show loading state
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Simulate sending delay
        setTimeout(() => {
            // Open WhatsApp
            window.open(whatsappUrl, '_blank');

            // Show success message
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent Successfully!';
            submitBtn.style.background = 'var(--secondary-color)';

            // Reset form after delay
            setTimeout(() => {
                bookingForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';

                // Show thank you message
                const thankYouMsg = document.createElement('div');
                thankYouMsg.className = 'thank-you-message';
                thankYouMsg.innerHTML = `
                    <div style="text-align: center; padding: 1rem; background: var(--secondary-color); color: white; border-radius: var(--border-radius); margin-top: 1rem;">
                        <i class="fas fa-check-circle"></i>
                        <p>Thank you! We'll call you within 30 minutes to confirm.</p>
                    </div>
                `;

                bookingForm.appendChild(thankYouMsg);

                setTimeout(() => {
                    thankYouMsg.remove();
                }, 5000);
            }, 2000);

            trackEvent('service_booking_success', formData);
        }, 1000);
    });

    // Real-time validation
    bookingForm.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('blur', validateForm);
    });
}

// 9. Copy Buttons - FIXED
function initCopyButtons() {
    // Coupon code copy
    document.querySelectorAll('.copy-coupon-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const couponCode = this.closest('.coupon-code').querySelector('span').textContent;
            copyToClipboard(couponCode, 'Coupon code copied to clipboard!');
            trackEvent('coupon_copied', { code: couponCode });
        });
    });

    // Referral code copy
    document.querySelectorAll('.copy-referral-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const referralCode = document.getElementById('referralCode');
            if (referralCode) {
                copyToClipboard(referralCode.textContent, 'Referral code copied to clipboard!');
                trackEvent('referral_copied', { code: referralCode.textContent });
            }
        });
    });

    // Utility function
    function copyToClipboard(text, successMessage) {
        if (!navigator.clipboard) {
            // Fallback for older browsers
            fallbackCopy(text);
            showNotification(successMessage);
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            showNotification(successMessage);
        }).catch(err => {
            console.error('Clipboard write failed:', err);
            fallbackCopy(text);
            showNotification(successMessage);
        });

        function fallbackCopy(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }
}

// 10. WhatsApp Auto Message
function initWhatsAppAutoMessage() {
    // Show prompt after 45 seconds if not shown before
    if (sessionStorage.getItem('whatsappPromptShown')) return;

    setTimeout(() => {
        if (document.visibilityState !== 'visible') return;

        const prompt = document.createElement('div');
        prompt.className = 'whatsapp-prompt';
        prompt.innerHTML = `
            <div class="prompt-content">
                <button class="close-prompt" aria-label="Close">×</button>
                <p><strong>Need immediate help?</strong></p>
                <p>Chat with us on WhatsApp for instant support</p>
                <a href="https://wa.me/919999999999?text=Hi%2C%20I%20need%20help%20with%20bike%20repair%20service." 
                   target="_blank" class="btn btn-primary" onclick="trackEvent('whatsapp_prompt_click')">
                    <i class="fab fa-whatsapp"></i> Start Chat
                </a>
            </div>
        `;

        document.body.appendChild(prompt);

        // Add styles
        if (!document.querySelector('#whatsapp-prompt-styles')) {
            const styles = document.createElement('style');
            styles.id = 'whatsapp-prompt-styles';
            styles.textContent = `
                .whatsapp-prompt {
                    position: fixed;
                    bottom: 150px;
                    right: 20px;
                    z-index: 1000;
                    animation: slideInUp 0.3s ease;
                }
                
                .prompt-content {
                    background: white;
                    padding: 1rem;
                    border-radius: var(--border-radius);
                    box-shadow: var(--shadow-lg);
                    max-width: 280px;
                    position: relative;
                }
                
                [data-theme="dark"] .prompt-content {
                    background: var(--light-color);
                }
                
                .close-prompt {
                    position: absolute;
                    top: 5px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--gray-color);
                    line-height: 1;
                }
                
                @keyframes slideInUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        // Close button
        prompt.querySelector('.close-prompt').addEventListener('click', () => {
            prompt.remove();
            sessionStorage.setItem('whatsappPromptShown', 'true');
        });

        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (prompt.parentNode) {
                prompt.remove();
                sessionStorage.setItem('whatsappPromptShown', 'true');
            }
        }, 15000);

        trackEvent('whatsapp_prompt_shown');
    }, 45000);
}

// 11. Speed Test
function initSpeedTest() {
    const startTime = performance.now();

    window.addEventListener('load', () => {
        const loadTime = performance.now() - startTime;
        console.log(`📊 Page loaded in ${loadTime.toFixed(2)}ms`);

        if (loadTime > 3000) {
            console.warn('⚠️ Page load time is slow. Consider optimizing images and resources.');
        }

        trackEvent('page_load_time', {
            time_ms: Math.round(loadTime),
            connection: navigator.connection ? navigator.connection.effectiveType : 'unknown'
        });
    }, { once: true });
}

// 12. Lead Capture Popup
function initLeadCapturePopup() {
    // Show after 60 seconds on desktop only
    if (window.innerWidth < 768 || localStorage.getItem('leadPopupShown')) return;

    setTimeout(() => {
        if (document.visibilityState !== 'visible') return;

        const popup = createLeadPopup();
        document.body.appendChild(popup);

        // Add to localStorage
        localStorage.setItem('leadPopupShown', 'true');

        trackEvent('lead_popup_shown');
    }, 60000);

    function createLeadPopup() {
        const overlay = document.createElement('div');
        overlay.className = 'lead-popup-overlay';
        overlay.innerHTML = `
            <div class="lead-popup" role="dialog" aria-labelledby="lead-popup-title">
                <button class="close-popup" aria-label="Close">×</button>
                <h3 id="lead-popup-title"><i class="fas fa-gift"></i> Get ₹200 OFF on First Service!</h3>
                <p>Enter your number to receive coupon code via WhatsApp</p>
                <input type="tel" id="leadPhone" placeholder="98XXXXXX20" maxlength="10" inputmode="numeric">
                <button id="submitLead" class="btn btn-primary">
                    <i class="fab fa-whatsapp"></i> Send Coupon via WhatsApp
                </button>
                <p class="privacy-note"><i class="fas fa-lock"></i> We respect your privacy. No spam.</p>
            </div>
        `;

        // Add styles if not exists
        if (!document.querySelector('#lead-popup-styles')) {
            const styles = document.createElement('style');
            styles.id = 'lead-popup-styles';
            styles.textContent = `
                .lead-popup-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    animation: fadeIn 0.3s ease;
                    padding: 1rem;
                }
                
                .lead-popup {
                    background: white;
                    padding: 2rem;
                    border-radius: var(--border-radius-lg);
                    max-width: 400px;
                    width: 100%;
                    position: relative;
                    animation: slideUp 0.3s ease;
                }
                
                [data-theme="dark"] .lead-popup {
                    background: var(--light-color);
                }
                
                .close-popup {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    background: none;
                    border: none;
                    font-size: 2rem;
                    cursor: pointer;
                    color: var(--gray-color);
                    line-height: 1;
                }
                
                .lead-popup h3 {
                    text-align: center;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                
                .lead-popup p {
                    text-align: center;
                    color: var(--gray-color);
                    margin-bottom: 1.5rem;
                }
                
                #leadPhone {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid var(--light-gray);
                    border-radius: var(--border-radius);
                    font-size: 1rem;
                    margin-bottom: 1rem;
                    text-align: center;
                }
                
                .privacy-note {
                    font-size: 0.875rem;
                    margin-top: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        // Event listeners
        overlay.querySelector('.close-popup').addEventListener('click', () => {
            overlay.remove();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        overlay.querySelector('#submitLead').addEventListener('click', submitLead);

        // Focus on input
        setTimeout(() => {
            const input = overlay.querySelector('#leadPhone');
            if (input) input.focus();
        }, 300);

        return overlay;
    }

    function submitLead() {
        const phoneInput = document.getElementById('leadPhone');
        if (!phoneInput) return;

        const phone = phoneInput.value.trim();
        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phone || !phoneRegex.test(phone)) {
            showNotification('Please enter a valid 10-digit phone number', 3000);
            phoneInput.focus();
            return;
        }

        const message = `Hi! Here's your ₹200 OFF coupon for Karan Bikes Service Centre:\n\n` +
            `🎫 Coupon Code: KARAN200\n\n` +
            `Show this code at workshop or mention it on WhatsApp booking.\n` +
            `Valid till 31 Dec 2024.\n\n` +
            `Book now: https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20use%20coupon%20KARAN200`;

        const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');

        trackEvent('lead_captured', { phone: phone });

        // Close popup
        const popup = document.querySelector('.lead-popup-overlay');
        if (popup) {
            popup.remove();
            showNotification('Coupon sent to your WhatsApp!', 3000);
        }
    }
}

// 13. Conversion Tracking
function initConversionTracking() {
    // Phone calls
    document.querySelectorAll('a[href^="tel:"]').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const phoneNumber = this.href.replace('tel:', '');
            trackEvent('phone_call_clicked', {
                phone_number: phoneNumber,
                element: this.className || 'unknown',
                text: this.textContent.trim()
            });

            // Add slight delay to ensure tracking before navigation
            setTimeout(() => {
                // Allow default behavior
            }, 100);
        });
    });

    // WhatsApp messages
    document.querySelectorAll('a[href*="whatsapp"]').forEach(btn => {
        btn.addEventListener('click', function () {
            trackEvent('whatsapp_clicked', {
                source: this.className || 'unknown',
                text: this.textContent.trim(),
                is_float: this.classList.contains('whatsapp-float')
            });
        });
    });

    // Form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function () {
            trackEvent('form_submit', {
                form_id: this.id || 'unknown',
                action: this.action || 'unknown'
            });
        });
    });

    // Map directions
    document.querySelectorAll('a[href*="maps.google"]').forEach(link => {
        link.addEventListener('click', function () {
            trackEvent('get_directions', {
                text: this.textContent.trim()
            });
        });
    });

    // CTA buttons
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        if (!btn.href && btn.type !== 'submit') {
            btn.addEventListener('click', function () {
                trackEvent('cta_click', {
                    text: this.textContent.trim(),
                    type: this.classList.contains('btn-primary') ? 'primary' : 'secondary'
                });
            });
        }
    });
}

// 14. Lazy Loading
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');

                    // Load background images if any
                    if (img.dataset.bg) {
                        img.style.backgroundImage = `url(${img.dataset.bg})`;
                    }

                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback: load all images immediately
        images.forEach(img => {
            img.classList.add('loaded');
        });
    }
}

// 15. Print Button
function initPrintButton() {
    // Only show on desktop
    if (window.innerWidth < 768) return;

    const printButton = document.createElement('button');
    printButton.className = 'print-button';
    printButton.innerHTML = '<i class="fas fa-print"></i>';
    printButton.title = 'Print this page';
    printButton.setAttribute('aria-label', 'Print page');

    printButton.addEventListener('click', () => {
        window.print();
        trackEvent('print_page');
    });

    document.body.appendChild(printButton);

    // Add print styles
    const printStyles = document.createElement('style');
    printStyles.textContent = `
        .print-button {
            position: fixed;
            bottom: 150px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            border: none;
            box-shadow: var(--shadow);
            cursor: pointer;
            z-index: 997;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition);
        }
        
        .print-button:hover {
            transform: scale(1.1);
            background: var(--primary-dark);
        }
        
        @media print {
            .print-button,
            .whatsapp-float,
            .mobile-action-bar,
            .emergency-banner {
                display: none !important;
            }
            
            a[href^="tel:"]::after {
                content: " (" attr(href) ")";
            }
        }
    `;
    document.head.appendChild(printStyles);
}

// 16. Performance Monitoring
function initPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
        // First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    trackEvent('performance_fcp', {
                        time_ms: Math.round(entry.startTime)
                    });
                }
            }
        });

        try {
            fcpObserver.observe({ entryTypes: ['paint'] });
        } catch (e) {
            // Older browsers
        }

        // Largest Contentful Paint
        if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                trackEvent('performance_lcp', {
                    time_ms: Math.round(lastEntry.renderTime || lastEntry.loadTime)
                });
            });

            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
}

// 17. Offline Detection
function initOfflineDetection() {
    function updateOnlineStatus() {
        if (!navigator.onLine) {
            showNotification('You are offline. Some features may not work.', 4000);
            trackEvent('offline_detected');
        } else {
            showNotification('Back online!', 2000);
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial check
    setTimeout(updateOnlineStatus, 1000);
}

// 18. Service Worker
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration.scope);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        console.log('ServiceWorker update found:', newWorker.state);

                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showNotification('New version available! Refresh for updates.', 5000);
                            }
                        });
                    });
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        });
    }
}

// Utility Functions
function trackEvent(eventName, eventData = {}) {
    // Add timestamp and page info
    const data = {
        ...eventData,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        screen_size: `${window.innerWidth}x${window.innerHeight}`
    };

    console.log(`📊 Event: ${eventName}`, data);

    // Store in localStorage (max 100 events)
    try {
        const analytics = JSON.parse(localStorage.getItem('karan_bikes_analytics') || '[]');
        analytics.push({ event: eventName, data: data, time: new Date().toISOString() });
        localStorage.setItem('karan_bikes_analytics', JSON.stringify(analytics.slice(-100)));
    } catch (e) {
        console.error('Failed to store analytics:', e);
    }

    // Send to analytics endpoint if configured
    if (window.ANALYTICS_ENDPOINT) {
        fetch(window.ANALYTICS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: eventName, ...data })
        }).catch(() => { /* Ignore errors */ });
    }
}

function showNotification(message, duration = 3000) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
        </div>
    `;

    document.body.appendChild(notification);

    // Add styles if not exists
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                animation: slideInRight 0.3s ease;
            }
            
            .notification-content {
                background: var(--primary-color);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-lg);
                max-width: 300px;
            }
            
            [data-theme="dark"] .notification-content {
                background: var(--primary-dark);
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
    }

    // Auto-remove
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);

    // Close on click
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
}

// Error handling
window.addEventListener('error', function (e) {
    console.error('Global error:', e.error);
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
    });
});

window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled promise rejection:', e.reason);
    trackEvent('promise_rejection', {
        reason: e.reason?.toString() || 'Unknown'
    });
});
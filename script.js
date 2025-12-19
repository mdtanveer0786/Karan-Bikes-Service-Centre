// script.js - PROFESSIONAL VERSION

(function () {
    'use strict';

    console.log('Karan Bikes Service Centre - Website Initializing...');

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

        // Initialize all features
        const features = [
            initMobileMenu,
            initFAQs,
            initSmoothScrolling,
            initScrollAnimations,
            initServiceEstimator,
            initBeforeAfterSlider,
            initReviewsSlider,
            initBookingForm,
            initCopyButtons,
            initLeadCapturePopup,
            initConversionTracking,
            initLazyLoading,
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

        console.log('All features initialized successfully');
    }

    // 1. Mobile Menu
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

    // 2. FAQ Accordion
    function initFAQs() {
        document.querySelectorAll('.faq-question').forEach(button => {
            button.addEventListener('click', function () {
                const isActive = this.classList.contains('active');
                const answer = this.nextElementSibling;

                // Close all other FAQs
                if (!isActive) {
                    document.querySelectorAll('.faq-question').forEach(otherButton => {
                        otherButton.classList.remove('active');
                        otherButton.nextElementSibling.classList.remove('active');
                        otherButton.setAttribute('aria-expanded', 'false');
                    });
                }

                // Toggle current FAQ
                this.classList.toggle('active');
                answer.classList.toggle('active');
                this.setAttribute('aria-expanded', !isActive);

                if (!isActive) {
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

    // 3. Smooth Scrolling
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

    // 4. Scroll Animations
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll(
            'section, .service-card, .feature-card, .price-card, .review-card, .contact-card, .brand-logo'
        );

        animatedElements.forEach(el => {
            el.classList.add('fade-in');
        });

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

            checkScroll();
            window.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
        }
    }

    // 5. Service Time Estimator - UPDATED
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
            const calculateBtn = document.getElementById('calculateTime');

            if (!resultBox) return;

            if (!vehicle || !service) {
                resultBox.innerHTML = '<p style="color: var(--primary-color); font-weight: 600;">Please select both options</p>';
                return;
            }

            // Show loading state
            calculateBtn.classList.add('loading');
            calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';

            // Simulate calculation delay
            setTimeout(() => {
                calculateBtn.classList.remove('loading');
                calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Time';

                const time = serviceTimes[service]?.[vehicle] || '1-3 Hours';
                const detail = serviceDetails[service] || 'Professional repair service';

                resultBox.innerHTML = `
                <div class="time-result">
                    <div class="estimated-time">${time}</div>
                    <p>${detail}</p>
                    <p class="time-note"><i class="fas fa-info-circle"></i> Time may vary based on actual condition</p>
                </div>
            `;

                // Add success animation
                resultBox.classList.add('success');
                setTimeout(() => {
                    resultBox.classList.remove('success');
                }, 500);

                trackEvent('service_time_calculated', {
                    vehicle: vehicle,
                    service: service,
                    estimated_time: time
                });
            }, 800);
        }

        calculateBtn.addEventListener('click', calculateTime);

        // Auto-calculate on change
        if (estimatorVehicle) estimatorVehicle.addEventListener('change', calculateTime);
        if (estimatorService) estimatorService.addEventListener('change', calculateTime);

        // Initial calculation on page load
        setTimeout(() => {
            calculateTime();
        }, 1000);
    }
    // 6. Before-After Slider
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
            const slideIndex = (index + slides.length) % slides.length;

            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === slideIndex);
            });

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
            clearInterval(slideInterval);
        }, { passive: true });

        slider.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            const swipeThreshold = 50;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }

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

    // 7. Reviews Slider 
    function initReviewsSlider() {
        const slider = document.querySelector('.reviews-slider');
        if (!slider) return;

        const slides = document.querySelectorAll('.review-slide');
        const indicators = document.querySelectorAll('.indicator');
        const prevBtn = document.querySelector('.prev-review');
        const nextBtn = document.querySelector('.next-review');

        if (slides.length === 0) return;

        let currentSlide = 0;
        let slideInterval;

        function showSlide(index) {
            const slideIndex = (index + slides.length) % slides.length;

            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === slideIndex);
            });

            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === slideIndex);
            });

            currentSlide = slideIndex;
        }

        function nextReview() {
            showSlide(currentSlide + 1);
        }

        function prevReview() {
            showSlide(currentSlide - 1);
        }

        // Event Listeners
        if (nextBtn) nextBtn.addEventListener('click', nextReview);
        if (prevBtn) prevBtn.addEventListener('click', prevReview);

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => showSlide(index));
        });

        // Touch support
        let touchStartX = 0;

        slider.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            clearInterval(slideInterval);
        }, { passive: true });

        slider.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            const swipeThreshold = 50;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextReview();
                } else {
                    prevReview();
                }
            }

            startAutoSlide();
        }, { passive: true });

        function startAutoSlide() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextReview, 6000);
        }

        // Start auto-slide
        startAutoSlide();

        // Pause on hover
        slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
        slider.addEventListener('mouseleave', startAutoSlide);
    }

    // 8. Booking Form
    function initBookingForm() {
        const bookingForm = document.getElementById('serviceBookingForm');
        if (!bookingForm) return;

        function validateForm() {
            let isValid = true;

            // Name validation
            const nameInput = bookingForm.querySelector('#customerName');
            if (nameInput && !nameInput.value.trim()) {
                isValid = false;
                showError(nameInput, 'Please enter your name');
            } else if (nameInput) {
                clearError(nameInput);
            }

            // Phone validation
            const phoneInput = bookingForm.querySelector('#customerPhone');
            if (phoneInput) {
                const phoneDigits = phoneInput.value.replace(/\D/g, '');
                const phoneRegex = /^[6-9]\d{9}$/;

                if (!phoneDigits || !phoneRegex.test(phoneDigits)) {
                    isValid = false;
                    showError(phoneInput, 'Please enter a valid 10-digit Indian mobile number');
                } else {
                    clearError(phoneInput);
                }
            }

            // Vehicle validation
            const vehicleSelect = bookingForm.querySelector('#bookingVehicle');
            if (vehicleSelect && !vehicleSelect.value) {
                isValid = false;
                showError(vehicleSelect, 'Please select vehicle type');
            } else if (vehicleSelect) {
                clearError(vehicleSelect);
            }

            // Service validation
            const serviceSelect = bookingForm.querySelector('#bookingService');
            if (serviceSelect && !serviceSelect.value) {
                isValid = false;
                showError(serviceSelect, 'Please select service needed');
            } else if (serviceSelect) {
                clearError(serviceSelect);
            }

            return isValid;
        }

        function showError(element, message) {
            element.classList.add('error');
            let errorSpan = element.nextElementSibling;
            if (!errorSpan || !errorSpan.classList.contains('error-message')) {
                errorSpan = document.createElement('span');
                errorSpan.className = 'error-message';
                element.parentNode.insertBefore(errorSpan, element.nextSibling);
            }
            errorSpan.textContent = message;
        }

        function clearError(element) {
            element.classList.remove('error');
            const errorSpan = element.nextElementSibling;
            if (errorSpan && errorSpan.classList.contains('error-message')) {
                errorSpan.remove();
            }
        }

        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!validateForm()) {
                showNotification('Please fix the errors in the form', 3000);
                return;
            }

            // Get form data
            const formData = {
                name: bookingForm.querySelector('#customerName').value,
                phone: bookingForm.querySelector('#customerPhone').value,
                vehicle: bookingForm.querySelector('#bookingVehicle').value,
                service: bookingForm.querySelector('#bookingService').value,
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
            const whatsappUrl = `https://wa.me/918810345774?text=${encodedMessage}`;

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
            input.addEventListener('blur', function () {
                if (this.value.trim()) {
                    clearError(this);
                }
            });
        });
    }

    // 9. Copy Buttons
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

        function copyToClipboard(text, successMessage) {
            if (!navigator.clipboard) {
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

    // 10. Lead Capture Popup
    function initLeadCapturePopup() {
        // Show after 60 seconds on desktop only
        if (window.innerWidth < 768 || localStorage.getItem('leadPopupShown')) return;

        setTimeout(() => {
            if (document.visibilityState !== 'visible') return;

            const popup = createLeadPopup();
            document.body.appendChild(popup);

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
                `Book now: https://wa.me/918810345774?text=Hi%2C%20I%20want%20to%20use%20coupon%20KARAN200`;

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

    // 11. Conversion Tracking
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
    }

    // 12. Lazy Loading
    function initLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            images.forEach(img => img.classList.add('loaded'));
        }
    }

    // 13. Performance Monitoring
    function initPerformanceMonitoring() {
        const startTime = performance.now();

        window.addEventListener('load', () => {
            const loadTime = performance.now() - startTime;
            console.log(`📊 Page loaded in ${loadTime.toFixed(2)}ms`);

            trackEvent('page_load_time', {
                time_ms: Math.round(loadTime),
                connection: navigator.connection ? navigator.connection.effectiveType : 'unknown'
            });
        }, { once: true });
    }

    // 14. Offline Detection
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

        setTimeout(updateOnlineStatus, 1000);
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
})(); 
// Initialize EmailJS and contact form functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS
    emailjs.init("XZiqXvXGUZ2WaKUne");

    const contactModal = document.getElementById('contactModal');
    const contactForm = document.getElementById('contactForm');
    const closeButton = document.querySelector('.contact__close-btn');
    const contactLinks = document.querySelectorAll('.contact-link');

    function openContactForm() {
        if (contactModal) {
            contactModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeContactForm() {
        if (contactModal) {
            contactModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    function handleContactSubmit(event) {
        event.preventDefault();
        
        // Get form data
        const form = event.target;
        const formData = {
            from_name: form.name.value,
            from_email: form.email.value,
            message: form.message.value
        };

        // Show loading state
        const submitBtn = form.querySelector('.contact__submit-btn');
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Send email using EmailJS
        emailjs.send('service_7xmu46e', 'template_s0uio9z', formData)
            .then(() => {
                // Show success message
                alert('Thank you for your message! We will get back to you soon.');
                closeContactForm();
                form.reset();
            })
            .catch((error) => {
                // Show error message
                alert('Sorry, there was an error sending your message. Please try again later.');
                console.error('Email sending error:', error);
            })
            .finally(() => {
                // Reset button state
                submitBtn.textContent = 'Send Message';
                submitBtn.disabled = false;
            });
    }

    // Add event listeners
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeContactForm);
    }

    contactLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openContactForm();
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === contactModal) {
            closeContactForm();
        }
    });

    // Make functions available globally
    window.openContactForm = openContactForm;
    window.closeContactForm = closeContactForm;
}); 
// Initialize EmailJS
(function() {
    emailjs.init("XZiqXvXGUZ2WaKUne");
})();

function openContactForm() {
    document.getElementById('contactModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeContactForm() {
    document.getElementById('contactModal').style.display = 'none';
    document.body.style.overflow = 'auto';
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

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('contactModal');
    if (event.target == modal) {
        closeContactForm();
    }
}); 
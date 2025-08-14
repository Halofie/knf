document.addEventListener('DOMContentLoaded', function() {
    initializeSectionNavigation();
    loadCustomerStats();
});

function initializeSectionNavigation() {
    // Handle sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar a[href^="#"]');
    const sections = document.querySelectorAll('.content-section');
    
    // Show dashboard by default
    showSection('dashboard');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            showSection(targetSection);
            
            // Update active state
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Close offcanvas on mobile
            const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasExample'));
            if (offcanvas) {
                offcanvas.hide();
            }
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
    }
}

async function loadCustomerStats() {
    try {
        // Get customer statistics
        const response = await fetch('../knft/getCustomerStats.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        // Update dashboard cards
        document.getElementById('total-orders-count').textContent = data.totalOrders || '0';
        document.getElementById('recent-orders-count').textContent = data.recentOrders || '0';
        document.getElementById('total-spent').textContent = `₹${data.totalSpent || '0.00'}`;
        
        // Animate counters
        animateCounters();
        
    } catch (error) {
        console.error('Error loading customer stats:', error);
    }
}

function animateCounters() {
    const counters = ['total-orders-count', 'recent-orders-count'];
    
    counters.forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;
        
        const target = parseInt(element.textContent) || 0;
        let current = 0;
        const increment = Math.max(1, target / 20);
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.ceil(current);
            }
        }, 50);
    });
}

// Handle profile form submission
document.getElementById('profileForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    // Add profile update logic here
    alert('Profile update functionality to be implemented');
});

// Handle password change form submission
document.getElementById('passwordForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    // Add password change logic here
    alert('Password change functionality to be implemented');
});

// Export functions for global use
window.customerDashboard = {
    showSection,
    loadCustomerStats
};
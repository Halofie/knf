function shopNow() {
    window.location.href = '#products';
}

function joinFarmer() {
    window.location.href = '#';
}

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  });
}

// Enhanced accordion functionality
document.addEventListener('DOMContentLoaded', function() {
  const accordion = document.querySelector('.accordion-enhanced');
  const learnMore = document.querySelector('.learn-more-enhanced');
            
  if (accordion && learnMore) {
    accordion.addEventListener('click', function() {
      if (learnMore.style.maxHeight) {
        learnMore.style.maxHeight = null;
        accordion.classList.remove('active');
      } else {
        learnMore.style.maxHeight = learnMore.scrollHeight + "px";
        accordion.classList.add('active');
      }
    });
  }

            // Smooth scroll for navigation links
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
});

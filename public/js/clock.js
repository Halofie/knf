document.addEventListener('DOMContentLoaded', function () {
    function updateClock() {
        let now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        let ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12 || 12; // Convert 0 to 12
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        let timeString = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
        let dateString = now.toLocaleDateString();

        // Select and update all clock elements
        document.querySelectorAll('.clock').forEach(clockElement => {
            clockElement.textContent = dateString + ' ' + timeString;
        });
    }

    // Start the clock and update every second
    setInterval(updateClock, 1000);
    updateClock(); // Initial update
});

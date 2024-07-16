function updateTimes() {
    document.querySelectorAll('.timeCounter').forEach(timer => {
        let id = timer.getAttribute('data-id');
        let second = timer.querySelector('.second');
        let minute = timer.querySelector('.minute');
        let hour = timer.querySelector('.hour');
        let day = timer.querySelector('.day');

        let s = parseInt(second.innerText);
        let m = parseInt(minute.innerText);
        let h = parseInt(hour.innerText);
        let d = parseInt(day.innerText);

        s++;
        if (s >= 60) {
            s = 0;
            m++;
        }
        if (m >= 60) {
            m = 0;
            h++;
        }
        if (h >= 24) {
            h = 0;
            d++;
        }

        second.innerText = s;
        minute.innerText = m;
        hour.innerText = h;
        day.innerText = d;

        // Send the updated time to the server for each timer
        fetch('/updateBuyingTime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id_buying_list=${id}&day=${d}&hour=${h}&minute=${m}&second=${s}`
        });
    });
}

// Update time every second for all timers
setInterval(updateTimes, 1000);
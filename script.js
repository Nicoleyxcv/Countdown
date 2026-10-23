
const DEFAULT_EVENT_NAME = "THE NEXT CHAPTER";
const DEFAULT_TARGET_DATE = "2027-01-01T00:00";

const $ = (id) => document.getElementById(id);

const nameInput = $("nameInput");
const dateInput = $("dateInput");

let targetTime;
let startTime;

function toLocalInputValue(date) {
    const pad = (n) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(date) {
    return new Intl.DateTimeFormat("de-DE", {
        dateStyle: "full",
        timeStyle: "short"
    }).format(date);
}

function setEvent(name, dateValue, save = true) {
    const cleanName = name.trim() || DEFAULT_EVENT_NAME;
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        $("status").textContent = "INVALID TARGET DATE";
        return false;
    }

    if (date.getTime() <= Date.now()) {
        $("status").textContent = "DATE MUST BE IN THE FUTURE";
        return false;
    }

    $("eventName").textContent = cleanName.toUpperCase();
    $("eventDate").textContent = formatDate(date);

    nameInput.value = cleanName;
    dateInput.value = toLocalInputValue(date);

    targetTime = date.getTime();
    startTime = Date.now();

    $("status").textContent = "COUNTDOWN ACTIVE";
    $("mission").textContent = "WAIT FOR THE DROP";

    if (save) {
        try {
            localStorage.setItem("pixelCountdownConfig", JSON.stringify({
                name: cleanName,
                date: dateInput.value
            }));
        } catch (error) {
            console.warn("Einstellungen konnten nicht gespeichert werden.");
        }
    }

    updateCountdown();
    return true;
}

function updateCountdown() {
    const now = Date.now();
    const remaining = Math.max(0, targetTime - now);
    const totalSeconds = Math.floor(remaining / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    $("days").textContent = String(days).padStart(2, "0");
    $("hours").textContent = String(hours).padStart(2, "0");
    $("minutes").textContent = String(minutes).padStart(2, "0");
    $("seconds").textContent = String(seconds).padStart(2, "0");

    const duration = Math.max(1, targetTime - startTime);
    const elapsed = Math.max(0, now - startTime);
    const progress = Math.min(100, (elapsed / duration) * 100);

    $("progressFill").style.width = `${progress}%`;

    if (remaining === 0) {
        $("status").textContent = "EVENT UNLOCKED";
        $("mission").textContent = "WELCOME TO THE FUTURE";
        $("headline").innerHTML =
            'IT’S TIME<span class="cursor"></span>';
    } else {
        $("status").textContent = "COUNTDOWN ACTIVE";
        $("headline").innerHTML =
            'COMING SOON<span class="cursor"></span>';
    }
}

$("saveBtn").addEventListener("click", () => {
    const success = setEvent(nameInput.value, dateInput.value);

    if (success) {
        document.querySelector(".settings").open = false;
    }
});

function initialize() {
    let loaded = false;

    try {
        const saved = JSON.parse(
            localStorage.getItem("pixelCountdownConfig") || "null"
        );

        if (saved && saved.name && saved.date) {
            loaded = setEvent(saved.name, saved.date, false);
        }
    } catch (error) {
        console.warn("Gespeicherte Einstellungen konnten nicht geladen werden.");
    }

    if (!loaded) {
        let date = new Date(DEFAULT_TARGET_DATE);

        if (date.getTime() <= Date.now()) {
            date = new Date();
            date.setDate(date.getDate() + 30);
        }

        setEvent(DEFAULT_EVENT_NAME, toLocalInputValue(date), false);
    }
}

initialize();
setInterval(updateCountdown, 1000);

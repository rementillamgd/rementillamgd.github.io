const body = document.body;
const root = document.documentElement;
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const themeButton = document.querySelector('.theme-btn');
const themePanel = document.getElementById('themePanel');
const colorButtons = document.querySelectorAll('.color-btn');
const modeButton = document.querySelector('.color-mode-btn');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const aside = document.querySelector('.aside');
const typingElement = document.querySelector('.typing');
const skills = document.querySelectorAll('.progress span');
const philippineClock = document.getElementById('philippineClock');
const localClock = document.getElementById('localClock');
const emailDisplay = document.querySelector('.contact-email');

const THEME_KEY = 'atlas-theme-color';
const MODE_KEY = 'atlas-mode';

const setActiveLink = (targetId) => {
    navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === targetId);
    });
};

const applyThemeColor = (color) => {
    root.style.setProperty('--skin-color', color);
    localStorage.setItem(THEME_KEY, color);

    colorButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.color.toLowerCase() === color.toLowerCase());
    });
};

const applyThemeMode = (isLight) => {
    body.classList.toggle('light-mode', isLight);
    localStorage.setItem(MODE_KEY, isLight ? 'light' : 'dark');

    const icon = modeButton.querySelector('i');
    icon.classList.toggle('fa-moon-o', !isLight);
    icon.classList.toggle('fa-sun-o', isLight);
};

const decodeEmail = (value) => {
    if (!value) {
        return '';
    }

    return value.split(',').map((code) => String.fromCharCode(Number(code))).join('');
};

const formatDateTimeForTimeZone = (date, timeZone) => {
    if (!timeZone) {
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(date).replace(',', '');
    }

    try {
        const formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(date);
        const values = {};

        parts.forEach((part) => {
            if (part.type !== 'literal') {
                values[part.type] = part.value;
            }
        });

        return `${values.day}/${values.month}/${values.year}, ${values.hour}:${values.minute}:${values.second}`;
    } catch (error) {
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(date).replace(',', '');
    }
};

const updateClocks = () => {
    const now = new Date();

    if (philippineClock) {
        philippineClock.textContent = formatDateTimeForTimeZone(now, 'Asia/Manila');
    }

    if (localClock) {
        const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
        localClock.textContent = formatDateTimeForTimeZone(now, localTimeZone);
    }
};

const savedTheme = localStorage.getItem(THEME_KEY) || '#ec1839';
const savedMode = localStorage.getItem(MODE_KEY) || 'dark';

applyThemeColor(savedTheme);
applyThemeMode(savedMode === 'light');

if (emailDisplay) {
    const encodedEmail = emailDisplay.dataset && emailDisplay.dataset.email ? emailDisplay.dataset.email : '';
    const decodedEmail = decodeEmail(encodedEmail);

    if (decodedEmail) {
        emailDisplay.textContent = decodedEmail;

        const parentLink = emailDisplay.closest('a');
        if (parentLink) {
            parentLink.href = `mailto:${decodedEmail}`;
        }
    }
}

themeButton.addEventListener('click', () => {
    themePanel.classList.toggle('open');
});

colorButtons.forEach((button) => {
    button.addEventListener('click', () => {
        applyThemeColor(button.dataset.color);
        themePanel.classList.remove('open');
    });
});

modeButton.addEventListener('click', () => {
    const isLight = !body.classList.contains('light-mode');
    applyThemeMode(isLight);
});

document.addEventListener('click', (event) => {
    if (!themePanel.contains(event.target) && !themeButton.contains(event.target)) {
        themePanel.classList.remove('open');
    }

    if (window.innerWidth <= 767 && mobileMenuToggle && aside && !aside.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
        aside.classList.remove('open');
    }
});

navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('href');
        const section = document.querySelector(targetId);

        if (section) {
            setActiveLink(targetId);
            section.scrollIntoView({ behavior: 'smooth' });
        }

        if (window.innerWidth <= 767) {
            aside.classList.remove('open');
        }
    });
});

mobileMenuToggle.addEventListener('click', () => {
    aside.classList.toggle('open');
});

const sectionObserver = new IntersectionObserver((entries) => {
    const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visibleEntry) {
        setActiveLink(`#${visibleEntry.target.id}`);
    }
}, {
    threshold: [0.2, 0.35, 0.5, 0.7, 1]
});

sections.forEach((section) => sectionObserver.observe(section));

const homeHash = window.location.hash;
if (homeHash) {
    const targetSection = document.querySelector(homeHash);
    if (targetSection) {
        setActiveLink(homeHash);
    }
} else {
    setActiveLink('#home');
}

const roleWords = typingElement.dataset.words.split(',');
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeRole() {
    const currentWord = roleWords[wordIndex];

    if (!currentWord) {
        return;
    }

    if (!isDeleting) {
        charIndex += 1;
        typingElement.textContent = currentWord.slice(0, charIndex);

        if (charIndex === currentWord.length) {
            isDeleting = true;
            setTimeout(typeRole, 1200);
            return;
        }

        setTimeout(typeRole, 110);
        return;
    }

    charIndex -= 1;
    typingElement.textContent = currentWord.slice(0, charIndex);

    if (charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % roleWords.length;
    }

    setTimeout(typeRole, 70);
}

typeRole();

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const skill = entry.target;
            const width = skill.dataset.progress || '0%';
            skill.style.width = width;
            skillObserver.unobserve(skill);
        }
    });
}, {
    threshold: 0.35
});

skills.forEach((skill) => skillObserver.observe(skill));

window.addEventListener('resize', () => {
    if (window.innerWidth > 767) {
        aside.classList.remove('open');
    }
});

updateClocks();
setInterval(updateClocks, 1000);

const numbersGrid = document.getElementById('numbersGrid');
const viewAllBtn = document.getElementById('viewAllBtn');
const tariffsSlider = document.getElementById('tariffsSlider');
const tariffsContainer = document.querySelector('.tariffs-container');
const prevTariffBtn = document.getElementById('prevTariff');
const nextTariffBtn = document.getElementById('nextTariff');
const searchBtn = document.getElementById('searchBtn');
const phoneInput = document.getElementById('phoneInput');
const pickTariffBtn = document.getElementById('pickTariffBtn');
const orderBtn = document.getElementById('orderBtn');
const orderBtnMobile = document.getElementById('orderBtnMobile');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

let currentNumbersDisplayed = 4;
let currentTariffIndex = 0;
let tariffsPerView = 3;
let isMobile = false;
let isScrolling = false;

const TELEGRAM_USERNAME = "ne_kaktus";

// Загрузка данных из localStorage (синхронизация с админ-панелью)
function loadDataFromStorage() {
    const savedMasks = localStorage.getItem('bestnomer_masks');
    const savedNumbers = localStorage.getItem('bestnomer_numbers');
    const savedTariffs = localStorage.getItem('bestnomer_tariffs');
    
    if (savedMasks) {
        try {
            const parsedMasks = JSON.parse(savedMasks);
            if (Array.isArray(parsedMasks) && parsedMasks.length > 0) {
                masksData.length = 0;
                parsedMasks.forEach(m => masksData.push(m));
            }
        } catch(e) { console.log('Error loading masks from storage'); }
    }
    
    if (savedNumbers) {
        try {
            const parsedNumbers = JSON.parse(savedNumbers);
            if (Array.isArray(parsedNumbers) && parsedNumbers.length > 0) {
                numbersData.length = 0;
                parsedNumbers.forEach(n => numbersData.push(n));
            }
        } catch(e) { console.log('Error loading numbers from storage'); }
    }
    
    // ЗАГРУЖАЕМ ТАРИФЫ ИЗ LOCALSTORAGE
    if (savedTariffs) {
        try {
            const parsedTariffs = JSON.parse(savedTariffs);
            if (Array.isArray(parsedTariffs) && parsedTariffs.length > 0) {
                // Очищаем текущие данные тарифов и загружаем из localStorage
                tariffsData.length = 0;
                parsedTariffs.forEach(t => tariffsData.push(t));
            }
        } catch(e) { 
            console.log('Error loading tariffs from storage', e);
            // Если ошибка, используем данные из data.js
        }
    }
}

function sendToTelegram(message) {
    const url = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    createStars();
    
    // Инициализация мобильного меню
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
            this.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('click', function(e) {
            if (mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(e.target) && 
                !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Обработчик кнопки заказа в мобильном меню
    if (orderBtnMobile) {
        orderBtnMobile.addEventListener('click', function() {
            sendToTelegram('Заказ услуги');
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    checkMobile();
    updateSwipeHint();
    
    // Загружаем данные из localStorage (если были изменены через админ-панель)
    loadDataFromStorage();
    
    renderMasks();
    renderNumbers();
    
    // Скрываем кнопку "смотреть все" так как номера группируются по маскам
    if (viewAllBtn) {
        viewAllBtn.style.display = 'none';
    }

    renderTariffs();
    updateTariffsSlider();
    updateNavButtons();
    
    initOptimizedSwipe();
    
    if (prevTariffBtn) {
        prevTariffBtn.addEventListener('click', function() {
            if (currentTariffIndex > 0) {
                currentTariffIndex--;
                updateTariffsSlider();
                updateNavButtons();
            }
        });
    }

    if (nextTariffBtn) {
        nextTariffBtn.addEventListener('click', function() {
            const maxIndex = tariffsData.length - tariffsPerView;
            if (currentTariffIndex < maxIndex) {
                currentTariffIndex++;
                updateTariffsSlider();
                updateNavButtons();
            }
        });
    }

    // Обновленный ввод номера
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            
            if (value.startsWith('7')) value = value.slice(1);
            if (value.startsWith('8')) value = value.slice(1);
            
            let formatted = '+7';
            if (value.length > 0) formatted += ' (' + value.slice(0, 3);
            if (value.length > 3) formatted += ') ' + value.slice(3, 6);
            if (value.length > 6) formatted += '-' + value.slice(6, 8);
            if (value.length > 8) formatted += '-' + value.slice(8, 10);
            
            this.value = formatted;
        });

        phoneInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (searchBtn) searchBtn.click();
            }
        });
    }

    // Обновленный поиск
    if (searchBtn && phoneInput) {
        searchBtn.addEventListener('click', function() {
            const phoneNumber = phoneInput.value.trim();
            
            if (!phoneNumber || phoneNumber.length < 10) {
                phoneInput.style.borderColor = 'red';
                setTimeout(() => phoneInput.style.borderColor = '', 1000);
                return;
            }
            
            sendToTelegram(`Поиск номера: ${phoneNumber}`);
            phoneInput.value = '+7';
        });
    }
    
    if (pickTariffBtn) {
        pickTariffBtn.addEventListener('click', function() {
            sendToTelegram('Подбор тарифа');
        });
    }

    if (orderBtn) {
        orderBtn.addEventListener('click', function() {
            sendToTelegram('Заказ услуги');
        });
    }

    window.addEventListener('resize', function() {
        checkMobile();
        updateSwipeHint();
        updateTariffsPerView();
        updateTariffsSlider();
        updateNavButtons();
    });
});

function createStars() {
    const spaceBg = document.querySelector('.space-bg');
    if (!spaceBg) return;
    
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star small';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        spaceBg.appendChild(star);
    }
    
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star medium';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        spaceBg.appendChild(star);
    }
    
    for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.className = 'star large';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        spaceBg.appendChild(star);
    }
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'gold-particle';
        const size = Math.random() * 5 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 20) + 's';
        spaceBg.appendChild(particle);
    }
}

function initOptimizedSwipe() {
    if (!tariffsSlider || !tariffsContainer) return;
    
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;
    let isHorizontalMove = false;
    let scrollTimeout = null;
    
    const handleTouchStart = (e) => {
        if (!isMobile) return;
        
        isScrolling = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startScrollLeft = tariffsContainer.scrollLeft;
        startScrollTop = window.scrollY || document.documentElement.scrollTop;
        isHorizontalMove = false;
        
        document.body.style.overflow = 'hidden';
        tariffsContainer.style.scrollSnapType = 'none';
    };
    
    const handleTouchMove = (e) => {
        if (!isMobile || !isScrolling) return;
        
        e.preventDefault();
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        if (!isHorizontalMove) {
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
                isHorizontalMove = true;
            } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
                isHorizontalMove = false;
                return;
            }
        }
        
        if (isHorizontalMove) {
            e.stopPropagation();
            const scrollAmount = startScrollLeft - deltaX;
            tariffsContainer.scrollLeft = scrollAmount;
        }
    };
    
    const handleTouchEnd = (e) => {
        if (!isMobile) return;
        
        isScrolling = false;
        document.body.style.overflow = '';
        tariffsContainer.style.scrollSnapType = 'x mandatory';
        
        if (isHorizontalMove) {
            const containerRect = tariffsContainer.getBoundingClientRect();
            const cards = tariffsSlider.children;
            let nearestCard = null;
            let minDistance = Infinity;
            
            for (let card of cards) {
                const cardRect = card.getBoundingClientRect();
                const distance = Math.abs(cardRect.left - containerRect.left);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestCard = card;
                }
            }
            
            if (nearestCard) {
                const cardIndex = parseInt(nearestCard.dataset.index);
                currentTariffIndex = Math.min(cardIndex, tariffsData.length - tariffsPerView);
                
                tariffsContainer.scrollTo({
                    left: nearestCard.offsetLeft - (containerRect.width - nearestCard.offsetWidth) / 2,
                    behavior: 'smooth'
                });
                
                updateNavButtons();
            }
        }

        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isHorizontalMove = false;
        }, 300);
    };
    
    tariffsContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    tariffsContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    tariffsContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    tariffsContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    tariffsContainer.addEventListener('contextmenu', (e) => {
        if (isMobile) e.preventDefault();
    });
}

function checkMobile() {
    isMobile = window.innerWidth <= 768;
    if (isMobile) {
        tariffsPerView = 1;
    } else if (window.innerWidth < 992) {
        tariffsPerView = 2;
    } else {
        tariffsPerView = 3;
    }
}

function updateSwipeHint() {
    const swipeHint = document.querySelector('.swipe-hint');
    if (swipeHint) {
        swipeHint.style.display = isMobile ? 'block' : 'none';
    }
}

function renderMasks() {
    const containers = [
        document.getElementById('masksContainer'),
        document.getElementById('masksContainerNumbers')
    ];
    
    containers.forEach(container => {
        if (!container) return;
        
        container.innerHTML = '';
        masksData.forEach(mask => {
            const maskBtn = document.createElement('button');
            maskBtn.className = 'mask-btn';
            maskBtn.dataset.mask = mask.id;
            maskBtn.innerHTML = `<span class="mask-name">${mask.name}</span>`;
            maskBtn.addEventListener('click', () => {
                scrollToMask(mask.id);
            });
            container.appendChild(maskBtn);
        });
    });
}

function scrollToMask(maskId) {
    const maskSection = document.getElementById(`mask-${maskId}`);
    if (maskSection) {
        maskSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function getBadgeHTML(badge) {
    if (!badge) return '';
    const badgeColors = {
        'vip': 'badge-vip',
        'hit': 'badge-hit',
        'sale': 'badge-sale',
        'hot': 'badge-hit',
        'new': 'badge-new'
    };
    const badgeClass = badgeColors[badge] || '';
    return `<span class="number-badge ${badgeClass}">${badge.toUpperCase()}</span>`;
}

function getBadgePriority(badge) {
    const priorities = {
        'vip': 1,
        'hit': 2,
        'hot': 3,
        'sale': 3,
        'new': 4
    };
    return priorities[badge] || 99;
}

const shownNumbersCount = {};
const NUMBERS_PER_LOAD = 4;

function renderNumbers() {
    if (!numbersGrid) return;
    numbersGrid.innerHTML = '';
    
    const numbersByMask = {};
    numbersData.forEach(number => {
        if (!numbersByMask[number.mask]) {
            numbersByMask[number.mask] = [];
        }
        numbersByMask[number.mask].push(number);
    });
    
    masksData.forEach(mask => {
        let maskNumbers = numbersByMask[mask.id] || [];
        if (maskNumbers.length === 0) return;
        
        if (!shownNumbersCount[mask.id]) {
            shownNumbersCount[mask.id] = NUMBERS_PER_LOAD;
        }
        
        maskNumbers.sort((a, b) => {
            return getBadgePriority(a.badge) - getBadgePriority(b.badge);
        });
        
        const maskGroup = document.createElement('div');
        maskGroup.className = 'mask-group';
        maskGroup.id = `mask-${mask.id}`;
        
        const maskHeader = document.createElement('div');
        maskHeader.className = 'mask-group-header';
        maskHeader.innerHTML = `
            <span class="mask-group-title">${mask.name}</span>
            <span class="mask-group-count">${maskNumbers.length} номеров</span>
        `;
        maskGroup.appendChild(maskHeader);
        
        const numbersInGroup = document.createElement('div');
        numbersInGroup.className = 'numbers-in-group';
        
        const visibleNumbers = maskNumbers.slice(0, shownNumbersCount[mask.id]);
        
        visibleNumbers.forEach(number => {
            const card = document.createElement('div');
            card.className = 'number-card';
            card.innerHTML = `
                ${getBadgeHTML(number.badge)}
                <div class="phone-number">${number.number}</div>
                <div class="number-price">${number.price || ''}</div>
                <div class="card-footer">
                    <button class="select-number-btn" onclick="sendToTelegram('Номер: ${number.number}, Цена: ${number.price}')">
                        Выбрать номер
                    </button>
                </div>
            `;
            numbersInGroup.appendChild(card);
        });
        
        maskGroup.appendChild(numbersInGroup);
        
        if (maskNumbers.length > shownNumbersCount[mask.id]) {
            const remaining = maskNumbers.length - shownNumbersCount[mask.id];
            const showMoreBtn = document.createElement('button');
            showMoreBtn.className = 'show-more-btn';
            showMoreBtn.innerHTML = `<span>Смотреть еще</span> <i class="fas fa-chevron-down"></i>`;
            showMoreBtn.onclick = () => {
                shownNumbersCount[mask.id] += NUMBERS_PER_LOAD;
                renderNumbers();
            };
            maskGroup.appendChild(showMoreBtn);
        }
        
        numbersGrid.appendChild(maskGroup);
    });
}

function renderTariffs() {
    if (!tariffsSlider) return;
    tariffsSlider.innerHTML = '';
    
    // Используем данные из tariffsData, которые теперь загружаются из localStorage
    tariffsData.forEach((tariff, index) => {
        const card = document.createElement('div');
        card.className = 'tariff-card';
        card.dataset.index = index;
        card.innerHTML = `
            ${getBadgeHTML(tariff.badge)}
            <div class="tariff-price-badge">${tariff.price}</div>
            <div class="operator-name">${tariff.operator}</div>
            <div class="tariff-info">${tariff.data} · ${tariff.minutes}</div>
            <button class="connect-tariff-btn" onclick="sendToTelegram('Тариф: ${tariff.operator} - ${tariff.data}, ${tariff.minutes}, ${tariff.price}')">
                Подключить
            </button>
        `;
        tariffsSlider.appendChild(card);
    });
}

function updateTariffsSlider() {
    if (!tariffsSlider) return;
    
    if (!isMobile) {
        const cardWidthPercent = 100 / tariffsPerView;
        const offset = -currentTariffIndex * cardWidthPercent;
        tariffsSlider.style.transform = `translateX(${offset}%)`;
        tariffsSlider.style.transition = 'transform 0.3s ease';
    } else {
        // Для мобильных используем скролл контейнера
        const container = tariffsContainer;
        const currentCard = tariffsSlider.querySelector(`[data-index="${currentTariffIndex}"]`);
        
        if (container && currentCard) {
            const containerRect = container.getBoundingClientRect();
            const cardRect = currentCard.getBoundingClientRect();
            const targetScroll = currentCard.offsetLeft - (containerRect.width - cardRect.width) / 2;
            
            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    }
}

function updateNavButtons() {
    if (!prevTariffBtn || !nextTariffBtn) return;
    
    const maxIndex = Math.max(0, tariffsData.length - tariffsPerView);
    
    prevTariffBtn.disabled = currentTariffIndex <= 0;
    prevTariffBtn.style.opacity = prevTariffBtn.disabled ? '0.5' : '1';
    prevTariffBtn.style.cursor = prevTariffBtn.disabled ? 'not-allowed' : 'pointer';
    
    nextTariffBtn.disabled = currentTariffIndex >= maxIndex;
    nextTariffBtn.style.opacity = nextTariffBtn.disabled ? '0.5' : '1';
    nextTariffBtn.style.cursor = nextTariffBtn.disabled ? 'not-allowed' : 'pointer';
}

function updateTariffsPerView() {
    const width = window.innerWidth;
    if (width < 768) {
        tariffsPerView = 1;
    } else if (width < 992) {
        tariffsPerView = 2;
    } else {
        tariffsPerView = 3;
    }

    const maxIndex = Math.max(0, tariffsData.length - tariffsPerView);
    if (currentTariffIndex > maxIndex) {
        currentTariffIndex = Math.max(0, maxIndex);
    }
}

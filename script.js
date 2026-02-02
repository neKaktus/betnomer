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
const callbackBtn = document.getElementById('callbackBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const orderBtnMobile = document.getElementById('orderBtnMobile');

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
    
    if (savedTariffs) {
        try {
            const parsedTariffs = JSON.parse(savedTariffs);
            if (Array.isArray(parsedTariffs) && parsedTariffs.length > 0) {
                tariffsData.length = 0;
                parsedTariffs.forEach(t => tariffsData.push(t));
            }
        } catch(e) { console.log('Error loading tariffs from storage'); }
    }
}

function sendToTelegram(message) {
    const url = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    createStars();
    
    // Проверка мобильного устройства при загрузке
    checkMobile();
    
    // Инициализация мобильного меню
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
            this.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Закрыть меню при клике на ссылку
        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Закрыть меню при клике вне его
        document.addEventListener('click', function(e) {
            if (mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(e.target) && 
                !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Закрыть меню при нажатии Esc
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

    updateSwipeHint();
    
    // Загружаем данные из localStorage (если были изменены через админ-панель)
    loadDataFromStorage();
    
    // Рендерим все компоненты с учетом мобильной версии
    renderAllMobileOptimized();
    
    // Скрываем кнопку "смотреть все" так как номера группируются по маскам
    if (viewAllBtn) {
        viewAllBtn.style.display = 'none';
    }

    // Инициализируем свайп для мобильных
    if (isMobile) {
        initMobileSwipe();
    }
    
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
            const maxIndex = Math.max(0, tariffsData.length - tariffsPerView);
            if (currentTariffIndex < maxIndex) {
                currentTariffIndex++;
                updateTariffsSlider();
                updateNavButtons();
            }
        });
    }

    // Форматирование ввода номера телефона
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            
            // Убираем начальные 7 или 8
            if (value.startsWith('7')) value = value.slice(1);
            if (value.startsWith('8')) value = value.slice(1);
            
            let formatted = '+7';
            if (value.length > 0) formatted += ' (' + value.slice(0, 3);
            if (value.length > 3) formatted += ') ' + value.slice(3, 6);
            if (value.length > 6) formatted += '-' + value.slice(6, 8);
            if (value.length > 8) formatted += '-' + value.slice(8, 10);
            
            this.value = formatted;
        });

        // Обработка нажатия Enter
        phoneInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (searchBtn) searchBtn.click();
            }
        });
    }

    // Поиск номера
    if (searchBtn && phoneInput) {
        searchBtn.addEventListener('click', function() {
            const phoneNumber = phoneInput.value.trim();
            
            // Проверка на пустой или неполный номер
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

    if (callbackBtn) {
        callbackBtn.addEventListener('click', function() {
            sendToTelegram('Обратный звонок');
        });
    }

    // Обработчик изменения размера окна
    window.addEventListener('resize', function() {
        const wasMobile = isMobile;
        checkMobile();
        updateSwipeHint();
        updateTariffsPerView();
        
        // Если статус мобильности изменился, перерисовываем
        if (wasMobile !== isMobile) {
            renderAllMobileOptimized();
            if (isMobile) {
                initMobileSwipe();
            }
        }
        
        updateTariffsSlider();
        updateNavButtons();
    });
});

function createStars() {
    const spaceBg = document.querySelector('.space-bg');
    if (!spaceBg) return;
    
    // Для мобильных создаем меньше звезд для производительности
    const starCount = isMobile ? 50 : 100;
    const mediumCount = isMobile ? 25 : 50;
    const largeCount = isMobile ? 10 : 20;
    
    // Создаем маленькие звезды
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star small';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        spaceBg.appendChild(star);
    }
    
    // Создаем средние звезды
    for (let i = 0; i < mediumCount; i++) {
        const star = document.createElement('div');
        star.className = 'star medium';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        spaceBg.appendChild(star);
    }
    
    // Создаем большие звезды
    for (let i = 0; i < largeCount; i++) {
        const star = document.createElement('div');
        star.className = 'star large';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        spaceBg.appendChild(star);
    }
    
    // Создаем золотые частицы (только для десктопа)
    if (!isMobile) {
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
}

// Упрощенный свайп для мобильных
function initMobileSwipe() {
    if (!tariffsSlider || !tariffsContainer) return;
    
    let startX = 0;
    let startTime = 0;
    
    const handleTouchStart = (e) => {
        startX = e.touches[0].clientX;
        startTime = Date.now();
    };
    
    const handleTouchEnd = (e) => {
        if (!startX) return;
        
        const endX = e.changedTouches[0].clientX;
        const deltaX = endX - startX;
        const deltaTime = Date.now() - startTime;
        const minSwipeDistance = 50;
        const maxSwipeTime = 500;
        
        // Определяем направление свайпа
        if (Math.abs(deltaX) > minSwipeDistance && deltaTime < maxSwipeTime) {
            if (deltaX > 0) {
                // Свайп вправо - предыдущий тариф
                if (currentTariffIndex > 0) {
                    currentTariffIndex--;
                } else {
                    // Циклический переход к последнему
                    currentTariffIndex = Math.max(0, tariffsData.length - 1);
                }
            } else {
                // Свайп влево - следующий тариф
                const maxIndex = Math.max(0, tariffsData.length - 1);
                if (currentTariffIndex < maxIndex) {
                    currentTariffIndex++;
                } else {
                    // Циклический переход к первому
                    currentTariffIndex = 0;
                }
            }
            
            updateTariffsSlider();
            updateNavButtons();
        }
        
        startX = 0;
    };
    
    // Добавляем обработчики для мобильного свайпа
    tariffsContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    tariffsContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Отключаем горизонтальный скролл страницы при касании слайдера
    tariffsContainer.addEventListener('touchmove', function(e) {
        if (Math.abs(e.touches[0].clientX - startX) > 10) {
            e.preventDefault();
        }
    }, { passive: false });
}

function checkMobile() {
    const width = window.innerWidth;
    isMobile = width <= 768;
    
    // Обновляем количество отображаемых тарифов
    if (width < 576) {
        tariffsPerView = 1;
    } else if (width < 768) {
        tariffsPerView = 1;
    } else if (width < 992) {
        tariffsPerView = 2;
    } else if (width < 1200) {
        tariffsPerView = 3;
    } else {
        tariffsPerView = 3;
    }
}

function updateSwipeHint() {
    const swipeHint = document.querySelector('.swipe-hint');
    if (swipeHint) {
        swipeHint.style.display = isMobile ? 'flex' : 'none';
    }
}

function renderAllMobileOptimized() {
    renderMasksMobile();
    renderNumbersMobile();
    renderTariffsMobile();
    updateTariffsSlider();
    updateNavButtons();
}

function renderMasksMobile() {
    const containers = [
        document.getElementById('masksContainer'),
        document.getElementById('masksContainerNumbers')
    ];
    
    containers.forEach(container => {
        if (!container) return;
        
        container.innerHTML = '';
        
        // Для мобильных уменьшаем размер кнопок масок
        masksData.forEach(mask => {
            const maskBtn = document.createElement('button');
            maskBtn.className = 'mask-btn';
            maskBtn.dataset.mask = mask.id;
            
            // Для мобильных делаем текст компактнее
            const maskName = isMobile ? 
                mask.name.replace(/[-\s]/g, '') : // Убираем дефисы и пробелы на мобильных
                mask.name;
                
            maskBtn.innerHTML = `<span class="mask-name">${maskName}</span>`;
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
        // Для мобильных добавляем отступ сверху
        const offset = isMobile ? 80 : 0;
        const elementPosition = maskSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function getBadgeHTML(badge) {
    if (!badge) return '';
    const badgeColors = {
        'vip': 'badge-vip',
        'hot': 'badge-hot',
        'hit': 'badge-hit',
        'sale': 'badge-sale',
        'new': 'badge-new'
    };
    const badgeClass = badgeColors[badge] || '';
    // Для мобильных уменьшаем размер бейджей
    const badgeSizeClass = isMobile ? 'badge-small' : '';
    return `<span class="number-badge ${badgeClass} ${badgeSizeClass}">${badge.toUpperCase()}</span>`;
}

function getBadgePriority(badge) {
    const priorities = {
        'vip': 1,
        'hit': 2,
        'sale': 3,
        'new': 4
    };
    return priorities[badge] || 99;
}

const shownNumbersCount = {};
const NUMBERS_PER_LOAD_MOBILE = 2;
const NUMBERS_PER_LOAD_DESKTOP = 4;

function renderNumbersMobile() {
    if (!numbersGrid) return;
    numbersGrid.innerHTML = '';
    
    // Для мобильных используем другую структуру
    const numbersPerLoad = isMobile ? NUMBERS_PER_LOAD_MOBILE : NUMBERS_PER_LOAD_DESKTOP;
    
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
            shownNumbersCount[mask.id] = numbersPerLoad;
        }
        
        maskNumbers.sort((a, b) => {
            return getBadgePriority(a.badge) - getBadgePriority(b.badge);
        });
        
        const maskGroup = document.createElement('div');
        maskGroup.className = 'mask-group';
        maskGroup.id = `mask-${mask.id}`;
        
        // Для мобильных уменьшаем заголовок
        const maskHeader = document.createElement('div');
        maskHeader.className = 'mask-group-header';
        maskHeader.innerHTML = `
            <span class="mask-group-title">${mask.name}</span>
            <span class="mask-group-count">${maskNumbers.length} номеров</span>
        `;
        maskGroup.appendChild(maskHeader);
        
        const numbersInGroup = document.createElement('div');
        numbersInGroup.className = isMobile ? 'numbers-in-group mobile' : 'numbers-in-group';
        
        const visibleNumbers = maskNumbers.slice(0, shownNumbersCount[mask.id]);
        
        visibleNumbers.forEach(number => {
            const card = document.createElement('div');
            card.className = isMobile ? 'number-card mobile' : 'number-card';
            
            // Для мобильных упрощаем карточку
            const phoneNumber = isMobile ? 
                number.number.replace(/\s/g, '') : // Убираем пробелы на мобильных
                number.number;
                
            card.innerHTML = `
                ${getBadgeHTML(number.badge)}
                <div class="phone-number">${phoneNumber}</div>
                <div class="number-price">${number.price || ''}</div>
                <div class="card-footer">
                    <button class="select-number-btn ${isMobile ? 'mobile' : ''}" onclick="sendToTelegram('Номер: ${number.number}, Цена: ${number.price}')">
                        ${isMobile ? 'Выбрать' : 'Выбрать номер'}
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
                shownNumbersCount[mask.id] += numbersPerLoad;
                renderNumbersMobile();
            };
            maskGroup.appendChild(showMoreBtn);
        }
        
        numbersGrid.appendChild(maskGroup);
    });
}

function formatTariffInfo(data, minutes) {
    let formattedData = data || '';
    let formattedMinutes = minutes || '';
    
    if (formattedData && /\d/.test(formattedData) && !formattedData.includes('ГБ') && !formattedData.includes('GB')) {
        formattedData = formattedData.trim() + ' ГБ';
    }
    
    if (formattedMinutes && /\d/.test(formattedMinutes) && !formattedMinutes.includes('мин') && !formattedMinutes.includes('min')) {
        formattedMinutes = formattedMinutes.trim() + ' мин';
    }
    
    // Для мобильных сокращаем текст
    if (isMobile) {
        return `${formattedData} • ${formattedMinutes}`;
    }
    
    return `${formattedData} · ${formattedMinutes}`;
}

function formatPrice(price) {
    if (!price) return 'Цена не указана';
    
    let formattedPrice = price.trim();
    
    if (!formattedPrice.includes('₽') && !formattedPrice.includes('руб') && !formattedPrice.includes('р.')) {
        formattedPrice = formattedPrice + ' ₽';
    }
    
    return formattedPrice;
}

function renderTariffsMobile() {
    if (!tariffsSlider) return;
    tariffsSlider.innerHTML = '';
    
    if (tariffsData.length === 0) {
        tariffsSlider.innerHTML = `
            <div class="no-tariffs-message ${isMobile ? 'mobile' : ''}">
                <i class="fas fa-tags"></i>
                <p>${isMobile ? 'Тарифы скоро появятся' : 'Тарифы скоро появятся'}</p>
                <p style="font-size: ${isMobile ? '11px' : '12px'}; margin-top: 10px; color: #aaa;">
                    ${isMobile ? 'Добавьте тарифы в админке' : 'Добавьте тарифы через админ-панель'}
                </p>
            </div>
        `;
        return;
    }
    
    tariffsData.forEach((tariff, index) => {
        const card = document.createElement('div');
        card.className = isMobile ? 'tariff-card mobile' : 'tariff-card';
        card.dataset.index = index;
        
        // Для мобильных упрощаем карточку
        const formattedPrice = formatPrice(tariff.price);
        const formattedInfo = formatTariffInfo(tariff.data, tariff.minutes);
        const operatorName = isMobile && tariff.operator && tariff.operator.length > 15 ? 
            tariff.operator.substring(0, 15) + '...' : 
            tariff.operator || 'Без оператора';
        
        card.innerHTML = `
            ${getBadgeHTML(tariff.badge)}
            <div class="tariff-price-badge ${isMobile ? 'mobile' : ''}">${formattedPrice}</div>
            <div class="operator-name ${isMobile ? 'mobile' : ''}">${operatorName}</div>
            <div class="tariff-info ${isMobile ? 'mobile' : ''}">${formattedInfo}</div>
            <button class="connect-tariff-btn ${isMobile ? 'mobile' : ''}" onclick="sendToTelegram('Тариф: ${tariff.operator || 'Без оператора'} - ${tariff.data || ''}, ${tariff.minutes || ''}, ${tariff.price || ''}')">
                ${isMobile ? 'Подключить' : 'Подключить'}
            </button>
        `;
        tariffsSlider.appendChild(card);
    });
    
    // Для мобильных обновляем стили карточек
    if (isMobile && tariffsSlider.children.length > 0) {
        const cards = tariffsSlider.children;
        const containerWidth = tariffsContainer ? tariffsContainer.offsetWidth : 300;
        const cardWidth = containerWidth - 40; // 20px margin с каждой стороны
        
        for (let card of cards) {
            card.style.flex = `0 0 ${cardWidth}px`;
            card.style.width = `${cardWidth}px`;
            card.style.margin = '0 10px';
        }
        
        // Устанавливаем начальную позицию для мобильных
        tariffsSlider.style.transform = 'translateX(0)';
        tariffsSlider.style.display = 'flex';
        tariffsSlider.style.flexWrap = 'nowrap';
        tariffsSlider.style.transition = 'transform 0.3s ease';
    }
}

function updateTariffsSlider() {
    if (!tariffsSlider) return;
    
    if (isMobile) {
        // Для мобильных - плавная прокрутка к центру карточки
        const container = document.querySelector('.tariffs-container');
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
    } else {
        // Для десктопа
        const cardWidthPercent = 100 / tariffsPerView;
        const offset = -currentTariffIndex * cardWidthPercent;
        tariffsSlider.style.transform = `translateX(${offset}%)`;
        tariffsSlider.style.transition = 'transform 0.3s ease';
    }
    
    updateIndicators();
}

function updateIndicators() {
    const indicators = document.querySelectorAll('.slider-indicator');
    if (indicators.length > 0) {
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentTariffIndex);
        });
    }
}

function updateNavButtons() {
    if (!prevTariffBtn || !nextTariffBtn) return;
    
    const maxIndex = Math.max(0, tariffsData.length - tariffsPerView);
    
    // Для мобильных скрываем кнопки навигации
    if (isMobile) {
        prevTariffBtn.style.display = 'none';
        nextTariffBtn.style.display = 'none';
        return;
    }
    
    prevTariffBtn.style.display = 'flex';
    nextTariffBtn.style.display = 'flex';
    
    prevTariffBtn.disabled = currentTariffIndex <= 0;
    prevTariffBtn.style.opacity = prevTariffBtn.disabled ? '0.5' : '1';
    prevTariffBtn.style.cursor = prevTariffBtn.disabled ? 'not-allowed' : 'pointer';
    
    nextTariffBtn.disabled = currentTariffIndex >= maxIndex;
    nextTariffBtn.style.opacity = nextTariffBtn.disabled ? '0.5' : '1';
    nextTariffBtn.style.cursor = nextTariffBtn.disabled ? 'not-allowed' : 'pointer';
}

function updateTariffsPerView() {
    const width = window.innerWidth;
    
    if (width < 576) {
        tariffsPerView = 1;
    } else if (width < 768) {
        tariffsPerView = 1;
    } else if (width < 992) {
        tariffsPerView = 2;
    } else if (width < 1200) {
        tariffsPerView = 3;
    } else {
        tariffsPerView = 3;
    }

    const maxIndex = Math.max(0, tariffsData.length - tariffsPerView);
    if (currentTariffIndex > maxIndex) {
        currentTariffIndex = Math.max(0, maxIndex);
    }
}

// Инициализация индикаторов слайдера
document.addEventListener('DOMContentLoaded', function() {
    const indicators = document.querySelectorAll('.slider-indicator');
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            currentTariffIndex = index;
            updateTariffsSlider();
            updateNavButtons();
        });
    });
});

// Функция для принудительного обновления данных
function refreshData() {
    console.log('Обновление данных из LocalStorage...');
    loadDataFromStorage();
    renderAllMobileOptimized();
}

// Функция для перерисовки всех данных
function renderAll() {
    renderMasksMobile();
    renderNumbersMobile();
    renderTariffsMobile();
    updateTariffsSlider();
    updateNavButtons();
}

// Экспортируем функции для использования в консоли браузера
window.refreshData = refreshData;
window.renderAll = renderAll;
window.checkMobile = checkMobile;

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

let currentNumbersDisplayed = 4;
let currentTariffIndex = 0;
let tariffsPerView = 3;
let isMobile = false;
let isScrolling = false;

const TELEGRAM_USERNAME = "ne_kaktus";

function sendToTelegram(message) {
    const url = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем мобильное устройство
    checkMobile();
    updateSwipeHint();
    
    renderNumbers();
    
    viewAllBtn.addEventListener('click', function() {
        currentNumbersDisplayed += 2;
        renderNumbers();
        
        if (currentNumbersDisplayed >= numbersData.length) {
            this.style.display = 'none';
        }
    });

    renderTariffs();
    updateTariffsSlider();
    updateNavButtons();
    
    // Оптимизированная реализация свайпа
    initOptimizedSwipe();
    
    // Кнопки навигации
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

    // ПОИСК - ИСПРАВЛЕННЫЙ ВАРИАНТ 2
    if (searchBtn && phoneInput) {
        searchBtn.addEventListener('click', function() {
            const phoneNumber = phoneInput.value.trim();
            
            // Проверяем что номер заполнен полностью
            if (phoneNumber.length < 18) {
                phoneInput.style.borderColor = 'red';
                phoneInput.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.3)';
                setTimeout(() => {
                    phoneInput.style.borderColor = '';
                    phoneInput.style.boxShadow = '';
                }, 1000);
                return;
            }
            
            sendToTelegram(`Поиск номера: ${phoneNumber}`);
            phoneInput.value = '+7 (';
        });

        phoneInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
            
            // Разрешаем только цифры
            if (!/\d/.test(e.key) && e.key !== 'Enter') {
                e.preventDefault();
            }
        });

        phoneInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            
            // Если пустое - устанавливаем начало номера
            if (value.length === 0) {
                this.value = '+7 (';
                return;
            }
            
            // Ограничиваем до 10 цифр (без +7)
            if (value.length > 10) {
                value = value.substring(0, 10);
            }
            
            // Форматируем
            let formatted = '+7 (';
            
            if (value.length > 0) {
                formatted += value;
                
                if (value.length >= 3) {
                    formatted = formatted.substring(0, 7) + ') ' + formatted.substring(7);
                }
                if (value.length >= 6) {
                    formatted = formatted.substring(0, 12) + '-' + formatted.substring(12);
                }
                if (value.length >= 8) {
                    formatted = formatted.substring(0, 15) + '-' + formatted.substring(15);
                }
            }
            
            this.value = formatted;
        });

        // Инициализируем начальное значение
        phoneInput.value = '+7 (';
        
        // Фокус в конец
        phoneInput.addEventListener('focus', function() {
            if (this.value === '+7 (') {
                setTimeout(() => {
                    this.setSelectionRange(4, 4);
                }, 0);
            }
        });
    }

    // Остальные кнопки
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

    window.addEventListener('resize', function() {
        checkMobile();
        updateSwipeHint();
        updateTariffsPerView();
        updateTariffsSlider();
        updateNavButtons();
    });
});

// Оптимизированная реализация свайпа
function initOptimizedSwipe() {
    if (!tariffsSlider || !tariffsContainer) return;
    
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;
    let isHorizontalMove = false;
    let scrollTimeout = null;
    
    // Обработчик начала касания
    const handleTouchStart = (e) => {
        if (!isMobile) return;
        
        isScrolling = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startScrollLeft = tariffsContainer.scrollLeft;
        startScrollTop = window.scrollY || document.documentElement.scrollTop;
        isHorizontalMove = false;
        
        // Отключаем скролл страницы
        document.body.style.overflow = 'hidden';
        tariffsContainer.style.scrollSnapType = 'none';
    };
    
    // Обработчик движения
    const handleTouchMove = (e) => {
        if (!isMobile || !isScrolling) return;
        
        e.preventDefault();
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        // Определяем, это горизонтальное или вертикальное движение
        if (!isHorizontalMove) {
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
                isHorizontalMove = true;
            } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
                isHorizontalMove = false;
                return; // Позволяем вертикальный скролл страницы
            }
        }
        
        // Если это горизонтальное движение - скроллим карусель
        if (isHorizontalMove) {
            e.stopPropagation();
            const scrollAmount = startScrollLeft - deltaX;
            tariffsContainer.scrollLeft = scrollAmount;
        }
    };
    
    // Обработчик окончания касания
    const handleTouchEnd = (e) => {
        if (!isMobile) return;
        
        isScrolling = false;
        document.body.style.overflow = '';
        tariffsContainer.style.scrollSnapType = 'x mandatory';
        
        // Включаем привязку к ближайшей карточке
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
                currentTariffIndex = cardIndex;
                
                // Плавная прокрутка к центру карточки
                tariffsContainer.scrollTo({
                    left: nearestCard.offsetLeft - (containerRect.width - nearestCard.offsetWidth) / 2,
                    behavior: 'smooth'
                });
                
                updateNavButtons();
                updateIndicators();
            }
        }
        
        // Очищаем таймер
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isHorizontalMove = false;
        }, 300);
    };
    
    // Добавляем обработчики на контейнер, а не на слайдер
    tariffsContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    tariffsContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    tariffsContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Предотвращаем зум страницы при касании карусели
    tariffsContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Предотвращаем контекстное меню при долгом касании
    tariffsContainer.addEventListener('contextmenu', (e) => {
        if (isMobile) e.preventDefault();
    });
}

// Функции для свайпа
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

function renderNumbers() {
    if (!numbersGrid) return;
    numbersGrid.innerHTML = '';
    numbersData.slice(0, currentNumbersDisplayed).forEach(number => {
        const card = document.createElement('div');
        card.className = 'number-card';
        card.innerHTML = `
            <div class="card-header">
                <span class="category-label">${number.category}</span>
                ${number.badge ? `<span class="golden-badge">${number.badge}</span>` : ''}
            </div>
            <div class="phone-number">${number.number}</div>
            <div class="card-footer">
                <button class="select-number-btn" onclick="sendToTelegram('Номер: ${number.number}')">
                    Выбрать номер
                </button>
            </div>
        `;
        numbersGrid.appendChild(card);
    });
}

function renderTariffs() {
    if (!tariffsSlider) return;
    tariffsSlider.innerHTML = '';
    tariffsData.forEach((tariff, index) => {
        const card = document.createElement('div');
        card.className = 'tariff-card';
        card.dataset.index = index;
        card.innerHTML = `
            <div class="operator-name">${tariff.operator}</div>
            <div class="tariff-info">${tariff.data} · ${tariff.minutes}</div>
            <div class="tariff-price">${tariff.price}</div>
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
        // Для десктопа
        const cardWidthPercent = 100 / tariffsPerView;
        const offset = -currentTariffIndex * cardWidthPercent;
        tariffsSlider.style.transform = `translateX(${offset}%)`;
        tariffsSlider.style.transition = 'transform 0.3s ease';
    } else {
        // Для мобильных - плавная прокрутка к центру карточки
        const container = document.querySelector('.tariffs-container');
        const currentCard = tariffsSlider.querySelector(`[data-index="${currentTariffIndex}"]`);
        
        if (container && currentCard) {
            const containerRect = container.getBoundingClientRect();
            const targetScroll = currentCard.offsetLeft - (containerRect.width - currentCard.offsetWidth) / 2;
            
            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
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
    
    const maxIndex = tariffsData.length - tariffsPerView;
    
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

    const maxIndex = tariffsData.length - tariffsPerView;
    if (currentTariffIndex > maxIndex) {
        currentTariffIndex = Math.max(0, maxIndex);
    }
}

// Клики по индикаторам
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


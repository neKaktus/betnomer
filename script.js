const numbersGrid = document.getElementById('numbersGrid');
const viewAllBtn = document.getElementById('viewAllBtn');
const tariffsSlider = document.getElementById('tariffsSlider');
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
    
    // Простая реализация свайпа для мобильных
    initSimpleSwipe();
    
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

    // Поиск
    if (searchBtn && phoneInput) {
        searchBtn.addEventListener('click', function() {
            const phoneNumber = phoneInput.value.trim();
            if (!phoneNumber || phoneNumber === '+7 (') {
                phoneInput.style.borderColor = 'red';
                setTimeout(() => phoneInput.style.borderColor = '', 1000);
                return;
            }
            
            sendToTelegram(`Поиск номера: ${phoneNumber}`);
            phoneInput.value = '';
        });

        phoneInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });

        phoneInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            
            if (value.length > 0) value = '+7 (' + value;
            if (value.length > 7) value = value.slice(0, 7) + ') ' + value.slice(7);
            if (value.length > 12) value = value.slice(0, 12) + '-' + value.slice(12);
            if (value.length > 15) value = value.slice(0, 15) + '-' + value.slice(15, 17);
            
            this.value = value;
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

// Упрощенная реализация свайпа
function initSimpleSwipe() {
    if (!tariffsSlider) return;
    
    let startX = 0;
    let scrollLeft = 0;
    
    tariffsSlider.addEventListener('touchstart', function(e) {
        if (!isMobile) return;
        
        startX = e.touches[0].pageX - tariffsSlider.offsetLeft;
        scrollLeft = tariffsSlider.scrollLeft;
    });
    
    tariffsSlider.addEventListener('touchmove', function(e) {
        if (!isMobile) return;
        
        e.preventDefault();
        const x = e.touches[0].pageX - tariffsSlider.offsetLeft;
        const walk = (x - startX) * 2; // Умножаем для более плавного скролла
        tariffsSlider.scrollLeft = scrollLeft - walk;
    });
}

// Функции для свайпа
function checkMobile() {
    isMobile = window.innerWidth <= 768;
    // Обновляем количество видимых тарифов
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
    
    // Для десктопа используем трансформацию
    if (!isMobile) {
        const cardWidthPercent = 100 / tariffsPerView;
        const offset = -currentTariffIndex * cardWidthPercent;
        tariffsSlider.style.transform = `translateX(${offset}%)`;
        tariffsSlider.style.transition = 'transform 0.3s ease';
    } else {
        // Для мобильных просто показываем все карточки в ряд
        // Прокрутка будет работать через CSS overflow-x: auto
        tariffsSlider.style.transform = 'none';
        tariffsSlider.style.transition = 'none';
        
        // Прокручиваем к текущему слайду
        const currentCard = tariffsSlider.querySelector(`[data-index="${currentTariffIndex}"]`);
        if (currentCard) {
            currentCard.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
    
    // Обновляем индикаторы
    updateIndicators();
}

function updateIndicators() {
    const indicators = document.querySelectorAll('.slider-indicator');
    if (indicators.length > 0) {
        indicators.forEach((indicator, index) => {
            if (index === currentTariffIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
}

function updateNavButtons() {
    if (!prevTariffBtn || !nextTariffBtn) return;
    
    const maxIndex = tariffsData.length - tariffsPerView;
    
    if (currentTariffIndex <= 0) {
        prevTariffBtn.disabled = true;
        prevTariffBtn.style.opacity = '0.5';
        prevTariffBtn.style.cursor = 'not-allowed';
    } else {
        prevTariffBtn.disabled = false;
        prevTariffBtn.style.opacity = '1';
        prevTariffBtn.style.cursor = 'pointer';
    }
    
    if (currentTariffIndex >= maxIndex) {
        nextTariffBtn.disabled = true;
        nextTariffBtn.style.opacity = '0.5';
        nextTariffBtn.style.cursor = 'not-allowed';
    } else {
        nextTariffBtn.disabled = false;
        nextTariffBtn.style.opacity = '1';
        nextTariffBtn.style.cursor = 'pointer';
    }
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

// Добавляем клики по индикаторам
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


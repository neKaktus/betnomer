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

const TELEGRAM_USERNAME = "ne_kaktus";

function sendToTelegram(message) {
    const url = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
  
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
    
 
    prevTariffBtn.addEventListener('click', function() {
        if (currentTariffIndex > 0) {
            currentTariffIndex--;
            updateTariffsSlider();
            updateNavButtons();
        }
    });

    nextTariffBtn.addEventListener('click', function() {
        const maxIndex = tariffsData.length - tariffsPerView;
        if (currentTariffIndex < maxIndex) {
            currentTariffIndex++;
            updateTariffsSlider();
            updateNavButtons();
        }
    });

    // Поиск
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


    pickTariffBtn.addEventListener('click', function() {
        sendToTelegram('Подбор тарифа');
    });

    orderBtn.addEventListener('click', function() {
        sendToTelegram('Заказ услуги');
    });

    callbackBtn.addEventListener('click', function() {
        sendToTelegram('Обратный звонок');
    });

    window.addEventListener('resize', function() {
        updateTariffsPerView();
        updateTariffsSlider();
        updateNavButtons();
    });
});

function renderNumbers() {
    numbersGrid.innerHTML = '';
    numbersData.slice(0, currentNumbersDisplayed).forEach(number => {
        const card = document.createElement('div');
        card.className = 'number-card';
        card.innerHTML = `
            <div class="category-label">${number.category}</div>
            ${number.badge ? `<span class="number-badge">${number.badge}</span>` : ''}
            <div class="phone-number">${number.number}</div>
            <button class="select-number-btn" onclick="sendToTelegram('Номер: ${number.number}')">
                Выбрать номер
            </button>
        `;
        numbersGrid.appendChild(card);
    });
}


function renderTariffs() {
    tariffsSlider.innerHTML = '';
    tariffsData.forEach(tariff => {
        const card = document.createElement('div');
        card.className = 'tariff-card';
        card.style.flex = `0 0 calc(${100 / tariffsPerView}% - 20px)`; // Важно!
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
    const cardWidth = 100 / tariffsPerView;
    const offset = -currentTariffIndex * cardWidth;
    tariffsSlider.style.transform = `translateX(${offset}%)`;
}

function updateNavButtons() {
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

    renderTariffs();
    
    const maxIndex = tariffsData.length - tariffsPerView;
    if (currentTariffIndex > maxIndex) {
        currentTariffIndex = Math.max(0, maxIndex);
    }
}

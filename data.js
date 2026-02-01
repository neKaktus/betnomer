
const masksData = [
    {
        id: "AAAAAAA",
        name: "AAA-AA-AA",
        description: "Семь одинаковых цифр"
    },
    {
        id: "ABCABAB",
        name: "ABC-AB-AB",
        description: "Повторяющийся паттерн"
    },
    {
        id: "ABCABCA",
        name: "ABC-AB-CA",
        description: "Зеркальный паттерн"
    },
    {
        id: "AABBCCD",
        name: "AAB-BC-CD",
        description: "Последовательные пары"
    },
    {
        id: "ABCDABC",
        name: "ABC-DA-BC",
        description: "Комбинированный паттерн"
    }
];

const numbersData = [
    {
        id: 1,
        mask: "AAAAAAA",
        number: "+7 (999) 777-77-77",
        price: "150 000 ₽",
        badge: "vip"
    },
    {
        id: 2,
        mask: "AAAAAAA",
        number: "+7 (905) 555-55-55",
        price: "85 000 ₽",
        badge: "hit"
    },
    {
        id: 3,
        mask: "AAAAAAA",
        number: "+7 (916) 111-11-11",
        price: "120 000 ₽",
        badge: "vip"
    },
    {
        id: 4,
        mask: "AAAAAAA",
        number: "+7 (985) 222-22-22",
        price: "95 000 ₽",
        badge: ""
    },
    {
        id: 5,
        mask: "AAAAAAA",
        number: "+7 (903) 333-33-33",
        price: "75 000 ₽",
        badge: "sale"
    },
    {
        id: 6,
        mask: "AAAAAAA",
        number: "+7 (999) 888-88-88",
        price: "180 000 ₽",
        badge: "vip"
    },
    {
        id: 7,
        mask: "AAAAAAA",
        number: "+7 (999) 999-99-99",
        price: "500 000 ₽",
        badge: "vip"
    },
    {
        id: 8,
        mask: "ABCABAB",
        number: "+7 (900) 393-93-93",
        price: "25 000 ₽",
        badge: "new"
    },
    {
        id: 9,
        mask: "ABCABAB",
        number: "+7 (900) 101-01-01",
        price: "35 000 ₽",
        badge: "hit"
    },
    {
        id: 10,
        mask: "ABCABAB",
        number: "+7 (977) 202-02-02",
        price: "28 000 ₽",
        badge: ""
    },
    {
        id: 11,
        mask: "ABCABAB",
        number: "+7 (900) 909-09-09",
        price: "45 000 ₽",
        badge: "sale"
    },
    {
        id: 12,
        mask: "ABCABAB",
        number: "+7 (977) 808-08-08",
        price: "32 000 ₽",
        badge: ""
    },
    {
        id: 13,
        mask: "ABCABCA",
        number: "+7 (926) 444-44-44",
        price: "55 000 ₽",
        badge: "hit"
    },
    {
        id: 14,
        mask: "ABCABCA",
        number: "+7 (909) 555-55-55",
        price: "48 000 ₽",
        badge: ""
    },
    {
        id: 15,
        mask: "ABCABCA",
        number: "+7 (925) 666-66-66",
        price: "62 000 ₽",
        badge: "new"
    },
    {
        id: 16,
        mask: "ABCABCA",
        number: "+7 (916) 303-03-03",
        price: "38 000 ₽",
        badge: "sale"
    },
    {
        id: 17,
        mask: "AABBCCD",
        number: "+7 (977) 600-00-00",
        price: "42 000 ₽",
        badge: ""
    },
    {
        id: 18,
        mask: "AABBCCD",
        number: "+7 (905) 111-11-11",
        price: "58 000 ₽",
        badge: "hit"
    },
    {
        id: 19,
        mask: "AABBCCD",
        number: "+7 (985) 404-04-04",
        price: "22 000 ₽",
        badge: "sale"
    },
    {
        id: 20,
        mask: "AABBCCD",
        number: "+7 (903) 505-05-05",
        price: "27 000 ₽",
        badge: ""
    },
    {
        id: 21,
        mask: "ABCDABC",
        number: "+7 (926) 606-06-06",
        price: "33 000 ₽",
        badge: "new"
    },
    {
        id: 22,
        mask: "ABCDABC",
        number: "+7 (909) 707-07-07",
        price: "29 000 ₽",
        badge: ""
    },
    {
        id: 23,
        mask: "ABCDABC",
        number: "+7 (925) 808-08-08",
        price: "36 000 ₽",
        badge: "hit"
    },
    {
        id: 24,
        mask: "ABCDABC",
        number: "+7 (905) 000-00-00",
        price: "95 000 ₽",
        badge: "vip"
    },
    {
        id: 25,
        mask: "ABCDABC",
        number: "+7 (916) 707-07-07",
        price: "31 000 ₽",
        badge: ""
    }
];

const tariffsData = [
    {
        id: 1,
        operator: "Beeline",
        data: "50 ГБ",
        minutes: "1500 мин.",
        price: "399 ₽/мес."
    },
    {
        id: 2,
        operator: "МЕГАФОН",
        data: "70 ГБ",
        minutes: "2000 мин.",
        price: "499 ₽/мес."
    },
    {
        id: 3,
        operator: "МТС",
        data: "100 ГБ",
        minutes: "3000 мин.",
        price: "599 ₽/мес."
    },
    {
        id: 4,
        operator: "Tele2",
        data: "30 ГБ",
        minutes: "1000 мин.",
        price: "299 ₽/мес."
    },
    {
        id: 5,
        operator: "Yota",
        data: "80 ГБ",
        minutes: "2500 мин.",
        price: "549 ₽/мес."
    }
];

const TELEGRAM_ACCOUNT = "https://t.me/bestnomer_bot";

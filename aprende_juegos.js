// ============================================
// IDIOMA — cambia texto, sincroniza las píldoras y guarda preferencia
// ------------------------------------------------------------------
// IMPORTANTE: cada elemento traducible necesita data-es/data-en en el
// nodo MÁS INTERNO posible (ej. el <span class="nav-label">), nunca
// en un <a> o <div> que tenga otros elementos adentro (íconos, etc.),
// porque esta función hace textContent = ... y borraría todo lo que
// hay dentro. Ese era el bug del link "Inicio": tenía data-es/data-en
// en el <a> en vez de en el <span>, y al cambiar de idioma se borraba
// el ícono de la casa.
// ============================================
const IDIOMAS = {
    es: { code: 'ES', label: 'Español', flag: 'img/spain.png' },
    en: { code: 'EN', label: 'English', flag: 'img/ingles.png' }
};

function setLang(lang) {
    document.querySelectorAll('[data-es][data-en]').forEach(el => {
        // Si este elemento contiene OTRO elemento traducible adentro,
        // lo saltamos: si le hacemos textContent al padre, borraríamos
        // el HTML (y por lo tanto el hijo) que tiene dentro.
        if (el.querySelector('[data-es][data-en]')) return;
        el.textContent = el.dataset[lang];
    });

    // --- Banderas sueltas de escritorio (.language-switcher) ---
    document.querySelectorAll('.language-switcher img').forEach(img => {
        img.classList.remove('active');
    });
    const activeFlag = document.querySelector(
        `.language-switcher img[alt="${lang === 'es' ? 'ES' : 'EN'}"]`
    );
    if (activeFlag) activeFlag.classList.add('active');

    // --- Las dos píldoras (topbar y panel) ---
    const info = IDIOMAS[lang] || IDIOMAS.es;
    document.querySelectorAll('[data-lang-flag]').forEach(img => {
        img.src = info.flag;
    });
    document.querySelectorAll('[data-lang-code]').forEach(span => {
        span.textContent = info.code;
    });
    document.querySelectorAll('[data-lang-label]').forEach(span => {
        span.textContent = info.label;
    });
    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });

    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
}

document.addEventListener('DOMContentLoaded', () => {
    const lang = localStorage.getItem('lang') || 'es';
    setLang(lang);
    setActiveNavLink();
});


// ============================================
// PÍLDORAS DE IDIOMA — abrir/cerrar cada lista desplegable
// ============================================
function configurarSelectorIdioma(botonId, listaId) {
    const boton = document.getElementById(botonId);
    const lista = document.getElementById(listaId);
    if (!boton || !lista) return;

    boton.addEventListener('click', (e) => {
        e.stopPropagation();
        const abierta = lista.classList.contains('open');
        document.querySelectorAll('.lang-dropdown.open').forEach(l => l.classList.remove('open'));
        document.querySelectorAll('.lang-current[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false'));

        if (!abierta) {
            lista.classList.add('open');
            boton.setAttribute('aria-expanded', 'true');
        }
    });

    lista.querySelectorAll('.lang-option').forEach(opcion => {
        opcion.addEventListener('click', () => {
            setLang(opcion.dataset.lang);
            lista.classList.remove('open');
            boton.setAttribute('aria-expanded', 'false');
        });
    });
}

configurarSelectorIdioma('langToggleTop', 'langDropdownTop');
configurarSelectorIdioma('langTogglePanel', 'langDropdownPanel');

document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-lang-topbar') && !e.target.closest('.nav-lang-mobile')) {
        document.querySelectorAll('.lang-dropdown.open').forEach(l => l.classList.remove('open'));
        document.querySelectorAll('.lang-current[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    }
});


// ============================================
// DROPDOWN — hover en escritorio, click/acordeón en táctil
// ============================================
document.querySelectorAll('.nav-item.dropdown').forEach(item => {
    let timer;
    const trigger = item.querySelector(':scope > a');

    item.addEventListener('mouseenter', () => {
        const isTouch = window.matchMedia('(hover: none)').matches;
        if (isTouch) return;
        clearTimeout(timer);
        item.classList.add('open');
    });

    item.addEventListener('mouseleave', () => {
        const isTouch = window.matchMedia('(hover: none)').matches;
        if (isTouch) return;
        timer = setTimeout(() => item.classList.remove('open'), 150);
    });

    if (trigger) {
        trigger.addEventListener('click', (e) => {
            const esPanelMovil = window.matchMedia('(max-width: 900px)').matches;
            if (esPanelMovil) {
                e.preventDefault();
                document.querySelectorAll('.nav-item.dropdown.open').forEach(open => {
                    if (open !== item) open.classList.remove('open');
                });
                item.classList.toggle('open');
                return;
            }

            const isTouch = window.matchMedia('(hover: none)').matches;
            if (isTouch && !item.classList.contains('open')) {
                e.preventDefault();
                document.querySelectorAll('.nav-item.dropdown.open').forEach(open => {
                    if (open !== item) open.classList.remove('open');
                });
                item.classList.add('open');
            }
        });
    }
});

document.addEventListener('click', (e) => {
    const esPanelMovil = window.matchMedia('(max-width: 900px)').matches;
    if (esPanelMovil) return;
    if (!e.target.closest('.nav-item.dropdown')) {
        document.querySelectorAll('.nav-item.dropdown.open').forEach(item => {
            item.classList.remove('open');
        });
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.nav-item.dropdown.open').forEach(item => {
            item.classList.remove('open');
        });
    }
});


// ============================================
// MENÚ HAMBURGUESA — panel de navegación móvil
// ============================================
const navToggle = document.getElementById('navToggle');
const navClose = document.getElementById('navClose');
const mainNav = document.getElementById('mainNav');
const navBackdrop = document.getElementById('navBackdrop');

function abrirMenuMovil() {
    mainNav.classList.add('nav-open');
    navBackdrop.classList.add('visible');
    navToggle.classList.add('is-active');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-no-scroll');
}

function cerrarMenuMovil() {
    mainNav.classList.remove('nav-open');
    navBackdrop.classList.remove('visible');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-no-scroll');
    document.querySelectorAll('.nav-item.dropdown.open').forEach(item => item.classList.remove('open'));
    const langDropdownPanel = document.getElementById('langDropdownPanel');
    const langTogglePanel = document.getElementById('langTogglePanel');
    if (langDropdownPanel) langDropdownPanel.classList.remove('open');
    if (langTogglePanel) langTogglePanel.setAttribute('aria-expanded', 'false');
}

if (navToggle && mainNav && navBackdrop) {

    navToggle.addEventListener('click', () => {
        const yaEstaAbierto = mainNav.classList.contains('nav-open');
        yaEstaAbierto ? cerrarMenuMovil() : abrirMenuMovil();
    });

    if (navClose) {
        navClose.addEventListener('click', cerrarMenuMovil);
    }

    navBackdrop.addEventListener('click', cerrarMenuMovil);

    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            const esPanelMovil = window.matchMedia('(max-width: 900px)').matches;
            const dropdownPadre = link.closest('.nav-item.dropdown');
            const esTriggerDeSubmenu = dropdownPadre && dropdownPadre.querySelector(':scope > a') === link;

            if (esPanelMovil && esTriggerDeSubmenu) {
                return;
            }
            cerrarMenuMovil();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarMenuMovil();
    });
}


// ============================================
// HEADER — efecto scroll
// ============================================
window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 50);
});


// ============================================
// NAV — link activo según la página actual
// ------------------------------------------------------------------
// Además de marcar el link exacto, resalta también el padre cuando
// la página activa está dentro de un submenú (ej. "Juegos" adentro
// de "Aprende" marca a "Aprende" también).
// ============================================
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPage);
    });

    document.querySelectorAll('.dropdown-menu a.active').forEach(activeSubLink => {
        const parentItem = activeSubLink.closest('.nav-item');
        const parentTrigger = parentItem && parentItem.querySelector(':scope > a');
        if (parentTrigger) parentTrigger.classList.add('active');
    });
}

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});


// ============================================
// LINEA SCROLL
// ============================================
(() => {
    const progress = document.querySelector(".vaulty-page-progress");
    if (!progress) return;

    let animationFrame = null;

    const updateProgress = () => {
        const page = document.documentElement;
        const scrollableHeight = page.scrollHeight - window.innerHeight;
        const amount = scrollableHeight > 0
            ? Math.min(Math.max(window.scrollY / scrollableHeight, 0), 1)
            : 1;

        progress.style.setProperty("--vaulty-progress", amount.toFixed(4));
        animationFrame = null;
    };

    const requestUpdate = () => {
        if (animationFrame !== null) return;
        animationFrame = window.requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("load", requestUpdate);
    requestUpdate();
})();


// ============================================
// BOTONES DE LAS TARJETAS DE JUEGOS — efecto ripple al hacer click
// ------------------------------------------------------------------
// Específico de esta página (no forma parte del nav reutilizable).
// ============================================
document.querySelectorAll('.card-title').forEach(button => {
    button.addEventListener('click', function (e) {
        e.preventDefault(); // esperamos a que termine la animación para navegar
        const link = this;
        const rect = link.getBoundingClientRect();

        const size = Math.max(rect.width, rect.height);

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        link.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
            window.location.href = link.href;
        }, 350);
    });
});


// ============================================
// ASISTENTE
// ============================================
const preguntas = [

    {
        pregunta: "¿Qué es un presupuesto?",
        respuesta: "Un presupuesto es un plan que te ayuda a organizar tus ingresos y gastos para administrar mejor tu dinero."
    },
    {
        pregunta: "¿Qué es el ahorro?",
        respuesta: "El ahorro consiste en guardar una parte de tu dinero para cumplir metas o enfrentar imprevistos en el futuro."
    },
    {
        pregunta: "¿Qué es una tarjeta de crédito?",
        respuesta: "Es un medio de pago que te permite comprar ahora y pagar después. Si no pagas a tiempo, pueden generarse intereses."
    },
    {
        pregunta: "¿Qué es un fondo de emergencia?",
        respuesta: "Es dinero reservado para cubrir gastos inesperados, como una enfermedad, una reparación o la pérdida de empleo."
    },
    {
        pregunta: "¿Por qué es importante invertir?",
        respuesta: "Invertir permite que tu dinero pueda crecer con el tiempo, ayudándote a alcanzar metas financieras a largo plazo."
    },
    {
        pregunta: "¿Qué es la inflación?",
        respuesta: "Es el aumento generalizado de los precios con el tiempo, lo que hace que tu dinero pierda poder de compra."
    },
    {
        pregunta: "¿Qué es el interés compuesto?",
        respuesta: "Es cuando ganas intereses no solo sobre tu dinero inicial, sino también sobre los intereses ya acumulados. Con el tiempo, hace crecer tu ahorro mucho más rápido."
    },
    {
        pregunta: "¿Qué es el historial crediticio?",
        respuesta: "Es un registro de cómo has manejado tus deudas y pagos. Un buen historial te ayuda a acceder a préstamos con mejores condiciones."
    },
    {
        pregunta: "¿Cómo puedo empezar a ahorrar?",
        respuesta: "Empieza por anotar tus gastos, define una meta clara y separa un porcentaje fijo de tus ingresos apenas los recibas, aunque sea poco."
    },
    {
        pregunta: "¿Qué diferencia hay entre ahorrar e invertir?",
        respuesta: "Ahorrar es guardar dinero de forma segura y disponible. Invertir es poner tu dinero a trabajar para que crezca, aunque implica cierto riesgo."
    },
    {
        pregunta: "¿Qué son las deudas buenas y malas?",
        respuesta: "Una deuda 'buena' te ayuda a generar valor a futuro, como estudiar o emprender. Una deuda 'mala' financia gastos que pierden valor rápido, como compras impulsivas."
    },
    {
        pregunta: "¿Cómo evito gastar de más?",
        respuesta: "Lleva un control de tus gastos, distingue entre lo que necesitas y lo que quieres, y espera antes de hacer compras grandes no planeadas."
    }

];

const strixBtn = document.getElementById("strix-btn");
const cerrarChat = document.getElementById("cerrar-chat");
const asistente = document.getElementById("asistente");
const preguntasDiv = document.getElementById("preguntas");
const mensajesDiv = document.getElementById("mensajes");

strixBtn.addEventListener("click", () => {
    asistente.classList.toggle("abierto");
});

cerrarChat.addEventListener("click", () => {
    asistente.classList.remove("abierto");
});

preguntas.forEach(item => {

    const botonPregunta = document.createElement("button");
    botonPregunta.type = "button";
    botonPregunta.textContent = item.pregunta;

    botonPregunta.addEventListener("click", () => {

        const preguntaUsuario = document.createElement("div");
        preguntaUsuario.classList.add("pregunta-usuario");
        preguntaUsuario.textContent = item.pregunta;
        mensajesDiv.appendChild(preguntaUsuario);
        mensajesDiv.scrollTop = mensajesDiv.scrollHeight;

        setTimeout(() => {
            const respuestaBot = document.createElement("div");
            respuestaBot.classList.add("respuesta");
            respuestaBot.textContent = item.respuesta;
            mensajesDiv.appendChild(respuestaBot);
            mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
        }, 500);

    });

    preguntasDiv.appendChild(botonPregunta);

});
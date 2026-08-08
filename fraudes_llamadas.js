// ============================================
// IDIOMA — cambia texto, sincroniza las píldoras y guarda preferencia
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

    // Imágenes que tengan versión distinta según el idioma
    document.querySelectorAll('[data-img-es][data-img-en]').forEach(img => {
        img.src = lang === 'es' ? img.dataset.imgEs : img.dataset.imgEn;
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
        // Cierra cualquier otra lista de idioma que haya quedado abierta
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

// Cierra cualquier lista de idioma abierta si se toca fuera de ella
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
        if (isTouch) return; // en mobile esto lo maneja el click de abajo
        clearTimeout(timer);
        item.classList.add('open');
    });

    item.addEventListener('mouseleave', () => {
        const isTouch = window.matchMedia('(hover: none)').matches;
        if (isTouch) return;
        timer = setTimeout(() => item.classList.remove('open'), 150);
    });

    // En pantallas táctiles / mobile no existe "hover": el link con
    // submenú se comporta como acordeón (abre/cierra al tocarlo) en
    // vez de navegar directo.
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

// Cierra cualquier dropdown abierto si se hace click fuera de él
// (solo aplica al modo escritorio/flotante; en el panel mobile el
// acordeón se cierra solo al tocar otro item o al cerrar el panel)
document.addEventListener('click', (e) => {
    const esPanelMovil = window.matchMedia('(max-width: 900px)').matches;
    if (esPanelMovil) return;
    if (!e.target.closest('.nav-item.dropdown')) {
        document.querySelectorAll('.nav-item.dropdown.open').forEach(item => {
            item.classList.remove('open');
        });
    }
});

// Cierra el dropdown abierto con la tecla Escape
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
    document.body.classList.add('nav-no-scroll'); // evita que el fondo scrollee detrás del panel
}

function cerrarMenuMovil() {
    mainNav.classList.remove('nav-open');
    navBackdrop.classList.remove('visible');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-no-scroll');
    // Al cerrar, también colapsamos cualquier submenú que haya
    // quedado abierto como acordeón, para que la próxima vez que se
    // abra el panel empiece "limpio"
    document.querySelectorAll('.nav-item.dropdown.open').forEach(item => item.classList.remove('open'));
    // Y cerramos el selector de idioma del panel si estaba abierto
    const langDropdownPanel = document.getElementById('langDropdownPanel');
    const langTogglePanel = document.getElementById('langTogglePanel');
    if (langDropdownPanel) langDropdownPanel.classList.remove('open');
    if (langTogglePanel) langTogglePanel.setAttribute('aria-expanded', 'false');
}

if (navToggle && mainNav && navBackdrop) {

    // Abre o cierra el panel al tocar el botón hamburguesa
    navToggle.addEventListener('click', () => {
        const yaEstaAbierto = mainNav.classList.contains('nav-open');
        yaEstaAbierto ? cerrarMenuMovil() : abrirMenuMovil();
    });

    // Botón "×" propio del panel
    if (navClose) {
        navClose.addEventListener('click', cerrarMenuMovil);
    }

    // Toca afuera del panel (sobre el fondo oscuro) para cerrarlo
    navBackdrop.addEventListener('click', cerrarMenuMovil);

    // Cierra el panel al elegir un link real (no un trigger de
    // submenú, eso ya lo maneja el bloque DROPDOWN de arriba)
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            const esPanelMovil = window.matchMedia('(max-width: 900px)').matches;
            const dropdownPadre = link.closest('.nav-item.dropdown');
            const esTriggerDeSubmenu = dropdownPadre && dropdownPadre.querySelector(':scope > a') === link;

            if (esPanelMovil && esTriggerDeSubmenu) {
                return; // este tap solo abre/cierra el acordeón, no navega
            }
            cerrarMenuMovil();
        });
    });

    // Cierra el panel con la tecla Escape
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
// ============================================
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPage);
    });
}

// Además, al hacer click marcamos el link de inmediato (cubre los casos
// con href="#" como Preguntas Frecuentes o Contacto, que no recargan
// la página y por lo tanto no disparan setActiveNavLink otra vez).
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
// MÉTODOS COMUNES — toggle de tarjetas
// ============================================
const metodos = document.querySelectorAll('.metodo-item');

metodos.forEach(item => {
    item.querySelector('.card-metodo').addEventListener('click', () => {
        metodos.forEach(card => {
            if (card !== item) card.classList.remove('active');
        });
        item.classList.toggle('active');
    });
});


// ============================================
// REVEAL AL HACER SCROLL
// ------------------------------------------------------------------
// Cualquier elemento con clase ".reveal" (tarjetas de "Qué son las
// llamadas fraudulentas", señales de alerta, comparación de llamadas,
// el nuevo diagrama-imagen, palabras de alerta y las tarjetas de
// Herramientas) aparece con una animación suave al entrar en pantalla.
// ============================================
(() => {
    const elementosReveal = document.querySelectorAll('.reveal');
    if (!elementosReveal.length) return;

    if (!('IntersectionObserver' in window)) {
        elementosReveal.forEach(el => el.classList.add('reveal-visible'));
        return;
    }

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('reveal-visible');
                observador.unobserve(entrada.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    elementosReveal.forEach(el => observador.observe(el));
})();


// ============================================
// ASISTENTE
// ============================================
const preguntas = [
    {
        pregunta: "¿Qué es una llamada fraudulenta?",
        respuesta: "Es una llamada de alguien que se hace pasar por tu banco u otra institución para engañarte y obtener tu información personal o financiera."
    },
    {
        pregunta: "¿Qué nunca debo dar por teléfono?",
        respuesta: "Nunca compartas contraseñas, PIN o códigos de verificación por teléfono. Ninguna institución seria te los pedirá así."
    },
    {
        pregunta: "¿Qué hago si recibo una llamada sospechosa?",
        respuesta: "Cuelga y comunícate tú mismo al número oficial de la institución antes de dar cualquier información."
    },
    {
        pregunta: "¿Puede estar falsificado el número que veo en pantalla?",
        respuesta: "Sí. Los estafadores pueden falsificar el número que aparece, así que no confíes solo en eso."
    }
];

const strixBtn = document.getElementById("strix-btn");
const cerrarChat = document.getElementById("cerrar-chat");
const asistente = document.getElementById("asistente");
const preguntasDiv = document.getElementById("preguntas");
const mensajesDiv = document.getElementById("mensajes");

if (strixBtn && cerrarChat && asistente) {

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
}
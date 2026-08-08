document.documentElement.classList.add("js");

// ============================================
// IDIOMA — cambia texto y guarda preferencia
// ------------------------------------------------------------------
// Mismo comportamiento que index.js / finanzas.js: la bandera activa
// se marca sobre las imágenes de .language-switcher (esta página usa
// <img onclick="setLang(...)">, no botones con data-lang).
// ============================================
function setLang(lang) {
    const idioma = lang === "en" ? "en" : "es";

    document.querySelectorAll("[data-es][data-en]").forEach((elemento) => {
        // Si el elemento tiene OTRO elemento traducible adentro, lo
        // saltamos para no borrar ese hijo al hacerle textContent.
        if (elemento.querySelector("[data-es][data-en]")) return;
        elemento.textContent = elemento.dataset[idioma];
    });

    document.querySelectorAll('.language-switcher img').forEach((img) => {
        img.classList.remove('active');
    });
    const banderaActiva = document.querySelector(
        `.language-switcher img[alt="${idioma === 'es' ? 'ES' : 'EN'}"]`
    );
    if (banderaActiva) banderaActiva.classList.add('active');

    document.documentElement.lang = idioma;
    localStorage.setItem("lang", idioma);
}

document.addEventListener("DOMContentLoaded", () => {
    setLang(localStorage.getItem("lang") || "es");
});


// ============================================
// DROPDOWN — hover en escritorio, click en táctil
// ============================================
document.querySelectorAll('.nav-item.dropdown').forEach(item => {
    let timer;
    const trigger = item.querySelector(':scope > a');

    item.addEventListener('mouseenter', () => {
        clearTimeout(timer);
        item.classList.add('open');
    });

    item.addEventListener('mouseleave', () => {
        timer = setTimeout(() => item.classList.remove('open'), 150);
    });

    // En pantallas táctiles no existe "hover": el primer tap abre el
    // submenú en vez de navegar directo al link.
    if (trigger) {
        trigger.addEventListener('click', (e) => {
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
// ------------------------------------------------------------------
// Mismo bloque que index.js / finanzas.js. El HTML trae el botón
// (#navToggle), el <nav id="mainNav"> y el fondo oscuro
// (#navBackdrop); el CSS ya sabe animar todo con las clases
// "is-active" / "nav-open" / "visible", acá solo las prendemos y
// apagamos.
// ============================================
const navToggle = document.getElementById('navToggle');
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
}

if (navToggle && mainNav && navBackdrop) {

    navToggle.addEventListener('click', () => {
        const yaEstaAbierto = mainNav.classList.contains('nav-open');
        yaEstaAbierto ? cerrarMenuMovil() : abrirMenuMovil();
    });

    navBackdrop.addEventListener('click', cerrarMenuMovil);

    // Cierra el panel al elegir un link real. Si el tap solo abrió un
    // submenú (Finanzas Panamá / Aprende) en táctil, no lo cerramos.
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            const isTouch = window.matchMedia('(hover: none)').matches;
            const dropdownPadre = link.closest('.nav-item.dropdown');
            const esTriggerDeSubmenu = dropdownPadre && dropdownPadre.querySelector(':scope > a') === link;

            if (isTouch && esTriggerDeSubmenu && !dropdownPadre.classList.contains('open')) {
                return; // este tap solo abrió el submenú, no navegó
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
    const header = document.getElementById('header');
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
});


// ============================================
// ANIMACIONES AL HACER SCROLL (elementos .reveal)
// ============================================
function iniciarAnimaciones() {
    const elementos = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
        elementos.forEach((elemento) => elemento.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add("visible");
            observer.unobserve(entrada.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px" });

    elementos.forEach((elemento) => observer.observe(elemento));
}

document.addEventListener("DOMContentLoaded", () => {
    iniciarAnimaciones();
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

/* ABRIR / CERRAR EL CHAT */

strixBtn.addEventListener("click", () => {
    asistente.classList.toggle("abierto");
});

cerrarChat.addEventListener("click", () => {
    asistente.classList.remove("abierto");
});

/* CREAR PREGUNTAS COMO BOTONES */

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
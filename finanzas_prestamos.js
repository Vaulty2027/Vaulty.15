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
// ENLACE ACTIVO DE NAVEGACIÓN
// ============================================

function setActiveNavLink() {
  const paginaActual = (
    window.location.pathname
      .split("/")
      .pop() || "index.html"
  ).toLowerCase();

  document
    .querySelectorAll("nav a")
    .forEach((enlace) => {
      enlace.classList.remove("active");
    });

  /*
   * Buscar primero una coincidencia exacta.
   */
  let enlaceActivo =
    document.querySelector(
      `nav a[href="${paginaActual}"]`
    );

  /*
   * Si no existe, buscar por prefijo.
   */
  if (!enlaceActivo) {
    const prefijo =
      paginaActual.split("_")[0];

    enlaceActivo =
      document.querySelector(
        `nav a[href^="${prefijo}_"],
         nav a[href="${prefijo}.html"]`
      );
  }

  if (!enlaceActivo) {
    return;
  }

  enlaceActivo.classList.add("active");

  const itemPadre =
    enlaceActivo.closest(".nav-item");

  if (!itemPadre) {
    return;
  }

  const enlacePrincipal =
    itemPadre.querySelector(
      ":scope > a"
    );

  if (enlacePrincipal) {
    enlacePrincipal.classList.add(
      "active"
    );
  }
}


// ============================================
// ANIMACIONES DE ENTRADA
// ============================================

function iniciarAnimaciones() {
  const elementos =
    document.querySelectorAll(
      ".tipo-card, .quien-item, .topic-card"
    );

  if (
    !("IntersectionObserver" in window)
  ) {
    elementos.forEach((elemento) => {
      elemento.style.opacity = "1";

      elemento.style.transform =
        "translateY(0)";
    });

    return;
  }

  const observador =
    new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) {
            return;
          }

          entrada.target.style.opacity =
            "1";

          entrada.target.style.transform =
            "translateY(0)";

          entrada.target.style.transition =
            "all .6s ease";

          observador.unobserve(
            entrada.target
          );
        });
      },
      {
        threshold: 0.15
      }
    );

  elementos.forEach((elemento) => {
    elemento.style.opacity = "0";

    elemento.style.transform =
      "translateY(35px)";

    observador.observe(elemento);
  });
}


// ============================================
// SOLICITUD DE PRÉSTAMO:
// IGUALAR EL TAMAÑO DE LAS CAJAS
// ============================================

function igualarCajasSolicitud() {
  const seccion =
    document.querySelector(
      ".solicitud-prestamo"
    );

  if (!seccion) {
    return;
  }

  const preguntas = [
    ...seccion.querySelectorAll(
      ".solicitud-pregunta"
    )
  ];

  const respuestasInteriores = [
    ...seccion.querySelectorAll(
      ".solicitud-respuesta-interior"
    )
  ];

  if (
    !preguntas.length ||
    !respuestasInteriores.length
  ) {
    return;
  }

  /*
   * Eliminar temporalmente las alturas
   * para medir correctamente el contenido.
   */
  seccion.style.removeProperty(
    "--alto-pregunta"
  );

  seccion.style.removeProperty(
    "--alto-respuesta"
  );

  /*
   * Obtener la altura del título más grande.
   */
  const altoPregunta = Math.ceil(
    Math.max(
      ...preguntas.map((pregunta) => {
        return pregunta.scrollHeight;
      })
    )
  );

  /*
   * Obtener la altura de la respuesta
   * más grande.
   */
  const altoRespuesta = Math.ceil(
    Math.max(
      ...respuestasInteriores.map(
        (respuesta) => {
          return respuesta.scrollHeight;
        }
      )
    )
  );

  /*
   * Aplicar las mismas alturas
   * a todas las tarjetas.
   */
  seccion.style.setProperty(
    "--alto-pregunta",
    `${altoPregunta}px`
  );

  seccion.style.setProperty(
    "--alto-respuesta",
    `${altoRespuesta}px`
  );
}


// ============================================
// SOLICITUD DE PRÉSTAMO:
// ESTADO ACCESIBLE DEL ACORDEÓN
// ============================================

function sincronizarEstadoSolicitud(
  boton
) {
  const tarjeta =
    boton.closest(".solicitud-card");

  const respuestaId =
    boton.getAttribute("aria-controls");

  const respuesta = respuestaId
    ? document.getElementById(
        respuestaId
      )
    : null;

  if (!tarjeta) {
    return;
  }

  const estaCerrada =
    tarjeta.classList.contains(
      "esta-cerrada"
    );

  boton.setAttribute(
    "aria-expanded",
    String(!estaCerrada)
  );

  if (respuesta) {
    respuesta.setAttribute(
      "aria-hidden",
      String(estaCerrada)
    );
  }
}


// ============================================
// SOLICITUD DE PRÉSTAMO:
// ABRIR Y CERRAR RESPUESTAS
// ============================================

function iniciarSolicitudPrestamo() {
  const botonesSolicitud =
    document.querySelectorAll(
      ".solicitud-pregunta"
    );

  if (!botonesSolicitud.length) {
    return;
  }

  botonesSolicitud.forEach((boton) => {
    sincronizarEstadoSolicitud(boton);

    boton.addEventListener(
      "click",
      () => {
        const tarjeta =
          boton.closest(
            ".solicitud-card"
          );

        if (!tarjeta) {
          return;
        }

        tarjeta.classList.toggle(
          "esta-cerrada"
        );

        sincronizarEstadoSolicitud(
          boton
        );
      }
    );
  });

  /*
   * Cerrar todas las respuestas
   * al presionar Escape.
   */
  document.addEventListener(
    "keydown",
    (evento) => {
      if (evento.key !== "Escape") {
        return;
      }

      botonesSolicitud.forEach(
        (boton) => {
          const tarjeta =
            boton.closest(
              ".solicitud-card"
            );

          if (tarjeta) {
            tarjeta.classList.add(
              "esta-cerrada"
            );

            sincronizarEstadoSolicitud(
              boton
            );
          }
        }
      );
    }
  );

  /*
   * Recalcular las alturas al cambiar
   * el tamaño de la pantalla.
   */
  let temporizadorAlturas;

  window.addEventListener(
    "resize",
    () => {
      clearTimeout(
        temporizadorAlturas
      );

      temporizadorAlturas =
        setTimeout(() => {
          igualarCajasSolicitud();
        }, 120);
    }
  );

  /*
   * Calcular las alturas al cargar.
   */
  igualarCajasSolicitud();

  /*
   * Volver a calcular cuando terminen
   * de cargar las fuentes.
   */
  if (document.fonts?.ready) {
    document.fonts.ready.then(
      igualarCajasSolicitud
    );
  }
}


// ============================================
// INICIALIZACIÓN GENERAL
// ============================================

function inicializarSitio() {
  setLang(
    localStorage.getItem("lang") ||
    "es"
  );

  iniciarDropdowns();

  iniciarHeaderScroll();

  setActiveNavLink();

  iniciarAnimaciones();

  iniciarSolicitudPrestamo();
}

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    inicializarSitio
  );
} else {
  inicializarSitio();
}


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
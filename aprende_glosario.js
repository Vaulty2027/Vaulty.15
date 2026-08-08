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
// DATOS — glosario completo (A-Z), generado desde el documento Word.
// Cada término tiene nombre y definición en "es" y "en".
// El icono es la ruta a TU imagen — solo falta que pongas los archivos
// en img/glosario/ con esos mismos nombres (o cambia la ruta).
// ============================================
const terminos = {
  A: [
    { icono: 'img/glosario/ahorro.png', nombre: { es: 'Ahorro', en: 'Savings' }, definicion: { es: 'Dinero que se guarda para usarlo en el futuro, ya sea para emergencias, metas o inversiones.', en: 'Money set aside to use in the future, whether for emergencies, goals, or investments.' } },
    { icono: 'img/glosario/accion.png', nombre: { es: 'Acción', en: 'Stock' }, definicion: { es: 'Parte de la propiedad de una empresa que una persona puede comprar y vender en la bolsa de valores.', en: 'Part of a company\'s ownership that a person can buy and sell on the stock market.' } },
    { icono: 'img/glosario/activo.png', nombre: { es: 'Activo', en: 'Asset' }, definicion: { es: 'Bien o recurso que tiene valor económico y puede generar beneficios, como dinero, propiedades o inversiones.', en: 'A good or resource with economic value that can generate benefits, such as money, property, or investments.' } },
    { icono: 'img/glosario/amortizacion.png', nombre: { es: 'Amortización', en: 'Amortization' }, definicion: { es: 'Proceso de pagar una deuda poco a poco mediante cuotas periódicas.', en: 'The process of paying off a debt gradually through periodic installments.' } },
    { icono: 'img/glosario/apalancamiento.png', nombre: { es: 'Apalancamiento', en: 'Leverage' }, definicion: { es: 'Uso de dinero prestado para invertir y buscar mayores ganancias, aunque también aumenta el riesgo.', en: 'The use of borrowed money to invest and seek higher returns, although it also increases risk.' } },
  ],
  B: [
    { icono: 'img/glosario/banco.png', nombre: { es: 'Banco', en: 'Bank' }, definicion: { es: 'Institución financiera que ofrece servicios como cuentas de ahorro, préstamos, inversiones y manejo de dinero.', en: 'A financial institution that offers services such as savings accounts, loans, investments, and money management.' } },
    { icono: 'img/glosario/beneficio.png', nombre: { es: 'Beneficio', en: 'Profit' }, definicion: { es: 'Ganancia obtenida después de restar los costos y gastos de una actividad económica o negocio.', en: 'Profit obtained after subtracting the costs and expenses of an economic activity or business.' } },
    { icono: 'img/glosario/bolsa-de-valores.png', nombre: { es: 'Bolsa de Valores', en: 'Stock Exchange' }, definicion: { es: 'Mercado donde se compran y venden acciones, bonos y otros instrumentos financieros.', en: 'A market where stocks, bonds, and other financial instruments are bought and sold.' } },
    { icono: 'img/glosario/bono.png', nombre: { es: 'Bono', en: 'Bond' }, definicion: { es: 'Título de deuda mediante el cual una persona o empresa presta dinero a una entidad a cambio de intereses.', en: 'A debt instrument through which a person or company lends money to an entity in exchange for interest.' } },
    { icono: 'img/glosario/buro-de-credito.png', nombre: { es: 'Buró de Crédito', en: 'Credit Bureau' }, definicion: { es: 'Entidad que recopila y administra el historial crediticio de las personas y empresas.', en: 'An entity that collects and manages the credit history of individuals and companies.' } },
  ],
  C: [
    { icono: 'img/glosario/capital.png', nombre: { es: 'Capital', en: 'Capital' }, definicion: { es: 'Dinero o recursos que se utilizan para iniciar, mantener o hacer crecer un negocio o inversión.', en: 'Money or resources used to start, maintain, or grow a business or investment.' } },
    { icono: 'img/glosario/credito.png', nombre: { es: 'Crédito', en: 'Credit' }, definicion: { es: 'Cantidad de dinero que una institución financiera presta con el compromiso de devolverlo en un plazo determinado.', en: 'An amount of money that a financial institution lends with the commitment to repay it within a set period.' } },
    { icono: 'img/glosario/cotizacion.png', nombre: { es: 'Cotización', en: 'Quote (Price)' }, definicion: { es: 'Valor o precio que tiene un activo financiero, como una acción, en un momento específico.', en: 'The value or price of a financial asset, such as a stock, at a specific moment.' } },
    { icono: 'img/glosario/comision.png', nombre: { es: 'Comisión', en: 'Commission' }, definicion: { es: 'Pago que se realiza por un servicio financiero, una transacción o una gestión comercial.', en: 'A payment made for a financial service, transaction, or business arrangement.' } },
    { icono: 'img/glosario/coste-de-oportunidad.png', nombre: { es: 'Coste de Oportunidad', en: 'Opportunity Cost' }, definicion: { es: 'Beneficio que se deja de obtener al elegir una opción financiera en lugar de otra.', en: 'The benefit given up by choosing one financial option instead of another.' } },
  ],
  D: [
    { icono: 'img/glosario/deuda.png', nombre: { es: 'Deuda', en: 'Debt' }, definicion: { es: 'Cantidad de dinero que una persona, empresa o gobierno debe pagar a otra parte.', en: 'An amount of money that a person, company, or government must pay to another party.' } },
    { icono: 'img/glosario/deficit.png', nombre: { es: 'Déficit', en: 'Deficit' }, definicion: { es: 'Situación en la que los gastos son mayores que los ingresos.', en: 'A situation in which expenses are greater than income.' } },
    { icono: 'img/glosario/deposito.png', nombre: { es: 'Depósito', en: 'Deposit' }, definicion: { es: 'Dinero que una persona guarda en una cuenta bancaria para su protección o ahorro.', en: 'Money that a person keeps in a bank account for protection or savings.' } },
    { icono: 'img/glosario/diversificacion.png', nombre: { es: 'Diversificación', en: 'Diversification' }, definicion: { es: 'Estrategia que consiste en invertir en diferentes activos para reducir riesgos.', en: 'A strategy that involves investing in different assets to reduce risk.' } },
    { icono: 'img/glosario/dividendo.png', nombre: { es: 'Dividendo', en: 'Dividend' }, definicion: { es: 'Parte de las ganancias de una empresa que se distribuye entre sus accionistas.', en: 'Part of a company\'s profits distributed among its shareholders.' } },
  ],
  E: [
    { icono: 'img/glosario/efectivo.png', nombre: { es: 'Efectivo', en: 'Cash' }, definicion: { es: 'Dinero disponible de forma inmediata en monedas, billetes o cuentas de fácil acceso.', en: 'Money immediately available in coins, bills, or easily accessible accounts.' } },
    { icono: 'img/glosario/endeudamiento.png', nombre: { es: 'Endeudamiento', en: 'Indebtedness' }, definicion: { es: 'Uso de préstamos o créditos para financiar gastos o inversiones.', en: 'The use of loans or credit to finance expenses or investments.' } },
    { icono: 'img/glosario/especulacion.png', nombre: { es: 'Especulación', en: 'Speculation' }, definicion: { es: 'Compra y venta de activos buscando obtener ganancias por cambios en sus precios.', en: 'Buying and selling assets in search of profit from changes in their prices.' } },
    { icono: 'img/glosario/economia.png', nombre: { es: 'Economía', en: 'Economics' }, definicion: { es: 'Ciencia que estudia cómo las personas, empresas y gobiernos administran recursos limitados.', en: 'The science that studies how people, businesses, and governments manage limited resources.' } },
    { icono: 'img/glosario/estado-financiero.png', nombre: { es: 'Estado Financiero', en: 'Financial Statement' }, definicion: { es: 'Documento que muestra la situación económica y financiera de una empresa.', en: 'A document that shows a company\'s economic and financial situation.' } },
  ],
  F: [
    { icono: 'img/glosario/factura.png', nombre: { es: 'Factura', en: 'Invoice' }, definicion: { es: 'Documento que registra la venta de un producto o servicio y el monto a pagar.', en: 'A document that records the sale of a product or service and the amount owed.' } },
    { icono: 'img/glosario/fondo-de-inversion.png', nombre: { es: 'Fondo de Inversión', en: 'Investment Fund' }, definicion: { es: 'Conjunto de recursos aportados por varias personas para invertir en diferentes activos.', en: 'A pool of resources contributed by several people to invest in different assets.' } },
    { icono: 'img/glosario/flujo-de-caja.png', nombre: { es: 'Flujo de Caja', en: 'Cash Flow' }, definicion: { es: 'Movimiento de dinero que entra y sale de una persona o empresa durante un período.', en: 'The movement of money in and out of a person or company during a period.' } },
    { icono: 'img/glosario/financiamiento.png', nombre: { es: 'Financiamiento', en: 'Financing' }, definicion: { es: 'Obtención de recursos económicos para realizar proyectos, compras o inversiones.', en: 'Obtaining economic resources to carry out projects, purchases, or investments.' } },
    { icono: 'img/glosario/fondo-de-emergencia.png', nombre: { es: 'Fondo de Emergencia', en: 'Emergency Fund' }, definicion: { es: 'Dinero reservado para cubrir gastos inesperados sin afectar las finanzas personales.', en: 'Money set aside to cover unexpected expenses without affecting personal finances.' } },
  ],
  G: [
    { icono: 'img/glosario/ganancia.png', nombre: { es: 'Ganancia', en: 'Earnings' }, definicion: { es: 'Dinero que se obtiene después de descontar los costos y gastos.', en: 'Money obtained after deducting costs and expenses.' } },
    { icono: 'img/glosario/garantia.png', nombre: { es: 'Garantía', en: 'Guarantee' }, definicion: { es: 'Bien o respaldo que asegura el cumplimiento de una deuda u obligación financiera.', en: 'A good or backing that ensures the fulfillment of a debt or financial obligation.' } },
    { icono: 'img/glosario/gasto.png', nombre: { es: 'Gasto', en: 'Expense' }, definicion: { es: 'Salida de dinero destinada a cubrir necesidades, servicios o compras.', en: 'An outflow of money used to cover needs, services, or purchases.' } },
    { icono: 'img/glosario/globalizacion-financiera.png', nombre: { es: 'Globalización Financiera', en: 'Financial Globalization' }, definicion: { es: 'Integración de los mercados financieros de distintos países para facilitar inversiones y transacciones.', en: 'The integration of financial markets across countries to facilitate investment and transactions.' } },
    { icono: 'img/glosario/gestion-financiera.png', nombre: { es: 'Gestión Financiera', en: 'Financial Management' }, definicion: { es: 'Proceso de planificar, organizar y controlar los recursos económicos para alcanzar objetivos financieros.', en: 'The process of planning, organizing, and controlling economic resources to reach financial goals.' } },
    { icono: 'img/glosario/giro-bancario.png', nombre: { es: 'Giro bancario', en: 'Bank Transfer' }, definicion: { es: 'Transferencia de dinero realizada de una cuenta bancaria a otra, ya sea dentro del mismo país o al extranjero.', en: 'A transfer of money from one bank account to another, whether domestic or abroad.' } },
    { icono: 'img/glosario/gravamen.png', nombre: { es: 'Gravamen', en: 'Lien' }, definicion: { es: 'Impuesto, carga o derecho que se aplica sobre un bien, propiedad o transacción económica.', en: 'A tax, charge, or lien applied to a good, property, or economic transaction.' } },
    { icono: 'img/glosario/globalizacion-economica.png', nombre: { es: 'Globalización económica', en: 'Economic Globalization' }, definicion: { es: 'Proceso mediante el cual las economías de diferentes países se conectan mediante el comercio, las inversiones y los mercados financieros.', en: 'The process by which different countries\' economies become connected through trade, investment, and financial markets.' } },
    { icono: 'img/glosario/gasto-fijo.png', nombre: { es: 'Gasto fijo', en: 'Fixed Expense' }, definicion: { es: 'Pago que mantiene el mismo valor cada mes, como el alquiler, seguros o servicios contratados.', en: 'A payment that stays the same amount each month, such as rent, insurance, or contracted services.' } },
    { icono: 'img/glosario/gasto-variable.png', nombre: { es: 'Gasto variable', en: 'Variable Expense' }, definicion: { es: 'Gasto cuyo monto cambia según el consumo o las necesidades, como entretenimiento, comida o transporte.', en: 'An expense whose amount changes based on consumption or needs, such as entertainment, food, or transportation.' } },
    { icono: 'img/glosario/generacion-de-ingresos.png', nombre: { es: 'Generación de ingresos', en: 'Income Generation' }, definicion: { es: 'Proceso mediante el cual una persona o empresa obtiene dinero por medio de su trabajo, ventas o inversiones.', en: 'The process by which a person or company earns money through work, sales, or investments.' } },
    { icono: 'img/glosario/gobierno-corporativo.png', nombre: { es: 'Gobierno corporativo', en: 'Corporate Governance' }, definicion: { es: 'Conjunto de normas y prácticas que regulan la administración y el funcionamiento de una empresa.', en: 'The set of rules and practices that govern how a company is managed and operated.' } },
    { icono: 'img/glosario/giro-comercial.png', nombre: { es: 'Giro comercial', en: 'Business Activity' }, definicion: { es: 'Actividad económica principal a la que se dedica una empresa para generar ingresos.', en: 'The main economic activity a company engages in to generate income.' } },
    { icono: 'img/glosario/grupo-financiero.png', nombre: { es: 'Grupo financiero', en: 'Financial Group' }, definicion: { es: 'Conjunto de empresas que ofrecen diferentes servicios financieros, como bancos, aseguradoras e instituciones de inversión.', en: 'A group of companies offering different financial services, such as banks, insurers, and investment firms.' } },
    { icono: 'img/glosario/ganancia-neta.png', nombre: { es: 'Ganancia neta', en: 'Net Profit' }, definicion: { es: 'Beneficio final obtenido después de descontar impuestos, costos y gastos de una actividad económica.', en: 'The final profit obtained after deducting taxes, costs, and expenses from an economic activity.' } },
    { icono: 'img/glosario/garantia-hipotecaria.png', nombre: { es: 'Garantía hipotecaria', en: 'Mortgage Collateral' }, definicion: { es: 'Propiedad que se ofrece como respaldo para asegurar el pago de un préstamo hipotecario.', en: 'Property offered as backing to secure the payment of a mortgage loan.' } },
  ],
  H: [
    { icono: 'img/glosario/hacienda-publica.png', nombre: { es: 'Hacienda pública', en: 'Public Treasury' }, definicion: { es: 'Conjunto de organismos del Estado encargados de recaudar impuestos y administrar los recursos públicos.', en: 'The set of government bodies responsible for collecting taxes and managing public resources.' } },
    { icono: 'img/glosario/haber.png', nombre: { es: 'Haber', en: 'Credit (Accounting)' }, definicion: { es: 'Registro contable que representa aumentos en determinadas cuentas o derechos económicos.', en: 'An accounting entry that represents increases in certain accounts or economic rights.' } },
    { icono: 'img/glosario/hipoteca.png', nombre: { es: 'Hipoteca', en: 'Mortgage' }, definicion: { es: 'Préstamo utilizado para comprar una vivienda u otro inmueble, dejando la propiedad como garantía.', en: 'A loan used to buy a home or other property, leaving the property as collateral.' } },
    { icono: 'img/glosario/historial-crediticio.png', nombre: { es: 'Historial crediticio', en: 'Credit History' }, definicion: { es: 'Registro que muestra el comportamiento de una persona al pagar sus créditos y préstamos.', en: 'A record showing a person\'s behavior in paying off credit and loans.' } },
    { icono: 'img/glosario/honorarios.png', nombre: { es: 'Honorarios', en: 'Professional Fees' }, definicion: { es: 'Pago que recibe un profesional por prestar un servicio especializado.', en: 'Payment received by a professional for providing a specialized service.' } },
    { icono: 'img/glosario/holding.png', nombre: { es: 'Holding', en: 'Holding Company' }, definicion: { es: 'Empresa que posee acciones o controla otras compañías sin participar directamente en sus operaciones.', en: 'A company that owns shares in or controls other companies without directly participating in their operations.' } },
    { icono: 'img/glosario/horizonte-de-inversion.png', nombre: { es: 'Horizonte de inversión', en: 'Investment Horizon' }, definicion: { es: 'Tiempo durante el cual una persona planea mantener una inversión antes de utilizar el dinero.', en: 'The length of time a person plans to keep an investment before using the money.' } },
    { icono: 'img/glosario/herencia.png', nombre: { es: 'Herencia', en: 'Inheritance' }, definicion: { es: 'Conjunto de bienes, dinero y propiedades que una persona recibe tras el fallecimiento de otra.', en: 'The assets, money, and property a person receives after another person\'s death.' } },
    { icono: 'img/glosario/homologacion-financiera.png', nombre: { es: 'Homologación financiera', en: 'Financial Standardization' }, definicion: { es: 'Proceso de adaptar normas, procedimientos o sistemas financieros para que sean compatibles entre diferentes instituciones.', en: 'The process of adapting financial rules, procedures, or systems so they are compatible between different institutions.' } },
    { icono: 'img/glosario/hecho-economico.png', nombre: { es: 'Hecho económico', en: 'Economic Event' }, definicion: { es: 'Evento que produce un cambio en la situación financiera de una persona, empresa o institución.', en: 'An event that produces a change in the financial situation of a person, company, or institution.' } },
    { icono: 'img/glosario/habito-de-ahorro.png', nombre: { es: 'Hábito de ahorro', en: 'Savings Habit' }, definicion: { es: 'Costumbre de reservar parte de los ingresos de manera constante para cumplir metas o enfrentar emergencias.', en: 'The habit of consistently setting aside part of one\'s income to meet goals or handle emergencies.' } },
    { icono: 'img/glosario/herramienta-financiera.png', nombre: { es: 'Herramienta financiera', en: 'Financial Tool' }, definicion: { es: 'Recurso o instrumento utilizado para administrar, analizar o mejorar las finanzas personales o empresariales.', en: 'A resource or instrument used to manage, analyze, or improve personal or business finances.' } },
    { icono: 'img/glosario/hoja-de-balance.png', nombre: { es: 'Hoja de balance', en: 'Balance Sheet' }, definicion: { es: 'Documento que resume la situación financiera de una empresa mostrando activos, pasivos y patrimonio.', en: 'A document that summarizes a company\'s financial position by showing assets, liabilities, and equity.' } },
    { icono: 'img/glosario/hiperinflacion.png', nombre: { es: 'Hiperinflación', en: 'Hyperinflation' }, definicion: { es: 'Aumento extremadamente rápido y descontrolado de los precios que reduce el valor del dinero.', en: 'An extremely fast, uncontrolled rise in prices that reduces the value of money.' } },
    { icono: 'img/glosario/hedge-cobertura.png', nombre: { es: 'Hedge (Cobertura)', en: 'Hedge' }, definicion: { es: 'Estrategia utilizada para reducir el riesgo de pérdidas en inversiones mediante instrumentos financieros.', en: 'A strategy used to reduce the risk of investment losses using financial instruments.' } },
  ],
  I: [
    { icono: 'img/glosario/impuesto.png', nombre: { es: 'Impuesto', en: 'Tax' }, definicion: { es: 'Pago obligatorio que realizan personas y empresas al Estado para financiar los servicios públicos.', en: 'A mandatory payment made by individuals and companies to the government to fund public services.' } },
    { icono: 'img/glosario/ingreso.png', nombre: { es: 'Ingreso', en: 'Income' }, definicion: { es: 'Dinero que recibe una persona o empresa por su trabajo, ventas, inversiones u otras actividades.', en: 'Money a person or company receives from work, sales, investments, or other activities.' } },
    { icono: 'img/glosario/interes.png', nombre: { es: 'Interés', en: 'Interest' }, definicion: { es: 'Cantidad adicional que se paga o recibe por prestar o invertir dinero durante un tiempo determinado.', en: 'The extra amount paid or earned for lending or investing money over a period of time.' } },
    { icono: 'img/glosario/inversion.png', nombre: { es: 'Inversión', en: 'Investment' }, definicion: { es: 'Uso del dinero en un proyecto, negocio o activo con el objetivo de obtener ganancias futuras.', en: 'The use of money in a project, business, or asset with the goal of earning future profits.' } },
    { icono: 'img/glosario/inflacion.png', nombre: { es: 'Inflación', en: 'Inflation' }, definicion: { es: 'Incremento general de los precios de bienes y servicios que disminuye el poder adquisitivo del dinero.', en: 'A general rise in the prices of goods and services that reduces the purchasing power of money.' } },
    { icono: 'img/glosario/insolvencia.png', nombre: { es: 'Insolvencia', en: 'Insolvency' }, definicion: { es: 'Situación en la que una persona o empresa no puede cumplir con el pago de sus obligaciones financieras.', en: 'A situation in which a person or company cannot meet their financial obligations.' } },
    { icono: 'img/glosario/indice-bursatil.png', nombre: { es: 'Índice bursátil', en: 'Stock Index' }, definicion: { es: 'Indicador que refleja el comportamiento de un grupo de acciones en el mercado de valores.', en: 'An indicator that reflects the performance of a group of stocks in the market.' } },
    { icono: 'img/glosario/incentivo-fiscal.png', nombre: { es: 'Incentivo fiscal', en: 'Tax Incentive' }, definicion: { es: 'Beneficio otorgado por el gobierno, como una reducción de impuestos, para fomentar determinadas actividades económicas.', en: 'A benefit granted by the government, such as a tax reduction, to encourage certain economic activities.' } },
    { icono: 'img/glosario/interes-compuesto.png', nombre: { es: 'Interés compuesto', en: 'Compound Interest' }, definicion: { es: 'Interés calculado tanto sobre el capital inicial como sobre los intereses acumulados anteriormente.', en: 'Interest calculated on both the initial capital and the interest accumulated previously.' } },
    { icono: 'img/glosario/interes-simple.png', nombre: { es: 'Interés simple', en: 'Simple Interest' }, definicion: { es: 'Interés que se calcula únicamente sobre el monto inicial prestado o invertido.', en: 'Interest calculated only on the original amount borrowed or invested.' } },
    { icono: 'img/glosario/institucion-financiera.png', nombre: { es: 'Institución financiera', en: 'Financial Institution' }, definicion: { es: 'Entidad autorizada para ofrecer servicios como préstamos, cuentas bancarias e inversiones.', en: 'An entity authorized to offer services such as loans, bank accounts, and investments.' } },
    { icono: 'img/glosario/inventario.png', nombre: { es: 'Inventario', en: 'Inventory' }, definicion: { es: 'Conjunto de productos, materiales o bienes que posee una empresa para su venta o producción.', en: 'The set of products, materials, or goods a company holds for sale or production.' } },
    { icono: 'img/glosario/ingreso-pasivo.png', nombre: { es: 'Ingreso pasivo', en: 'Passive Income' }, definicion: { es: 'Dinero que se obtiene de forma periódica sin necesidad de trabajar constantemente, como alquileres o inversiones.', en: 'Money earned periodically without the need to work constantly, such as rent or investment income.' } },
    { icono: 'img/glosario/indicador-financiero.png', nombre: { es: 'Indicador financiero', en: 'Financial Indicator' }, definicion: { es: 'Dato utilizado para evaluar la situación económica y el rendimiento financiero de una empresa o persona.', en: 'Data used to assess the economic situation and financial performance of a company or person.' } },
    { icono: 'img/glosario/inversionista.png', nombre: { es: 'Inversionista', en: 'Investor' }, definicion: { es: 'Persona o empresa que destina dinero a una inversión con la expectativa de obtener beneficios futuros.', en: 'A person or company that puts money into an investment expecting future returns.' } },
  ],
  J: [
    { icono: 'img/glosario/jubilacion.png', nombre: { es: 'Jubilación', en: 'Retirement' }, definicion: { es: 'Etapa en la que una persona deja de trabajar y recibe ingresos provenientes de un fondo de pensiones o ahorro.', en: 'The stage when a person stops working and receives income from a pension fund or savings.' } },
    { icono: 'img/glosario/jornada-laboral.png', nombre: { es: 'Jornada laboral', en: 'Workday' }, definicion: { es: 'Tiempo establecido para realizar actividades de trabajo, del cual provienen los ingresos de un empleado.', en: 'The set amount of time for carrying out work activities, from which an employee\'s income comes.' } },
    { icono: 'img/glosario/junta-directiva.png', nombre: { es: 'Junta directiva', en: 'Board of Directors' }, definicion: { es: 'Grupo de personas encargado de tomar las decisiones más importantes dentro de una empresa.', en: 'A group of people responsible for making a company\'s most important decisions.' } },
    { icono: 'img/glosario/jurisdiccion-fiscal.png', nombre: { es: 'Jurisdicción fiscal', en: 'Tax Jurisdiction' }, definicion: { es: 'Área o territorio donde se aplican determinadas leyes tributarias y financieras.', en: 'An area or territory where certain tax and financial laws apply.' } },
    { icono: 'img/glosario/juicio-ejecutivo.png', nombre: { es: 'Juicio ejecutivo', en: 'Executory Judgment' }, definicion: { es: 'Proceso legal utilizado para exigir el pago de una deuda respaldada por un documento válido.', en: 'A legal process used to demand payment of a debt backed by a valid document.' } },
    { icono: 'img/glosario/juego-de-azar-financiero.png', nombre: { es: 'Juego de azar financiero', en: 'Financial Gambling' }, definicion: { es: 'Actividad basada en el riesgo donde existe la posibilidad de ganar o perder dinero.', en: 'A risk-based activity where there is a chance of winning or losing money.' } },
    { icono: 'img/glosario/jerarquia-de-pagos.png', nombre: { es: 'Jerarquía de pagos', en: 'Payment Priority Order' }, definicion: { es: 'Orden de prioridad establecido para cumplir con las obligaciones financieras.', en: 'The order of priority set for meeting financial obligations.' } },
    { icono: 'img/glosario/justificante-de-pago.png', nombre: { es: 'Justificante de pago', en: 'Proof of Payment' }, definicion: { es: 'Documento que demuestra que una deuda o compra ha sido pagada correctamente.', en: 'A document that proves a debt or purchase has been paid correctly.' } },
    { icono: 'img/glosario/jefe-financiero.png', nombre: { es: 'Jefe financiero', en: 'Chief Financial Officer' }, definicion: { es: 'Persona responsable de dirigir y controlar las finanzas de una empresa.', en: 'The person responsible for directing and controlling a company\'s finances.' } },
    { icono: 'img/glosario/jornal.png', nombre: { es: 'Jornal', en: 'Day\'s Wage' }, definicion: { es: 'Pago que recibe un trabajador por una jornada o día de trabajo.', en: 'Payment received by a worker for a day\'s work.' } },
    { icono: 'img/glosario/juro.png', nombre: { es: 'Juro', en: 'Interest (regional term)' }, definicion: { es: 'Nombre utilizado en algunos países para referirse al interés generado por un préstamo o inversión.', en: 'A term used in some countries to refer to the interest generated by a loan or investment.' } },
    { icono: 'img/glosario/junta-de-accionistas.png', nombre: { es: 'Junta de accionistas', en: 'Shareholders\' Meeting' }, definicion: { es: 'Reunión donde los propietarios de una empresa toman decisiones importantes sobre su administración.', en: 'A meeting where a company\'s owners make important decisions about its management.' } },
    { icono: 'img/glosario/juramento-tributario.png', nombre: { es: 'Juramento tributario', en: 'Tax Declaration Oath' }, definicion: { es: 'Declaración formal presentada ante una autoridad fiscal sobre información económica o tributaria.', en: 'A formal statement submitted to a tax authority regarding financial or tax information.' } },
    { icono: 'img/glosario/jurisprudencia-fiscal.png', nombre: { es: 'Jurisprudencia fiscal', en: 'Tax Case Law' }, definicion: { es: 'Conjunto de decisiones judiciales que sirven como referencia en asuntos relacionados con impuestos.', en: 'The body of court rulings used as a reference in tax-related matters.' } },
    { icono: 'img/glosario/judicializacion-de-deuda.png', nombre: { es: 'Judicialización de deuda', en: 'Debt Litigation' }, definicion: { es: 'Proceso mediante el cual una deuda es llevada ante un tribunal para exigir su pago.', en: 'The process by which a debt is taken to court to demand payment.' } },
  ],
  K: [
    { icono: 'img/glosario/kyc-know-your-customer.png', nombre: { es: 'KYC (Know Your Customer)', en: 'KYC (Know Your Customer)' }, definicion: { es: 'Proceso mediante el cual los bancos verifican la identidad de sus clientes para prevenir fraudes y el lavado de dinero.', en: 'The process by which banks verify their customers\' identity to prevent fraud and money laundering.' } },
    { icono: 'img/glosario/kpi-financiero.png', nombre: { es: 'KPI Financiero', en: 'Financial KPI' }, definicion: { es: 'Indicador clave utilizado para medir el rendimiento económico y financiero de una empresa.', en: 'A key indicator used to measure a company\'s economic and financial performance.' } },
    { icono: 'img/glosario/know-how-financiero.png', nombre: { es: 'Know-how financiero', en: 'Financial Know-How' }, definicion: { es: 'Conjunto de conocimientos y experiencia que permiten administrar correctamente los recursos económicos.', en: 'The knowledge and experience that allow someone to properly manage economic resources.' } },
    { icono: 'img/glosario/keynesianismo.png', nombre: { es: 'Keynesianismo', en: 'Keynesianism' }, definicion: { es: 'Teoría económica que propone la intervención del Estado para estimular la economía en tiempos de crisis.', en: 'An economic theory that proposes government intervention to stimulate the economy during crises.' } },
    { icono: 'img/glosario/key-rate-tasa-clave.png', nombre: { es: 'Key Rate (Tasa clave)', en: 'Key Rate' }, definicion: { es: 'Tasa de interés de referencia utilizada por los bancos centrales para influir en el costo del crédito y el comportamiento de la economía.', en: 'A benchmark interest rate used by central banks to influence the cost of credit and economic behavior.' } },
  ],
  L: [
    { icono: 'img/glosario/liquidez.png', nombre: { es: 'Liquidez', en: 'Liquidity' }, definicion: { es: 'Capacidad que tiene una persona o empresa para disponer de dinero en efectivo rápidamente y cumplir con sus obligaciones financieras.', en: 'A person\'s or company\'s ability to access cash quickly to meet financial obligations.' } },
    { icono: 'img/glosario/lucro.png', nombre: { es: 'Lucro', en: 'Profit (Gain)' }, definicion: { es: 'Ganancia económica obtenida después de realizar una actividad comercial, una inversión o un negocio.', en: 'Economic profit obtained from a commercial activity, investment, or business.' } },
    { icono: 'img/glosario/leasing.png', nombre: { es: 'Leasing', en: 'Leasing' }, definicion: { es: 'Contrato mediante el cual una empresa o persona utiliza un bien, como un vehículo o maquinaria, pagando cuotas periódicas con opción de compra al finalizar el contrato.', en: 'A contract in which a company or person uses a good, such as a vehicle or machinery, paying periodic installments with an option to buy at the end of the contract.' } },
    { icono: 'img/glosario/letra-de-cambio.png', nombre: { es: 'Letra de cambio', en: 'Bill of Exchange' }, definicion: { es: 'Documento legal que obliga a una persona a pagar una cantidad de dinero a otra en una fecha determinada.', en: 'A legal document that obliges a person to pay an amount of money to another on a set date.' } },
    { icono: 'img/glosario/libre-mercado.png', nombre: { es: 'Libre mercado', en: 'Free Market' }, definicion: { es: 'Sistema económico donde los precios y la producción se determinan principalmente por la oferta y la demanda, con poca intervención del Estado.', en: 'An economic system where prices and production are mainly determined by supply and demand, with little government intervention.' } },
    { icono: 'img/glosario/linea-de-credito.png', nombre: { es: 'Línea de crédito', en: 'Line of Credit' }, definicion: { es: 'Monto máximo de dinero que una entidad financiera pone a disposición de un cliente para utilizar cuando lo necesite.', en: 'The maximum amount of money a financial institution makes available to a client to use as needed.' } },
    { icono: 'img/glosario/libro-contable.png', nombre: { es: 'Libro contable', en: 'Accounting Ledger' }, definicion: { es: 'Registro donde una empresa anota todas sus operaciones económicas y financieras de manera organizada.', en: 'A record where a company logs all its economic and financial operations in an organized way.' } },
    { icono: 'img/glosario/liquidacion.png', nombre: { es: 'Liquidación', en: 'Settlement' }, definicion: { es: 'Proceso de calcular y pagar una deuda, salario, indemnización o cualquier obligación económica pendiente.', en: 'The process of calculating and paying off a debt, salary, severance, or any other pending financial obligation.' } },
    { icono: 'img/glosario/lavado-de-dinero.png', nombre: { es: 'Lavado de dinero', en: 'Money Laundering' }, definicion: { es: 'Actividad ilegal que consiste en ocultar el origen de dinero obtenido mediante actividades ilícitas para hacerlo parecer legal.', en: 'An illegal activity that involves hiding the origin of money obtained through illicit activities to make it appear legal.' } },
    { icono: 'img/glosario/limite-de-credito.png', nombre: { es: 'Límite de crédito', en: 'Credit Limit' }, definicion: { es: 'Cantidad máxima que una institución financiera permite gastar con una tarjeta de crédito o una línea de crédito.', en: 'The maximum amount a financial institution allows to be spent with a credit card or line of credit.' } },
    { icono: 'img/glosario/largo-plazo.png', nombre: { es: 'Largo plazo', en: 'Long Term' }, definicion: { es: 'Período de tiempo extenso, generalmente superior a un año, utilizado para inversiones o planificación financiera.', en: 'An extended period of time, generally more than a year, used for investments or financial planning.' } },
    { icono: 'img/glosario/legado-financiero.png', nombre: { es: 'Legado financiero', en: 'Financial Legacy' }, definicion: { es: 'Conjunto de bienes, inversiones o recursos económicos que una persona deja a sus herederos.', en: 'The assets, investments, or economic resources a person leaves to their heirs.' } },
    { icono: 'img/glosario/logistica-financiera.png', nombre: { es: 'Logística financiera', en: 'Financial Logistics' }, definicion: { es: 'Administración eficiente de los recursos económicos para garantizar el correcto funcionamiento de una empresa.', en: 'The efficient management of economic resources to ensure a company runs properly.' } },
    { icono: 'img/glosario/leasing-operativo.png', nombre: { es: 'Leasing operativo', en: 'Operating Lease' }, definicion: { es: 'Contrato de arrendamiento donde el usuario utiliza un bien sin intención de comprarlo al finalizar el acuerdo.', en: 'A lease contract where the user uses a good without intending to buy it at the end of the agreement.' } },
    { icono: 'img/glosario/leasing-financiero.png', nombre: { es: 'Leasing financiero', en: 'Financial Lease' }, definicion: { es: 'Contrato de arrendamiento que permite adquirir el bien al finalizar el período mediante el pago de un valor acordado.', en: 'A lease contract that allows the good to be acquired at the end of the period by paying an agreed amount.' } },
  ],
  M: [
    { icono: 'img/glosario/mercado.png', nombre: { es: 'Mercado', en: 'Market' }, definicion: { es: 'Lugar físico o virtual donde compradores y vendedores intercambian bienes, servicios o activos financieros.', en: 'A physical or virtual place where buyers and sellers exchange goods, services, or financial assets.' } },
    { icono: 'img/glosario/moneda.png', nombre: { es: 'Moneda', en: 'Currency' }, definicion: { es: 'Medio de pago aceptado legalmente para realizar transacciones económicas.', en: 'A legally accepted means of payment for economic transactions.' } },
    { icono: 'img/glosario/morosidad.png', nombre: { es: 'Morosidad', en: 'Delinquency' }, definicion: { es: 'Retraso en el pago de una deuda o compromiso financiero.', en: 'A delay in paying a debt or financial commitment.' } },
    { icono: 'img/glosario/margen-de-ganancia.png', nombre: { es: 'Margen de ganancia', en: 'Profit Margin' }, definicion: { es: 'Diferencia entre el precio de venta de un producto y el costo de producirlo o adquirirlo.', en: 'The difference between a product\'s selling price and the cost to produce or acquire it.' } },
    { icono: 'img/glosario/microcredito.png', nombre: { es: 'Microcrédito', en: 'Microcredit' }, definicion: { es: 'Préstamo de pequeña cantidad otorgado principalmente a emprendedores o personas con pocos recursos.', en: 'A small loan granted mainly to entrepreneurs or people with limited resources.' } },
    { icono: 'img/glosario/mediacion-financiera.png', nombre: { es: 'Mediación financiera', en: 'Financial Intermediation' }, definicion: { es: 'Actividad mediante la cual las instituciones financieras conectan a quienes tienen dinero para invertir con quienes necesitan financiamiento.', en: 'The activity by which financial institutions connect those with money to invest with those who need financing.' } },
    { icono: 'img/glosario/mercado-bursatil.png', nombre: { es: 'Mercado bursátil', en: 'Stock Market' }, definicion: { es: 'Mercado donde se compran y venden acciones, bonos y otros instrumentos financieros.', en: 'A market where stocks, bonds, and other financial instruments are bought and sold.' } },
    { icono: 'img/glosario/mutualidad.png', nombre: { es: 'Mutualidad', en: 'Mutual Aid Society' }, definicion: { es: 'Sistema en el que varias personas aportan recursos para ayudarse mutuamente ante determinadas necesidades.', en: 'A system in which several people contribute resources to help each other with certain needs.' } },
    { icono: 'img/glosario/multa.png', nombre: { es: 'Multa', en: 'Fine' }, definicion: { es: 'Pago obligatorio impuesto como sanción por incumplir una ley, contrato o norma financiera.', en: 'A mandatory payment imposed as a penalty for breaking a law, contract, or financial rule.' } },
    { icono: 'img/glosario/metodo-de-pago.png', nombre: { es: 'Método de pago', en: 'Payment Method' }, definicion: { es: 'Forma utilizada para realizar una compra o cancelar una deuda, como efectivo, tarjeta o transferencia.', en: 'The way used to make a purchase or settle a debt, such as cash, card, or transfer.' } },
    { icono: 'img/glosario/materia-prima.png', nombre: { es: 'Materia prima', en: 'Raw Material' }, definicion: { es: 'Material básico utilizado para fabricar productos que posteriormente serán vendidos.', en: 'The basic material used to manufacture products that will later be sold.' } },
    { icono: 'img/glosario/monto-financiado.png', nombre: { es: 'Monto financiado', en: 'Financed Amount' }, definicion: { es: 'Cantidad de dinero que una entidad presta a una persona o empresa.', en: 'The amount of money an entity lends to a person or company.' } },
    { icono: 'img/glosario/monopolio.png', nombre: { es: 'Monopolio', en: 'Monopoly' }, definicion: { es: 'Situación en la que una sola empresa controla completamente la oferta de un producto o servicio.', en: 'A situation in which a single company completely controls the supply of a product or service.' } },
    { icono: 'img/glosario/movimientos-bancarios.png', nombre: { es: 'Movimientos bancarios', en: 'Bank Transactions' }, definicion: { es: 'Registro de todas las transacciones realizadas en una cuenta bancaria, como depósitos, retiros y transferencias.', en: 'A record of all transactions made in a bank account, such as deposits, withdrawals, and transfers.' } },
    { icono: 'img/glosario/medios-de-cobro.png', nombre: { es: 'Medios de cobro', en: 'Collection Methods' }, definicion: { es: 'Herramientas utilizadas para recibir pagos, como cheques, transferencias, tarjetas o efectivo.', en: 'Tools used to receive payments, such as checks, transfers, cards, or cash.' } },
  ],
  N: [
    { icono: 'img/glosario/negocio.png', nombre: { es: 'Negocio', en: 'Business' }, definicion: { es: 'Actividad económica organizada con el objetivo de ofrecer productos o servicios y obtener ganancias.', en: 'An organized economic activity aimed at offering products or services and earning a profit.' } },
    { icono: 'img/glosario/nomina.png', nombre: { es: 'Nómina', en: 'Payroll' }, definicion: { es: 'Lista de empleados de una empresa junto con los salarios y beneficios que reciben.', en: 'A list of a company\'s employees along with the salaries and benefits they receive.' } },
    { icono: 'img/glosario/negociacion.png', nombre: { es: 'Negociación', en: 'Negotiation' }, definicion: { es: 'Proceso mediante el cual dos o más partes llegan a un acuerdo sobre aspectos económicos o comerciales.', en: 'The process by which two or more parties reach an agreement on economic or business matters.' } },
    { icono: 'img/glosario/nivel-de-endeudamiento.png', nombre: { es: 'Nivel de endeudamiento', en: 'Debt Level' }, definicion: { es: 'Indicador que muestra qué parte de los ingresos o patrimonio está comprometida con deudas.', en: 'An indicator showing what portion of income or net worth is tied up in debt.' } },
    { icono: 'img/glosario/nota-de-credito.png', nombre: { es: 'Nota de crédito', en: 'Credit Note' }, definicion: { es: 'Documento que reduce el valor de una factura debido a devoluciones, descuentos o errores.', en: 'A document that reduces the value of an invoice due to returns, discounts, or errors.' } },
    { icono: 'img/glosario/nota-de-debito.png', nombre: { es: 'Nota de débito', en: 'Debit Note' }, definicion: { es: 'Documento utilizado para aumentar el valor de una factura por ajustes o cargos adicionales.', en: 'A document used to increase the value of an invoice due to adjustments or additional charges.' } },
    { icono: 'img/glosario/neto.png', nombre: { es: 'Neto', en: 'Net' }, definicion: { es: 'Cantidad final que queda después de descontar impuestos, gastos u otras deducciones.', en: 'The final amount left after deducting taxes, expenses, or other deductions.' } },
    { icono: 'img/glosario/necesidad-financiera.png', nombre: { es: 'Necesidad financiera', en: 'Financial Need' }, definicion: { es: 'Situación en la que una persona o empresa requiere recursos económicos para cubrir gastos o realizar inversiones.', en: 'A situation in which a person or company requires economic resources to cover expenses or make investments.' } },
    { icono: 'img/glosario/normativa-fiscal.png', nombre: { es: 'Normativa fiscal', en: 'Tax Regulations' }, definicion: { es: 'Conjunto de leyes y reglas que regulan el pago de impuestos y las obligaciones tributarias.', en: 'The set of laws and rules that regulate tax payments and tax obligations.' } },
    { icono: 'img/glosario/nacionalizacion.png', nombre: { es: 'Nacionalización', en: 'Nationalization' }, definicion: { es: 'Proceso mediante el cual el Estado toma el control de una empresa o recurso privado.', en: 'The process by which the government takes control of a private company or resource.' } },
    { icono: 'img/glosario/nicho-de-mercado.png', nombre: { es: 'Nicho de mercado', en: 'Market Niche' }, definicion: { es: 'Grupo específico de consumidores con características y necesidades similares.', en: 'A specific group of consumers with similar characteristics and needs.' } },
    { icono: 'img/glosario/negocio-rentable.png', nombre: { es: 'Negocio rentable', en: 'Profitable Business' }, definicion: { es: 'Empresa o actividad económica que genera ganancias superiores a sus costos.', en: 'A company or economic activity that generates profits higher than its costs.' } },
    { icono: 'img/glosario/numero-de-cuenta.png', nombre: { es: 'Número de cuenta', en: 'Account Number' }, definicion: { es: 'Código único que identifica una cuenta bancaria.', en: 'A unique code that identifies a bank account.' } },
    { icono: 'img/glosario/negociable.png', nombre: { es: 'Negociable', en: 'Negotiable' }, definicion: { es: 'Bien, documento o instrumento financiero que puede comprarse, venderse o transferirse.', en: 'A good, document, or financial instrument that can be bought, sold, or transferred.' } },
    { icono: 'img/glosario/nivel-de-riesgo.png', nombre: { es: 'Nivel de riesgo', en: 'Risk Level' }, definicion: { es: 'Probabilidad de que una inversión o decisión financiera genere pérdidas.', en: 'The probability that an investment or financial decision will result in losses.' } },
  ],
  O: [
    { icono: 'img/glosario/obligacion-financiera.png', nombre: { es: 'Obligación financiera', en: 'Financial Obligation' }, definicion: { es: 'Compromiso de pagar una deuda o cumplir con una responsabilidad económica dentro de un plazo establecido.', en: 'A commitment to pay a debt or fulfill an economic responsibility within a set period.' } },
    { icono: 'img/glosario/oferta.png', nombre: { es: 'Oferta', en: 'Supply' }, definicion: { es: 'Cantidad de bienes o servicios disponibles para la venta en el mercado.', en: 'The quantity of goods or services available for sale in the market.' } },
    { icono: 'img/glosario/operacion-bancaria.png', nombre: { es: 'Operación bancaria', en: 'Banking Transaction' }, definicion: { es: 'Cualquier transacción realizada con una institución financiera, como depósitos, retiros o préstamos.', en: 'Any transaction carried out with a financial institution, such as deposits, withdrawals, or loans.' } },
    { icono: 'img/glosario/orden-de-pago.png', nombre: { es: 'Orden de pago', en: 'Payment Order' }, definicion: { es: 'Instrucción para transferir una cantidad de dinero a una persona o empresa.', en: 'An instruction to transfer an amount of money to a person or company.' } },
    { icono: 'img/glosario/objetivo-financiero.png', nombre: { es: 'Objetivo financiero', en: 'Financial Goal' }, definicion: { es: 'Meta económica que una persona o empresa desea alcanzar mediante una buena administración del dinero.', en: 'An economic goal a person or company wants to reach through good money management.' } },
    { icono: 'img/glosario/obligacionista.png', nombre: { es: 'Obligacionista', en: 'Bondholder' }, definicion: { es: 'Persona que invierte comprando bonos u obligaciones emitidas por empresas o gobiernos.', en: 'A person who invests by buying bonds or debt securities issued by companies or governments.' } },
    { icono: 'img/glosario/oferta-publica.png', nombre: { es: 'Oferta pública', en: 'Public Offering' }, definicion: { es: 'Proceso mediante el cual una empresa pone acciones o bonos a disposición del público para obtener financiamiento.', en: 'The process by which a company makes shares or bonds available to the public to raise financing.' } },
    { icono: 'img/glosario/organizacion-financiera.png', nombre: { es: 'Organización financiera', en: 'Financial Organization' }, definicion: { es: 'Entidad dedicada a ofrecer servicios relacionados con el manejo del dinero y las inversiones.', en: 'An entity dedicated to offering services related to money management and investments.' } },
    { icono: 'img/glosario/operador-bursatil.png', nombre: { es: 'Operador bursátil', en: 'Stock Trader' }, definicion: { es: 'Profesional autorizado para comprar y vender valores en la bolsa.', en: 'A professional authorized to buy and sell securities on the stock exchange.' } },
    { icono: 'img/glosario/opcion-financiera.png', nombre: { es: 'Opción financiera', en: 'Financial Option' }, definicion: { es: 'Contrato que da el derecho, pero no la obligación, de comprar o vender un activo a un precio determinado.', en: 'A contract that gives the right, but not the obligation, to buy or sell an asset at a set price.' } },
    { icono: 'img/glosario/optimizacion-de-recursos.png', nombre: { es: 'Optimización de recursos', en: 'Resource Optimization' }, definicion: { es: 'Uso eficiente del dinero y los recursos disponibles para obtener mejores resultados.', en: 'The efficient use of money and available resources to achieve better results.' } },
    { icono: 'img/glosario/orden-de-compra.png', nombre: { es: 'Orden de compra', en: 'Purchase Order' }, definicion: { es: 'Documento que autoriza la adquisición de productos o servicios.', en: 'A document that authorizes the purchase of products or services.' } },
    { icono: 'img/glosario/oficina-tributaria.png', nombre: { es: 'Oficina tributaria', en: 'Tax Office' }, definicion: { es: 'Entidad gubernamental encargada de administrar la recaudación de impuestos.', en: 'A government entity responsible for managing tax collection.' } },
    { icono: 'img/glosario/overdraft-sobregiro.png', nombre: { es: 'Overdraft (Sobregiro)', en: 'Overdraft' }, definicion: { es: 'Situación en la que una cuenta bancaria queda con saldo negativo porque se retiró más dinero del disponible.', en: 'A situation in which a bank account has a negative balance because more money was withdrawn than was available.' } },
    { icono: 'img/glosario/obtencion-de-capital.png', nombre: { es: 'Obtención de capital', en: 'Capital Raising' }, definicion: { es: 'Proceso de conseguir recursos económicos mediante préstamos, inversiones o aportes de socios.', en: 'The process of raising economic resources through loans, investments, or partner contributions.' } },
  ],
  P: [
    { icono: 'img/glosario/presupuesto.png', nombre: { es: 'Presupuesto', en: 'Budget' }, definicion: { es: 'Plan financiero que organiza los ingresos y gastos para administrar mejor el dinero durante un período determinado.', en: 'A financial plan that organizes income and expenses to better manage money over a set period.' } },
    { icono: 'img/glosario/patrimonio.png', nombre: { es: 'Patrimonio', en: 'Net Worth' }, definicion: { es: 'Conjunto de bienes, derechos y obligaciones que pertenecen a una persona o empresa.', en: 'The set of assets, rights, and obligations that belong to a person or company.' } },
    { icono: 'img/glosario/prestamo.png', nombre: { es: 'Préstamo', en: 'Loan' }, definicion: { es: 'Cantidad de dinero que una entidad financiera entrega a una persona con el compromiso de devolverla junto con intereses.', en: 'An amount of money a financial institution gives to a person with the commitment to pay it back along with interest.' } },
    { icono: 'img/glosario/pago.png', nombre: { es: 'Pago', en: 'Payment' }, definicion: { es: 'Entrega de dinero para cancelar una deuda, adquirir un bien o recibir un servicio.', en: 'The delivery of money to settle a debt, acquire a good, or receive a service.' } },
    { icono: 'img/glosario/poliza.png', nombre: { es: 'Póliza', en: 'Insurance Policy' }, definicion: { es: 'Documento que establece las condiciones y coberturas de un contrato de seguro.', en: 'A document that sets out the terms and coverage of an insurance contract.' } },
    { icono: 'img/glosario/plusvalia.png', nombre: { es: 'Plusvalía', en: 'Capital Gain' }, definicion: { es: 'Incremento del valor de un bien o inversión con el paso del tiempo.', en: 'The increase in value of a good or investment over time.' } },
    { icono: 'img/glosario/plan-de-ahorro.png', nombre: { es: 'Plan de ahorro', en: 'Savings Plan' }, definicion: { es: 'Estrategia organizada para guardar dinero de forma periódica y alcanzar una meta financiera.', en: 'An organized strategy for setting aside money periodically to reach a financial goal.' } },
    { icono: 'img/glosario/pasivo.png', nombre: { es: 'Pasivo', en: 'Liability' }, definicion: { es: 'Conjunto de deudas y obligaciones económicas que una persona o empresa debe pagar.', en: 'The set of debts and financial obligations that a person or company must pay.' } },
    { icono: 'img/glosario/poder-adquisitivo.png', nombre: { es: 'Poder adquisitivo', en: 'Purchasing Power' }, definicion: { es: 'Capacidad que tiene una persona para comprar bienes y servicios con sus ingresos.', en: 'A person\'s ability to buy goods and services with their income.' } },
    { icono: 'img/glosario/portafolio-de-inversion.png', nombre: { es: 'Portafolio de inversión', en: 'Investment Portfolio' }, definicion: { es: 'Conjunto de activos financieros que posee un inversionista para diversificar sus inversiones.', en: 'The set of financial assets an investor holds to diversify their investments.' } },
    { icono: 'img/glosario/prima-de-seguro.png', nombre: { es: 'Prima de seguro', en: 'Insurance Premium' }, definicion: { es: 'Cantidad de dinero que se paga periódicamente a una aseguradora para mantener una cobertura vigente.', en: 'The amount of money paid periodically to an insurer to keep coverage active.' } },
    { icono: 'img/glosario/precio-de-mercado.png', nombre: { es: 'Precio de mercado', en: 'Market Price' }, definicion: { es: 'Valor al que un producto, servicio o activo se compra y vende en un momento determinado.', en: 'The value at which a product, service, or asset is bought and sold at a given time.' } },
    { icono: 'img/glosario/punto-de-equilibrio.png', nombre: { es: 'Punto de equilibrio', en: 'Break-Even Point' }, definicion: { es: 'Momento en el que los ingresos de un negocio son iguales a sus costos, sin generar pérdidas ni ganancias.', en: 'The point at which a business\'s income equals its costs, generating neither profit nor loss.' } },
    { icono: 'img/glosario/pagare.png', nombre: { es: 'Pagaré', en: 'Promissory Note' }, definicion: { es: 'Documento legal mediante el cual una persona se compromete a pagar una suma de dinero en una fecha establecida.', en: 'A legal document by which a person commits to paying a sum of money on a set date.' } },
    { icono: 'img/glosario/planificacion-financiera.png', nombre: { es: 'Planificación financiera', en: 'Financial Planning' }, definicion: { es: 'Proceso de organizar ingresos, gastos, ahorros e inversiones para alcanzar objetivos económicos de forma eficiente.', en: 'The process of organizing income, expenses, savings, and investments to reach economic goals efficiently.' } },
  ],
  Q: [
    { icono: 'img/glosario/quita-de-deuda.png', nombre: { es: 'Quita de deuda', en: 'Debt Write-Off' }, definicion: { es: 'Reducción parcial del monto de una deuda acordada entre el acreedor y el deudor para facilitar su pago.', en: 'A partial reduction of a debt\'s amount agreed between the creditor and debtor to make it easier to pay.' } },
    { icono: 'img/glosario/quiebra.png', nombre: { es: 'Quiebra', en: 'Bankruptcy' }, definicion: { es: 'Situación legal en la que una persona o empresa no puede pagar sus deudas y debe someterse a un proceso judicial.', en: 'A legal situation in which a person or company cannot pay its debts and must undergo a court process.' } },
    { icono: 'img/glosario/quick-ratio.png', nombre: { es: 'Quick Ratio', en: 'Quick Ratio' }, definicion: { es: 'Indicador financiero que mide la capacidad de una empresa para pagar sus deudas a corto plazo utilizando únicamente sus activos más líquidos.', en: 'A financial indicator that measures a company\'s ability to pay short-term debts using only its most liquid assets.' } },
    { icono: 'img/glosario/quincena.png', nombre: { es: 'Quincena', en: 'Fortnight' }, definicion: { es: 'Período de quince días que normalmente se utiliza para calcular y pagar salarios.', en: 'A fifteen-day period normally used to calculate and pay salaries.' } },
    { icono: 'img/glosario/quorum-de-accionistas.png', nombre: { es: 'Quórum de accionistas', en: 'Shareholder Quorum' }, definicion: { es: 'Número mínimo de accionistas que deben estar presentes para que una reunión pueda tomar decisiones válidas.', en: 'The minimum number of shareholders that must be present for a meeting to make valid decisions.' } },
  ],
  R: [
    { icono: 'img/glosario/rentabilidad.png', nombre: { es: 'Rentabilidad', en: 'Profitability' }, definicion: { es: 'Capacidad de una inversión, negocio o empresa para generar ganancias en relación con el dinero invertido.', en: 'The ability of an investment, business, or company to generate profit relative to the money invested.' } },
    { icono: 'img/glosario/riesgo.png', nombre: { es: 'Riesgo', en: 'Risk' }, definicion: { es: 'Probabilidad de sufrir pérdidas económicas al realizar una inversión o tomar una decisión financiera.', en: 'The probability of suffering financial losses when making an investment or financial decision.' } },
    { icono: 'img/glosario/reembolso.png', nombre: { es: 'Reembolso', en: 'Refund' }, definicion: { es: 'Devolución de dinero que una persona o empresa recibe después de haber realizado un pago.', en: 'The return of money a person or company receives after having made a payment.' } },
    { icono: 'img/glosario/refinanciamiento.png', nombre: { es: 'Refinanciamiento', en: 'Refinancing' }, definicion: { es: 'Proceso de modificar las condiciones de una deuda para obtener mejores plazos, tasas de interés o cuotas más bajas.', en: 'The process of modifying a debt\'s terms to get better timelines, interest rates, or lower installments.' } },
    { icono: 'img/glosario/recesion.png', nombre: { es: 'Recesión', en: 'Recession' }, definicion: { es: 'Período de disminución de la actividad económica de un país, caracterizado por menor producción, empleo y consumo.', en: 'A period of decline in a country\'s economic activity, marked by lower production, employment, and consumption.' } },
  ],
  S: [
    { icono: 'img/glosario/salario.png', nombre: { es: 'Salario', en: 'Salary' }, definicion: { es: 'Cantidad de dinero que recibe un trabajador como pago por sus servicios.', en: 'The amount of money a worker receives as payment for their services.' } },
    { icono: 'img/glosario/seguro.png', nombre: { es: 'Seguro', en: 'Insurance' }, definicion: { es: 'Contrato mediante el cual una aseguradora protege a una persona o empresa frente a determinados riesgos a cambio del pago de una prima.', en: 'A contract in which an insurer protects a person or company against certain risks in exchange for a premium.' } },
    { icono: 'img/glosario/solvencia.png', nombre: { es: 'Solvencia', en: 'Solvency' }, definicion: { es: 'Capacidad de una persona o empresa para cumplir con todas sus obligaciones financieras.', en: 'A person\'s or company\'s ability to meet all of their financial obligations.' } },
    { icono: 'img/glosario/superavit.png', nombre: { es: 'Superávit', en: 'Surplus' }, definicion: { es: 'Situación en la que los ingresos son mayores que los gastos durante un período determinado.', en: 'A situation in which income is greater than expenses during a given period.' } },
    { icono: 'img/glosario/sobregiro.png', nombre: { es: 'Sobregiro', en: 'Overdraft' }, definicion: { es: 'Ocurre cuando una persona retira o gasta más dinero del que tiene disponible en su cuenta bancaria.', en: 'Occurs when a person withdraws or spends more money than is available in their bank account.' } },
  ],
  T: [
    { icono: 'img/glosario/tasa-de-interes.png', nombre: { es: 'Tasa de interés', en: 'Interest Rate' }, definicion: { es: 'Porcentaje que se cobra o se paga por el uso de dinero prestado o invertido durante un período determinado.', en: 'A percentage charged or paid for the use of borrowed or invested money over a set period.' } },
    { icono: 'img/glosario/tarjeta-de-credito.png', nombre: { es: 'Tarjeta de crédito', en: 'Credit Card' }, definicion: { es: 'Medio de pago que permite realizar compras utilizando dinero prestado por una entidad financiera.', en: 'A means of payment that allows purchases using money lent by a financial institution.' } },
    { icono: 'img/glosario/tarjeta-de-debito.png', nombre: { es: 'Tarjeta de débito', en: 'Debit Card' }, definicion: { es: 'Tarjeta que permite realizar pagos utilizando directamente el dinero disponible en una cuenta bancaria.', en: 'A card that allows payments using money directly available in a bank account.' } },
    { icono: 'img/glosario/transferencia-bancaria.png', nombre: { es: 'Transferencia bancaria', en: 'Bank Transfer' }, definicion: { es: 'Movimiento de dinero de una cuenta bancaria hacia otra, ya sea dentro del mismo banco o entre diferentes entidades.', en: 'The movement of money from one bank account to another, whether within the same bank or between different institutions.' } },
    { icono: 'img/glosario/tipo-de-cambio.png', nombre: { es: 'Tipo de cambio', en: 'Exchange Rate' }, definicion: { es: 'Valor que determina cuánto vale una moneda en comparación con otra.', en: 'The value that determines how much one currency is worth compared to another.' } },
  ],
  U: [
    { icono: 'img/glosario/utilidad.png', nombre: { es: 'Utilidad', en: 'Profit' }, definicion: { es: 'Ganancia obtenida por una empresa después de descontar todos sus costos y gastos.', en: 'Profit obtained by a company after deducting all its costs and expenses.' } },
    { icono: 'img/glosario/utilidad-neta.png', nombre: { es: 'Utilidad neta', en: 'Net Income' }, definicion: { es: 'Beneficio final que queda después de pagar impuestos, intereses y demás obligaciones.', en: 'The final profit left after paying taxes, interest, and other obligations.' } },
    { icono: 'img/glosario/utilidad-bruta.png', nombre: { es: 'Utilidad bruta', en: 'Gross Profit' }, definicion: { es: 'Ganancia obtenida después de restar únicamente los costos directos de producción o venta.', en: 'Profit obtained after subtracting only the direct costs of production or sale.' } },
    { icono: 'img/glosario/usura.png', nombre: { es: 'Usura', en: 'Usury' }, definicion: { es: 'Cobro de intereses excesivamente altos en un préstamo, generalmente considerado ilegal.', en: 'Charging excessively high interest on a loan, generally considered illegal.' } },
    { icono: 'img/glosario/unidad-monetaria.png', nombre: { es: 'Unidad monetaria', en: 'Monetary Unit' }, definicion: { es: 'Moneda oficial utilizada por un país para realizar transacciones económicas.', en: 'The official currency used by a country for economic transactions.' } },
  ],
  V: [
    { icono: 'img/glosario/valor-de-mercado.png', nombre: { es: 'Valor de mercado', en: 'Market Value' }, definicion: { es: 'Precio al que un bien, acción o producto puede comprarse o venderse en el mercado.', en: 'The price at which a good, stock, or product can be bought or sold in the market.' } },
    { icono: 'img/glosario/volatilidad.png', nombre: { es: 'Volatilidad', en: 'Volatility' }, definicion: { es: 'Nivel de variación que experimenta el precio de un activo financiero durante un período.', en: 'The level of variation experienced by a financial asset\'s price over a period.' } },
    { icono: 'img/glosario/venta.png', nombre: { es: 'Venta', en: 'Sale' }, definicion: { es: 'Intercambio de un bien o servicio por una cantidad de dinero.', en: 'The exchange of a good or service for an amount of money.' } },
    { icono: 'img/glosario/vencimiento.png', nombre: { es: 'Vencimiento', en: 'Due Date (Maturity)' }, definicion: { es: 'Fecha límite establecida para pagar una deuda o cumplir con una obligación financiera.', en: 'The deadline set for paying a debt or fulfilling a financial obligation.' } },
    { icono: 'img/glosario/valor-nominal.png', nombre: { es: 'Valor nominal', en: 'Face Value' }, definicion: { es: 'Valor original asignado a un bono, acción o documento financiero cuando es emitido.', en: 'The original value assigned to a bond, stock, or financial document when it is issued.' } },
  ],
  W: [
    { icono: 'img/glosario/working-capital-capital-de-trabajo.png', nombre: { es: 'Working Capital (Capital de trabajo)', en: 'Working Capital' }, definicion: { es: 'Recursos disponibles que una empresa utiliza para cubrir sus gastos y operaciones diarias.', en: 'Available resources a company uses to cover its daily expenses and operations.' } },
    { icono: 'img/glosario/wire-transfer.png', nombre: { es: 'Wire Transfer', en: 'Wire Transfer' }, definicion: { es: 'Transferencia electrónica de dinero entre cuentas bancarias, especialmente entre diferentes países.', en: 'An electronic money transfer between bank accounts, especially between different countries.' } },
    { icono: 'img/glosario/warrant.png', nombre: { es: 'Warrant', en: 'Warrant' }, definicion: { es: 'Documento financiero que otorga el derecho de comprar acciones a un precio determinado antes de una fecha límite.', en: 'A financial document that grants the right to buy shares at a set price before a deadline.' } },
    { icono: 'img/glosario/web-banking.png', nombre: { es: 'Web Banking', en: 'Online Banking' }, definicion: { es: 'Servicio que permite administrar cuentas bancarias y realizar operaciones financieras por internet.', en: 'A service that allows managing bank accounts and carrying out financial operations online.' } },
    { icono: 'img/glosario/wealth-management.png', nombre: { es: 'Wealth Management', en: 'Wealth Management' }, definicion: { es: 'Servicio profesional de asesoría para administrar el patrimonio e inversiones de personas con alto poder adquisitivo.', en: 'A professional advisory service for managing the assets and investments of high-net-worth individuals.' } },
  ],
  X: [
    { icono: 'img/glosario/xenomoneda.png', nombre: { es: 'Xenomoneda', en: 'Foreign Currency' }, definicion: { es: 'Moneda utilizada fuera del país que la emitió originalmente.', en: 'Currency used outside the country that originally issued it.' } },
    { icono: 'img/glosario/xenoeconomia.png', nombre: { es: 'Xenoeconomía', en: 'International Economics' }, definicion: { es: 'Estudio de las relaciones económicas y financieras entre diferentes países.', en: 'The study of economic and financial relations between different countries.' } },
    { icono: 'img/glosario/xenocapital.png', nombre: { es: 'Xenocapital', en: 'Foreign Capital' }, definicion: { es: 'Capital proveniente de inversiones extranjeras.', en: 'Capital coming from foreign investments.' } },
    { icono: 'img/glosario/xenoinversion.png', nombre: { es: 'Xenoinversión', en: 'Foreign Investment' }, definicion: { es: 'Inversión realizada por personas o empresas en un país distinto al suyo.', en: 'Investment made by individuals or companies in a country other than their own.' } },
    { icono: 'img/glosario/xenodivisa.png', nombre: { es: 'Xenodivisa', en: 'Foreign Currency' }, definicion: { es: 'Moneda extranjera utilizada para realizar pagos o inversiones internacionales.', en: 'Foreign currency used to make payments or international investments.' } },
  ],
  Y: [
    { icono: 'img/glosario/yield.png', nombre: { es: 'Yield', en: 'Yield' }, definicion: { es: 'Rendimiento o ganancia que genera una inversión durante un período determinado.', en: 'The return or profit an investment generates over a period.' } },
    { icono: 'img/glosario/yield-curve.png', nombre: { es: 'Yield Curve', en: 'Yield Curve' }, definicion: { es: 'Gráfico que muestra la relación entre las tasas de interés y el tiempo de vencimiento de diferentes bonos.', en: 'A graph that shows the relationship between interest rates and time to maturity of different bonds.' } },
    { icono: 'img/glosario/yield-to-maturity-ytm.png', nombre: { es: 'Yield to Maturity (YTM)', en: 'Yield to Maturity (YTM)' }, definicion: { es: 'Rendimiento total que obtendrá un inversionista si mantiene un bono hasta su fecha de vencimiento.', en: 'The total return an investor will get if they hold a bond until its maturity date.' } },
    { icono: 'img/glosario/year-to-date-ytd.png', nombre: { es: 'Year to Date (YTD)', en: 'Year to Date (YTD)' }, definicion: { es: 'Expresión utilizada para indicar los resultados acumulados desde el inicio del año hasta la fecha actual.', en: 'A term used to indicate accumulated results from the start of the year to the current date.' } },
    { icono: 'img/glosario/yen.png', nombre: { es: 'Yen', en: 'Yen' }, definicion: { es: 'Moneda oficial de Japón y una de las divisas más negociadas en los mercados financieros internacionales.', en: 'The official currency of Japan and one of the most traded currencies in international financial markets.' } },
  ],
  Z: [
    { icono: 'img/glosario/zona-franca.png', nombre: { es: 'Zona franca', en: 'Free Trade Zone' }, definicion: { es: 'Área donde las empresas reciben beneficios fiscales y aduaneros para fomentar el comercio y la inversión.', en: 'An area where companies receive tax and customs benefits to encourage trade and investment.' } },
    { icono: 'img/glosario/zero-coupon-bond.png', nombre: { es: 'Zero Coupon Bond', en: 'Zero Coupon Bond' }, definicion: { es: 'Bono que no paga intereses periódicos y se vende a un precio menor que su valor final.', en: 'A bond that pays no periodic interest and is sold at a price lower than its final value.' } },
    { icono: 'img/glosario/z-score.png', nombre: { es: 'Z-Score', en: 'Z-Score' }, definicion: { es: 'Indicador financiero utilizado para medir la probabilidad de que una empresa enfrente problemas de solvencia o quiebra.', en: 'A financial indicator used to measure the probability that a company will face solvency or bankruptcy problems.' } },
    { icono: 'img/glosario/zona-monetaria.png', nombre: { es: 'Zona monetaria', en: 'Monetary Zone' }, definicion: { es: 'Conjunto de países o regiones que comparten una misma moneda o política monetaria.', en: 'A group of countries or regions that share the same currency or monetary policy.' } },
    { icono: 'img/glosario/zero-balance-account.png', nombre: { es: 'Zero Balance Account', en: 'Zero Balance Account' }, definicion: { es: 'Cuenta bancaria diseñada para mantener un saldo cercano a cero, transfiriendo automáticamente fondos cuando es necesario.', en: 'A bank account designed to maintain a balance near zero, automatically transferring funds when needed.' } },
  ],
};
// Textos de la interfaz que el JS necesita en los dos idiomas
const textosUI = {
  sinTerminos: { es: 'No hay términos para la letra', en: 'No terms yet for the letter' },
  sinResultados: { es: 'No se encontraron resultados para', en: 'No results found for' }
};

// Idioma actual y qué se está mostrando (para poder re-generar la
// lista sin perder el filtro cuando el usuario cambia de idioma)
let currentLang = localStorage.getItem('lang') || 'es';
let letraActiva = 'A';


// ============================================
// ALFABETO — genera los botones de las letras que sí tienen
// términos + la lupa (evita escribir 27 botones a mano en el HTML)
// ============================================
function generarAlfabeto() {
  const contenedor = document.getElementById('alfabeto');
  const letras = Object.keys(terminos); // solo las letras que existen en los datos

  const botonesLetras = letras.map(l =>
    `<button class="letra${l === letraActiva ? ' active' : ''}" data-letra="${l}">${l}</button>`
  ).join('');

  contenedor.innerHTML = `${botonesLetras}<button class="letra buscar" id="btn-buscar">🔍</button>`;

  // Los botones se crean aquí, así que sus eventos se conectan aquí también
  contenedor.querySelectorAll('.letra:not(.buscar)').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.letra').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('barra-busqueda').style.display = 'none';

      letraActiva = btn.dataset.letra;
      mostrarTerminos(letraActiva);
    });
  });

  document.getElementById('btn-buscar').addEventListener('click', () => {
    const barra = document.getElementById('barra-busqueda');
    barra.style.display = barra.style.display === 'block' ? 'none' : 'block';
    if (barra.style.display === 'block') {
      document.getElementById('input-busqueda').focus();
    }
  });
}


// ============================================
// FUNCIÓN — genera el HTML de una lista de términos
// ============================================
function generarHTML(lista) {
  return lista.map(t => `
    <div class="termino-item">
      <div class="termino-icono">
        <img src="${t.icono}" alt="${t.nombre[currentLang]}">
      </div>
      <div class="termino-texto">
        <h3>${t.nombre[currentLang]}</h3>
        <p>${t.definicion[currentLang]}</p>
      </div>
    </div>
  `).join('');
}


// ============================================
// FUNCIÓN — muestra los términos de una letra
// ============================================
function mostrarTerminos(letra) {
  const lista = document.getElementById('terminos-lista');
  const datos = terminos[letra];

  if (!datos || datos.length === 0) {
    lista.innerHTML = `<p style="color:#6b7280;padding:16px">${textosUI.sinTerminos[currentLang]} <strong>${letra}</strong>.</p>`;
    return;
  }

  lista.innerHTML = generarHTML(datos);
}


// ============================================
// FUNCIÓN — busca términos en todas las letras
// ============================================
function buscarTerminos(texto) {
  const lista = document.getElementById('terminos-lista');
  const query = texto.toLowerCase();

  const resultados = Object.values(terminos).flat().filter(t =>
    t.nombre[currentLang].toLowerCase().includes(query) ||
    t.definicion[currentLang].toLowerCase().includes(query)
  );

  if (resultados.length === 0) {
    lista.innerHTML = `<p style="color:#6b7280;padding:16px">${textosUI.sinResultados[currentLang]} "<strong>${texto}</strong>".</p>`;
    return;
  }

  lista.innerHTML = generarHTML(resultados);
}


// ============================================
// EVENTO — búsqueda en tiempo real mientras escribe
// ============================================
document.getElementById('input-busqueda').addEventListener('input', e => {
  const texto = e.target.value.trim();
  texto.length >= 2 ? buscarTerminos(texto) : mostrarTerminos(letraActiva);
});


// ============================================
// IDIOMA — cambia texto, banderas y vuelve a pintar el glosario
// ============================================
function setLang(lang) {
    currentLang = lang;

    document.querySelectorAll('[data-es][data-en]').forEach(el => {
        // Si el elemento tiene OTRO elemento traducible adentro, lo saltamos
        // para no borrar ese hijo al hacerle textContent al padre.
        if (el.querySelector('[data-es][data-en]')) return;
        el.textContent = el.dataset[lang];
    });

    // El placeholder de un <input> no se traduce con textContent
    const inputBusqueda = document.getElementById('input-busqueda');
    inputBusqueda.placeholder = lang === 'es'
        ? inputBusqueda.dataset.placeholderEs
        : inputBusqueda.dataset.placeholderEn;

    document.querySelectorAll('.language-switcher img').forEach(img => {
        img.classList.remove('active');
    });
    const activeFlag = document.querySelector(
        `.language-switcher img[alt="${lang === 'es' ? 'ES' : 'EN'}"]`
    );
    if (activeFlag) activeFlag.classList.add('active');

    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);

    // Vuelve a pintar el glosario en el nuevo idioma, respetando
    // si el usuario tenía una letra elegida o una búsqueda activa
    const textoBusqueda = inputBusqueda.value.trim();
    textoBusqueda.length >= 2 ? buscarTerminos(textoBusqueda) : mostrarTerminos(letraActiva);
}


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
    // submenú en vez de navegar directo al href. El segundo tap navega.
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


// ============================================
// INICIO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    generarAlfabeto();
    setActiveNavLink();
    setLang(currentLang); // pinta textos, banderas y la primera letra ya traducidos
});

// ============================================
// Linea Scroll
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

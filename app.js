/**
 * DocuInsight - Main Application Logic
 * Integración Real Serverless: Frontend UI -> Supabase PostgreSQL -> n8n Automation
 */

// --- CONFIGURACIÓN DE CONEXIÓN REAL ---


const SUPABASE_URL = 'https://basvbmjybtuatwfztatk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kQW_coS562vdyk91m5tc4Q_E9QTcHUM_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhc3ZibWp5YnR1YXR3Znp0YXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDk5NzAsImV4cCI6MjA4NzgyNTk3MH0.AfvYYziUj6hBXRocpzljmfuRJQHDdjxZtXZigHYhLZI'; // (Key reconstruida por seguridad visual)
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/recibir-documento'; // PRODUCCIÓN: workflow activo

// Nota de Integración: Debido al formato en que se provee el JWT token pegado a la KEY en la respuesta, lo aislo:
const CLEAN_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhc3ZibWp5YnR1YXR3Znp0YXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDk5NzAsImV4cCI6MjA4NzgyNTk3MH0.AfvYYziUj6hBXRocpzljmfuRJQHDdjxZtXZigHYhLZI';

// Inicializar cliente de forma segura para evitar bloquear la UI
// Configuraciones dinámicas de la base de datos
let dynamicDocumentTypes = [];

let supabaseClient;
try {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, CLEAN_SUPABASE_KEY);
    } else {
        console.warn("⚠️ SDK de Supabase no cargado a tiempo. Reintentará más tarde.");
    }
} catch (e) {
    console.error("❌ Error inicializando Supabase:", e);
}

// --- COGNITIVE ENGINE (Reemplazado por n8n Webhook) ---
class N8NEngine {
    constructor() { }

    async processDocument(file) {
        return new Promise(async (resolve) => {
            console.log(`Enviando archivo a n8n: ${file.name}`);

            try {
                const formData = new FormData();
                formData.append('data', file);
                formData.append('nombre_archivo', file.name); // Data adicional para que n8n pueda guardarlo

                // Esperamos el resultado de la subida a n8n
                const response = await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Error en el servidor: ${response.status}`);
                }

                // Resolvemos una vez que n8n haya recibido con éxito el documento
                resolve({ found: true, success: true });

            } catch (e) {
                console.error("No se alcanzó n8n:", e);
                resolve({ found: false, error: e.message });
            }
        });
    }
}

// --- UI CONTROLLER ---
class App {
    constructor() {
        this.engine = new N8NEngine(); // Ahora usamos el engine real hacia n8n
        this.currentView = 'metrics-view'; // Default to Dashboard
        this.docViewMode = 'card'; // Default view mode: 'card' or 'list'

        // PDF Context State
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.scale = 1.2;
        this.pdfCanvas = document.createElement('canvas');
        this.pdfCtx = this.pdfCanvas.getContext('2d');
        this.pdfCanvas.style.display = 'block';
        this.pdfCanvas.style.margin = '0 auto';

        this.initEventListeners();
        this.initSidebarToggle();
        this.initRealtimeSubscription();

        // Ensure UI matches state
        this.switchView(this.currentView);
    }

    initRealtimeSubscription() {
        if (!supabaseClient) return;

        console.log("📡 Configurando suscripción de tiempo real a Supabase...");
        supabaseClient
            .channel('table-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'trazabilidad_procesos' },
                (payload) => {
                    console.log('🔄 Notificación Realtime de DB:', payload);
                    // Refrescar la vista activa cuando llegan cambios de BD
                    if (this.currentView === 'metrics-view') {
                        this.renderMetrics();
                    } else if (this.currentView === 'dashboard-view') {
                        this.renderDashboardList();
                    }
                }
            )
            .subscribe();
    }

    initSidebarToggle() {
        const toggleBtn = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');

        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }
    }

    safeAddListener(id, event, handler) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener(event, handler);
        } else {
            console.warn(`Elemento no encontrado para listener: ${id}`);
        }
    }

    initEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const viewId = btn.getAttribute('data-view');
                this.switchView(viewId);
            });
        });

        // File Upload
        this.safeAddListener('select-file-btn', 'click', () => document.getElementById('file-input').click());
        this.safeAddListener('file-input', 'change', (e) => {
            if (e.target.files.length > 0) this.handleFileUpload(e.target.files);
        });

        // Add more files to batch
        this.safeAddListener('add-more-files-btn', 'click', () => document.getElementById('file-input').click());

        // Admin: Add Type - Logic updated to use Modal
        this.safeAddListener('add-doctype-btn', 'click', () => this.openAddDocTypeModal());

        // Admin: Confirm Add Type
        this.safeAddListener('confirm-add-doctype-btn', 'click', () => this.confirmAddDocType());

        // Admin: Close Add Modal
        const closeAddModal = () => document.getElementById('add-doctype-modal').classList.add('hidden');
        this.safeAddListener('close-add-modal-btn', 'click', closeAddModal);
        this.safeAddListener('cancel-add-modal-btn', 'click', closeAddModal);

        // Admin: Training Actions
        this.safeAddListener('start-training-btn', 'click', () => this.startTrainingSimulation());
        this.safeAddListener('cancel-training-btn', 'click', () => this.closeTrainingPanel());

        // New Action Buttons
        this.safeAddListener('process-upload-btn', 'click', () => this.processCurrentFile());
        this.safeAddListener('cancel-upload-btn', 'click', () => this.resetUploadState());
        this.safeAddListener('back-to-list-btn', 'click', () => this.renderDashboardList());

        // Live Search Filters
        this.safeAddListener('dashboard-search-input', 'input', () => this.filterDashboardList());
        this.safeAddListener('filter-type-select', 'change', () => this.filterDashboardList());
        this.safeAddListener('filter-status-select', 'change', () => this.filterDashboardList());
        this.safeAddListener('filter-date-select', 'change', () => this.filterDashboardList());
        this.safeAddListener('dashboard-clear-filters-btn', 'click', () => {
            const searchInput = document.getElementById('dashboard-search-input');
            const typeSelect = document.getElementById('filter-type-select');
            const statusSelect = document.getElementById('filter-status-select');
            const dateSelect = document.getElementById('filter-date-select');
            if (searchInput) searchInput.value = '';
            if (typeSelect) typeSelect.value = '';
            if (statusSelect) statusSelect.value = '';
            if (dateSelect) dateSelect.value = '';
            this.filterDashboardList();
        });

        // View Toggle Buttons
        this.safeAddListener('view-card-btn', 'click', () => this.toggleDocView('card'));
        this.safeAddListener('view-list-btn', 'click', () => this.toggleDocView('list'));

        // PDF Controls
        this.safeAddListener('pdf-prev-btn', 'click', () => this.onPdfPrevPage());
        this.safeAddListener('pdf-next-btn', 'click', () => this.onPdfNextPage());
        this.safeAddListener('pdf-zoom-in', 'click', () => this.onPdfZoomIn());
        this.safeAddListener('pdf-zoom-out', 'click', () => this.onPdfZoomOut());

        // Drag & Drop
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => this.preventDefaults(e), false);
            });

            dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
            dropZone.addEventListener('drop', (e) => {
                dropZone.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) this.handleFileUpload(e.dataTransfer.files);
            });
        }
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    switchView(viewId) {
        try {
            console.log("Switching to view:", viewId);

            // Nav State
            document.querySelectorAll('.nav-item').forEach(btn => {
                if (btn.getAttribute('data-view') === viewId) btn.classList.add('active');
                else btn.classList.remove('active');
            });

            // View Visibility - Direct Style Manipulation for robustness
            const sections = document.querySelectorAll('.view-section');
            sections.forEach(section => {
                if (section.id === viewId) {
                    section.style.display = 'block';
                    section.classList.add('active');

                    // Trigger chart resize if needed
                    if (viewId === 'metrics-view' && this.charts) {
                        setTimeout(() => {
                            Object.values(this.charts).forEach(c => c && typeof c.resize === 'function' && c.resize());
                        }, 50);
                    }
                } else {
                    section.style.display = 'none';
                    section.classList.remove('active');
                }
            });

            // Title
            const titleMap = {
                'metrics-view': 'Tablero de Control',
                'upload-view': 'Intake de Documentos',
                'dashboard-view': 'Resultados del Análisis Visual',
                'admin-view': 'Gobierno de Tipologías'
            };
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) pageTitle.innerText = titleMap[viewId] || 'DocuInsight';

            // Specific View logic
            if (viewId === 'metrics-view') this.renderMetrics();
            if (viewId === 'dashboard-view') this.renderDashboardList();
            if (viewId === 'admin-view') this.renderAdminRules();

        } catch (error) {
            console.error("Error switching view:", error);
        }
    }

    renderMetrics() {
        this.initDashboard();
    }

    async fetchDashboardMetrics() {
        if (!supabaseClient) return [];
        try {
            const { data, error } = await supabaseClient
                .from('trazabilidad_procesos')
                .select('*');
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Error fetching metrics:", e);
            return [];
        }
    }

    async initDashboard() {
        if (typeof Chart === 'undefined') {
            console.error("CRITICAL: Chart is undefined. Script not loaded?");
            return;
        }

        try {
            // Destroy existing charts
            if (this.charts) {
                Object.values(this.charts).forEach(chart => {
                    if (chart && typeof chart.destroy === 'function') chart.destroy();
                });
            }
            this.charts = {};

            // FETCH REAL DATA
            const rawData = await this.fetchDashboardMetrics();

            // agrupar por id_caso para obtener la última fase de cada doc
            const docsMap = {};
            rawData.forEach(item => {
                if (!docsMap[item.id_caso]) docsMap[item.id_caso] = item;
                // Si ya existe, nos quedamos con el más reciente
                else if (new Date(item.fecha) > new Date(docsMap[item.id_caso].fecha)) {
                    docsMap[item.id_caso] = item;
                }
            });
            const uniqueDocs = Object.values(docsMap);

            const totalDocs = uniqueDocs.length;
            const completedDocs = uniqueDocs.filter(d => {
                const f = (d.fase || '').toUpperCase();
                return f.includes('COMPLETADO') || f.includes('VALIDADO');
            }).length;

            const pendingDocs = totalDocs - completedDocs;

            const stpDocs = uniqueDocs.filter(d => {
                const f = (d.fase || '').toUpperCase();
                return f.includes('ROBOT_VALIDADA') || (f.includes('COMPLETADO') && !f.includes('HUMAN'));
            }).length;
            const humanDocs = uniqueDocs.filter(d => {
                const f = (d.fase || '').toUpperCase();
                return f.includes('VALIDACION_HUMANA') || f.includes('ERROR') || f.includes('FALLO');
            }).length;

            let savings = (completedDocs * 12.5).toFixed(1); // $12.5 saving per processed doc
            let stpRate = totalDocs > 0 ? Math.round((stpDocs / totalDocs) * 100) : 0;

            // Avg speed estimate
            let avgSpeed = totalDocs > 0 ? 1.2 : 0;

            // Animate Top Level KPIs
            this.animateValue("kpi-total-docs", 0, totalDocs, 1000);
            if (document.getElementById("kpi-pending-docs")) document.getElementById("kpi-pending-docs").innerText = pendingDocs;
            this.animateValue("kpi-stp", 0, stpRate, 1000, "%");
            if (document.getElementById("kpi-speed")) document.getElementById("kpi-speed").innerText = totalDocs > 0 ? avgSpeed + "s" : "-";

            const kpiSavings = document.getElementById("kpi-savings");
            if (kpiSavings) {
                const kpiVal = kpiSavings.querySelector('.kpi-value');
                if (kpiVal) kpiVal.innerText = '$' + savings + 'k';
            }

            // Helper to get context safely
            const getCtx = (id) => {
                const el = document.getElementById(id);
                if (!el) return null;
                return el.getContext('2d');
            };

            // ---- Data Aggregation Logic ----

            // 1. Doc Types
            let typeCounts = {};

            // 2. Accuracy per category
            let catConfianza = {};
            let catCounts = {};

            // 3. Volume by Day (Last 5 Days)
            const today = new Date();
            const formatDay = (d) => ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'][d.getDay()];
            const last5DaysData = [];
            for (let i = 4; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                last5DaysData.push({ dateStr: d.toISOString().split('T')[0], label: formatDay(d), count: 0 });
            }

            // 4. Efficiency by Month (Last 6 Months)
            const last6Months = [];
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                last6Months.push({ m: d.getMonth(), y: d.getFullYear(), name: monthNames[d.getMonth()] });
            }
            let efficiencyDocsAI = [0, 0, 0, 0, 0, 0];
            let efficiencyDocsManual = [0, 0, 0, 0, 0, 0];

            // 5. Error Pareto
            let errorReasons = {}; // Dynamic error reasons map

            // 6. SLA
            let slaMeet = 0;
            let slaMiss = 0;

            uniqueDocs.forEach(d => {
                const f = (d.fase || '').toUpperCase();
                let cat = 'Otros';
                if (d.resultado_ia) {
                    const ai = d.resultado_ia;
                    cat = ai.categoria || (ai.output && ai.output.tipo_documental) || d.categoria_detectada || 'Otros';
                    cat = String(cat).replace(/_/g, ' ');
                } else if (d.categoria_detectada) {
                    cat = d.categoria_detectada.replace(/_/g, ' ');
                }

                if (typeCounts[cat]) typeCounts[cat]++; else typeCounts[cat] = 1;

                // Confidence — try DB column first, then resultado_ia, then auto-calc
                let conf = null;
                if (d.confianza_general != null) {
                    conf = parseFloat(d.confianza_general);
                } else if (d.resultado_ia) {
                    const ai = d.resultado_ia;
                    if (ai.confianza_general) {
                        conf = parseFloat(ai.confianza_general);
                    } else if (ai.output && ai.output.confianza_general) {
                        conf = parseFloat(ai.output.confianza_general);
                    } else if (ai.output && typeof ai.output === 'object') {
                        const fields = Object.values(ai.output);
                        const confs = fields.filter(v => typeof v === 'object' && v !== null && v.confianza).map(v => parseFloat(v.confianza));
                        if (confs.length > 0) conf = Math.round(confs.reduce((a, b) => a + b, 0) / confs.length);
                    }
                }
                if (conf !== null && !isNaN(conf)) {
                    if (!catConfianza[cat]) { catConfianza[cat] = 0; catCounts[cat] = 0; }
                    catConfianza[cat] += conf;
                    catCounts[cat]++;
                }

                // Volume
                if (d.fecha) {
                    const docDate = d.fecha.split('T')[0];
                    const dayTarget = last5DaysData.find(x => x.dateStr === docDate);
                    if (dayTarget) dayTarget.count++;

                    const dObj = new Date(d.fecha);
                    const mIndex = last6Months.findIndex(m => m.m === dObj.getMonth() && m.y === dObj.getFullYear());
                    if (mIndex !== -1) {
                        if (f.includes('ROBOT_VALIDADA') || (f.includes('COMPLETADO') && !f.includes('HUMAN'))) {
                            efficiencyDocsAI[mIndex]++;
                        } else {
                            efficiencyDocsManual[mIndex]++;
                        }
                    }
                }

                // Errors
                if (f.includes('ERROR') || f.includes('FALLO')) {
                    const obs = (d.observaciones && d.observaciones.trim() !== '') ? d.observaciones : 'Error Desconocido en el Flujo';
                    // Truncate long error messages for pareto
                    const reason = obs.length > 30 ? obs.substring(0, 30) + '...' : obs;
                    if (!errorReasons[reason]) errorReasons[reason] = 0;
                    errorReasons[reason]++;
                }

                // SLA (Assume <2 errors means met, otherwise missed if fallen into error)
                if (f.includes('ERROR') || f.includes('FALLO') || f.includes('RECHAZADO')) slaMiss++;
                else slaMeet++;
            });

            if (Object.keys(typeCounts).length === 0) typeCounts['Sin Datos'] = 1;

            // ---- Render Charts ----

            // 1. Efficiency Trend
            const ctxEfficiency = getCtx('efficiencyChart');
            if (ctxEfficiency) {
                this.charts.efficiency = new Chart(ctxEfficiency, {
                    type: 'line',
                    data: {
                        labels: last6Months.map(x => x.name),
                        datasets: [{
                            label: 'Volumen Manual (Docs)',
                            data: efficiencyDocsManual,
                            borderColor: '#ff6384',
                            tension: 0.4
                        }, {
                            label: 'Volumen IA (Docs)',
                            data: efficiencyDocsAI,
                            borderColor: '#005f9f',
                            backgroundColor: 'rgba(0, 95, 159, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
                });
            }

            // 2. Document Types (Doughnut)
            // Generador de paleta dinámica
            const getDynamicColors = (count) => {
                const baseColors = ['#005f9f', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4'];
                while (baseColors.length < count) {
                    baseColors.push('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
                }
                return baseColors.slice(0, count);
            };

            const ctxTypes = getCtx('docTypeChart');
            if (ctxTypes) {
                const keys = Object.keys(typeCounts);
                this.charts.types = new Chart(ctxTypes, {
                    type: 'doughnut',
                    data: {
                        labels: keys,
                        datasets: [{
                            data: totalDocs > 0 ? Object.values(typeCounts) : [1],
                            backgroundColor: totalDocs > 0 ? getDynamicColors(keys.length) : ['#e0e0e0']
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
                });
            }

            // 3. Accuracy Bar Chart
            const accuracyLabels = Object.keys(typeCounts);
            const accuracyData = accuracyLabels.map(cat => {
                if (catCounts[cat] > 0) return (catConfianza[cat] / catCounts[cat]).toFixed(1);
                return 0; // Fallback real, 0 si no hay confianza recolectada
            });

            const ctxAccuracy = getCtx('accuracyChart');
            if (ctxAccuracy) {
                this.charts.accuracy = new Chart(ctxAccuracy, {
                    type: 'bar',
                    data: {
                        labels: accuracyLabels,
                        datasets: [{
                            label: 'Precisión % promedio',
                            data: accuracyData,
                            backgroundColor: '#4CAF50',
                            borderRadius: 4
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, min: 0, max: 100 } }, plugins: { legend: { display: false } } }
                });
            }

            // 4. Volume Chart (Last 5 days)
            const ctxVolume = getCtx('volumeChart');
            if (ctxVolume) {
                this.charts.volume = new Chart(ctxVolume, {
                    type: 'bar',
                    data: {
                        labels: last5DaysData.map(d => d.label),
                        datasets: [{
                            label: 'Docs Radicados',
                            data: last5DaysData.map(d => d.count),
                            backgroundColor: '#005f9f',
                            borderRadius: 4
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                });
            }

            // 5. SLA Compliance
            const ctxSLA = getCtx('slaGauge');
            if (ctxSLA) {
                let sPct = totalDocs > 0 ? Math.round((slaMeet / totalDocs) * 100) : 0;
                this.charts.sla = new Chart(ctxSLA, {
                    type: 'doughnut',
                    data: {
                        labels: ['Cumplimiento', 'Brecha/Error'],
                        datasets: [{
                            data: totalDocs > 0 ? [sPct, 100 - sPct] : [0, 100],
                            backgroundColor: totalDocs > 0 ? ['#4CAF50', '#e0e0e0'] : ['#fafafa', '#e0e0e0'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false, circumference: 180, rotation: -90, cutout: '75%',
                        plugins: { legend: { display: false }, tooltip: { enabled: false } }
                    }
                });
            }

            // Update SLA gauge label dynamically
            const slaGaugeLabel = document.getElementById('sla-gauge-value');
            if (slaGaugeLabel) {
                let sPctLabel = totalDocs > 0 ? Math.round((slaMeet / totalDocs) * 100) : 0;
                slaGaugeLabel.innerText = sPctLabel;
            }

            // Update ROI dynamically
            const roiEl = document.getElementById('roi-value');
            if (roiEl) {
                if (completedDocs > 0) {
                    const savingsPerDoc = 12.5;
                    const costPerDoc = 2.97;
                    const roi = Math.round(((savingsPerDoc - costPerDoc) / costPerDoc) * 100);
                    roiEl.innerText = roi + '%';
                } else {
                    roiEl.innerText = '0%';
                }
            }

            // 6. Human Retention
            const ctxRetention = getCtx('humanRetentionChart');
            if (ctxRetention) {
                this.charts.retention = new Chart(ctxRetention, {
                    type: 'pie',
                    data: {
                        labels: ['Automático (STP)', 'Atención Humana'],
                        datasets: [{
                            data: totalDocs > 0 ? [stpDocs, humanDocs] : [0, 100],
                            backgroundColor: totalDocs > 0 ? ['#005f9f', '#FF9800'] : ['#e0e0e0', '#e0e0e0'],
                            borderWidth: 1
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
                });
            }

            // 7. Error Pareto
            const ctxPareto = getCtx('errorParetoChart');
            if (ctxPareto) {
                // If there are no errors, show a placeholder
                const errorKeys = Object.keys(errorReasons);
                const showEmptyErrors = errorKeys.length === 0;

                this.charts.pareto = new Chart(ctxPareto, {
                    type: 'bar',
                    data: {
                        labels: showEmptyErrors ? ['Sin errores'] : errorKeys,
                        datasets: [{
                            label: 'Causas de Rechazo',
                            data: showEmptyErrors ? [0] : Object.values(errorReasons),
                            backgroundColor: '#ff6384',
                            borderRadius: 4
                        }]
                    },
                    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                });
            }

        } catch (e) {
            console.error("Dashboard init error:", e);
        }
    }

    animateValue(id, start, end, duration, suffix = '') {
        const obj = document.getElementById(id);
        if (!obj) return;

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(progress * (end - start) + start);

            // Handle decimal simulation for suffix
            let display = current;
            if (suffix.includes('.')) {
                display = current; // Simplified
            }

            obj.innerText = display + suffix;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                if (suffix === '.5M') obj.innerText = '$' + end + suffix;
                else obj.innerText = end + suffix;
            }
        };
        window.requestAnimationFrame(step);
    }

    // Step 1: User selects multiple files -> Queue them
    async handleFileUpload(files) {
        // Normalize single file to array if dropped
        const fileArray = files instanceof FileList ? Array.from(files) : (Array.isArray(files) ? files : [files]);

        // Initialize if empty, otherwise push to existing
        if (!this.uploadQueue) {
            this.uploadQueue = [];
        }

        const newItems = fileArray.map(f => ({ file: f, status: 'pending', result: null }));
        this.uploadQueue.push(...newItems);

        // Render Queue
        this.renderBatchQueue();
    }

    renderBatchQueue() {
        const listDiv = document.getElementById('batch-queue-list');
        const countBadge = document.getElementById('queue-count-badge');

        if (countBadge) countBadge.innerText = this.uploadQueue.length;

        if (!this.uploadQueue || this.uploadQueue.length === 0) {
            listDiv.innerHTML = `
                <div class="queue-empty-state" id="queue-empty-state" style="text-align: center; color: var(--text-light); padding: 3rem 1rem; font-style: italic;">
                    <p>Selecciona documentos para añadir a la cola</p>
                </div>
            `;
            return;
        }

        listDiv.innerHTML = '';

        this.uploadQueue.forEach((item, index) => {
            const sizeKB = (item.file.size / 1024).toFixed(1);
            let icon = '📄';
            if (item.file.type === 'application/pdf') icon = '📕';
            else if (item.file.type.startsWith('image/')) icon = '🖼️';

            const div = document.createElement('div');
            div.className = `queue-item ${item.status}`;
            div.id = `queue-item-${index}`;

            let statusText = 'En cola...';
            if (item.status === 'active') statusText = 'Subiendo a servidor...';
            else if (item.status === 'success') statusText = 'Completado';

            div.innerHTML = `
                <div class="queue-item-icon">${icon}</div>
                <div class="queue-item-details">
                    <span class="queue-item-name">${item.file.name}</span>
                    <span class="queue-item-status">${sizeKB} KB - ${statusText}</span>
                </div>
            `;
            listDiv.appendChild(div);
        });
    }

    // Step 2: User clicks "Vaciar"
    resetUploadState() {
        this.uploadQueue = [];
        document.getElementById('file-input').value = ''; // Reset input
        document.getElementById('batch-progress-panel').classList.add('hidden');
        this.renderBatchQueue();
    }

    // Utility for simulated delay
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async processCurrentFile() {
        if (!this.uploadQueue || this.uploadQueue.length === 0) {
            alert('Error: No hay archivos seleccionados para procesar.');
            return;
        }

        const processBtn = document.getElementById('process-upload-btn');
        processBtn.disabled = true;

        const progressPanel = document.getElementById('batch-progress-panel');
        const progressFill = document.getElementById('batch-progress-fill');
        const progressText = document.getElementById('batch-progress-text');

        progressPanel.classList.remove('hidden');

        try {
            // Lógica asíncrona Multi-archivo usando Promise.all para enviar en paralelo a n8n
            let completedCount = 0;
            const promises = this.uploadQueue.map(async (item) => {
                if (item.status === 'success') {
                    completedCount++;
                    return item; // Skip already uploaded items if any
                }

                item.status = 'active';
                this.renderBatchQueue();

                // 2. Transmisión HTTP bloqueante a n8n por cada archivo individualmente (1-to-1)
                item.result = await this.engine.processDocument(item.file);

                if (item.result && item.result.success) {
                    item.status = 'success';
                } else {
                    item.status = 'error';
                    console.error("Error procesando:", item.file.name, item.result);
                    // Mostrar error visual al usuario
                    this.showErrorModal(
                        `Error al procesar: ${item.file.name}`,
                        item.result?.error || 'No se pudo conectar con el servidor de procesamiento (n8n). Verifica que el servicio esté activo en localhost:5678.'
                    );
                }

                completedCount++;
                this.renderBatchQueue();

                // Calculamos proreso dinámico por cada subida acabada
                const pct = Math.floor((completedCount / this.uploadQueue.length) * 100);
                progressFill.style.width = `${pct}%`;
                progressText.innerText = `Procesando ${completedCount} de ${this.uploadQueue.length} expedientes...`;

                return item;
            });

            await Promise.all(promises); // Esperar a que el envío batch complete
            await this.wait(1000); // Pausa visual

            progressPanel.classList.add('hidden');
            processBtn.disabled = false;

            // Recargamos el dashboard para mostrar los nuevos placeholders (y lo procesado)
            this.switchView('dashboard-view');
            this.renderDashboardList();
            this.resetUploadState();

        } catch (error) {
            console.error('Batch Processing error:', error);
            alert('Error procesando el lote: ' + error.message);
        } finally {
            processBtn.disabled = false;
        }
    }

    async renderDashboardList() {
        const tbody = document.getElementById('docs-table-body');
        if (!tbody) return;

        // Limpiar y mostrar estado de carga
        document.getElementById('dashboard-list-view').classList.remove('hidden');
        document.getElementById('dashboard-detail-view').classList.add('hidden');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-light);">Cargando Bandeja de Trabajo desde Base de Datos...</td></tr>';

        try {
            // LECTURA REAL DESDE SUPABASE 
            if (!supabaseClient) throw new Error("Supabase Client no inicializado");

            const { data, error } = await supabaseClient
                .from('trazabilidad_procesos')
                .select('*')
                .order('fecha', { ascending: false }); // Usar la columna correcta 'fecha'

            if (error) throw error;

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6"><div class="docs-table-empty"><div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📭</div><h3>Bandeja Vacía</h3><p>No hay documentos pendientes de procesar.</p></div></td></tr>';
                return;
            }

            tbody.innerHTML = '';

            // Ya que el backend crea una fila por FASE para el mismo id_caso, 
            // agrupamos para quedarnos con el registro más reciente de cada documento.
            // IMPORTANTE: Conservamos propiedades pesadas (como resultado_ia) de filas más antiguas 
            // si la nueva fila de cambio de estado las omitió.
            const docsMap = {};
            data.forEach(item => {
                if (!docsMap[item.id_caso]) {
                    docsMap[item.id_caso] = { ...item };
                } else {
                    // Si el estado antiguo tenía resultados de IA y el nuevo vino nulo, rescatarlo
                    if (!docsMap[item.id_caso].resultado_ia && item.resultado_ia) {
                        docsMap[item.id_caso].resultado_ia = item.resultado_ia;
                    }
                    if (!docsMap[item.id_caso].categoria_detectada && item.categoria_detectada) {
                        docsMap[item.id_caso].categoria_detectada = item.categoria_detectada;
                    }
                }
            });

            const latestDocs = Object.values(docsMap);
            this.processedDocs = latestDocs; // Para la referencia del onClick

            // Limpiamos el query al cargar
            const searchInput = document.getElementById('dashboard-search-input');
            if (searchInput) searchInput.value = '';

            this.renderDocsArray(latestDocs);

        } catch (err) {
            console.error("Supabase Error:", err);
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--error-color);"><strong>Falla de Conexión</strong><br>${err.message}</td></tr>`;
        }
    }

    // --- LOGICA DE FILTRO LIVE SEARCH ---
    filterDashboardList() {
        if (!this.processedDocs) return;

        const textQuery = (document.getElementById('dashboard-search-input')?.value || '').toLowerCase().trim();
        const typeQuery = (document.getElementById('filter-type-select')?.value || '').toLowerCase();
        const statusQuery = (document.getElementById('filter-status-select')?.value || '').toLowerCase();
        const dateQuery = document.getElementById('filter-date-select')?.value || ''; // Format YYYY-MM-DD

        const filteredDocs = this.processedDocs.filter(item => {
            const filename = (item.nombre_archivo || '').toLowerCase();
            const fase = (item.fase || '').toLowerCase();

            // Reconstruir category logic para búsqueda
            let docType = 'Pendiente IA';
            if (item.resultado_ia) {
                const ai = item.resultado_ia;
                docType = ai.categoria || (ai.output && ai.output.tipo_documental) || item.categoria_detectada || 'Pendiente IA';
            } else if (item.categoria_detectada) {
                docType = item.categoria_detectada;
            }
            docType = docType.toLowerCase();

            // Match Text
            const matchesText = !textQuery || filename.includes(textQuery) || docType.includes(textQuery) || fase.includes(textQuery);

            // Match Type (If document is not processed yet, its type is Pending IA, so look at filename as a fallback)
            const matchesType = !typeQuery || docType.includes(typeQuery) || filename.includes(typeQuery);

            // Match Status
            const matchesStatus = !statusQuery || fase.includes(statusQuery);

            // Match Date
            let matchesDate = true;
            if (dateQuery && item.fecha) {
                // item.fecha is likely ISO format like "2026-03-01T12:00:00Z"
                const itemDateStr = item.fecha.split('T')[0];
                matchesDate = itemDateStr === dateQuery;
            }

            return matchesText && matchesType && matchesStatus && matchesDate;
        });

        this.renderDocsArray(filteredDocs);
    }

    renderDocsArray(docs) {
        const tbody = document.getElementById('docs-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Update count badge
        const countBadge = document.getElementById('docs-count-badge');
        if (countBadge) countBadge.textContent = docs.length;

        if (docs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="docs-table-empty"><div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📭</div><h3>Sin resultados</h3><p>No hay documentos que coincidan con la búsqueda.</p></div></td></tr>`;
            return;
        }

        docs.forEach((item, index) => {
            const filename = item.nombre_archivo || `Documento_Desconocido`;

            // --- Category ---
            let docType = 'Pendiente IA';
            if (item.resultado_ia) {
                const ai = item.resultado_ia;
                docType = ai.categoria || (ai.output && ai.output.tipo_documental) || item.categoria_detectada || 'Pendiente IA';
            } else if (item.categoria_detectada) {
                docType = item.categoria_detectada;
            }

            // --- Status logic ---
            const faseUpper = (item.fase || '').toUpperCase();

            let hasExtractedData = false;
            let aiResultCheck = item.resultado_ia || item.entidades;
            if (typeof aiResultCheck === 'string') {
                try { aiResultCheck = JSON.parse(aiResultCheck); } catch (e) { }
            }
            if (aiResultCheck && typeof aiResultCheck === 'object' && Object.keys(aiResultCheck).length > 0) {
                hasExtractedData = true;
            }

            let statusLabel = item.fase || 'Iniciado';
            let statusClass = 'status-chip--processing';
            let actionLabel = 'Procesando...';
            let actionClass = 'btn-table-action--secondary';
            let actionDisabled = true;

            if (hasExtractedData || faseUpper.includes('REVISIÓN') || faseUpper.includes('MANUAL') || faseUpper.includes('PENDIENTE') || faseUpper.includes('EXTRAÍD') || faseUpper.includes('COMPLETADA') || faseUpper.includes('IA COMPLETADA')) {
                if (faseUpper.includes('RADICADO') || faseUpper.includes('INICIADO')) {
                    statusLabel = 'Datos Listos';
                    statusClass = 'status-chip--pending';
                } else {
                    statusClass = 'status-chip--ready';
                }
                actionLabel = 'Validar';
                actionClass = 'btn-table-action--primary';
                actionDisabled = false;
            } else if (faseUpper.includes('ROBOT') || faseUpper.includes('VALIDADO') || faseUpper.includes('COMPLETADO') || faseUpper.includes('FINALIZADO')) {
                statusClass = 'status-chip--done';
                actionLabel = 'Ver';
                actionClass = 'btn-table-action--secondary';
                actionDisabled = false;
            } else if (faseUpper.includes('ERROR') || faseUpper.includes('FALLO')) {
                statusLabel = 'Error';
                statusClass = 'status-chip--error';
                actionLabel = 'Ver Error';
                actionClass = 'btn-table-action--error';
                actionDisabled = false;
            }

            // --- Confidence ---
            let generalScore = null;
            if (item.confianza_general != null) {
                generalScore = parseFloat(item.confianza_general);
            } else if (item.resultado_ia) {
                const ai = item.resultado_ia;
                if (ai.confianza_general) {
                    generalScore = parseFloat(ai.confianza_general);
                } else if (ai.output && ai.output.confianza_general) {
                    generalScore = parseFloat(ai.output.confianza_general);
                } else if (ai.output && typeof ai.output === 'object') {
                    const fields = Object.values(ai.output);
                    const confs = fields.filter(v => typeof v === 'object' && v !== null && v.confianza).map(v => parseFloat(v.confianza));
                    if (confs.length > 0) generalScore = Math.round(confs.reduce((a, b) => a + b, 0) / confs.length);
                }
            }

            let confBarColor = '#e2e8f0';
            let confValueHTML = '<span class="confidence-value" style="color: var(--text-light);">-</span>';
            let confWidth = '0%';
            if (generalScore !== null && !isNaN(generalScore)) {
                confBarColor = generalScore >= 90 ? 'var(--success-color)' : (generalScore > 70 ? '#f59e0b' : 'var(--error-color)');
                confValueHTML = `<span class="confidence-value" style="color: ${confBarColor};">${generalScore}%</span>`;
                confWidth = `${generalScore}%`;
            }

            // --- Date ---
            let dateStr = '-';
            if (item.fecha) {
                const d = new Date(item.fecha);
                dateStr = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
            }

            // --- File icon ---
            let fileIcon = '📄';
            if (filename.toLowerCase().endsWith('.pdf')) fileIcon = '📕';
            else if (/\.(png|jpg|jpeg|webp)$/i.test(filename)) fileIcon = '🖼️';

            // --- Truncated filename ---
            const displayName = filename.length > 28 ? filename.substring(0, 25) + '...' : filename;

            const tr = document.createElement('tr');
            const dataIdx = this.processedDocs.indexOf(item);
            tr.innerHTML = `
                <td>
                    <div class="file-name-cell">
                        <div class="file-icon">${fileIcon}</div>
                        <span class="file-name" title="${filename}">${displayName}</span>
                    </div>
                </td>
                <td><span class="category-chip" title="${docType}">${docType}</span></td>
                <td><span class="status-chip ${statusClass}"><span class="status-dot"></span>${statusLabel}</span></td>
                <td><span class="date-cell">${dateStr}</span></td>
                <td>
                    <div class="confidence-cell">
                        <div class="confidence-bar-mini"><div class="confidence-bar-fill" style="width:${confWidth}; background:${confBarColor};"></div></div>
                        ${confValueHTML}
                    </div>
                </td>
                <td>
                    <button class="btn-table-action ${actionClass} ${!actionDisabled ? 'open-detail-btn' : ''}" 
                            ${actionDisabled ? 'disabled' : ''} 
                            ${!actionDisabled ? `data-index="${dataIdx}"` : ''}>
                        ${actionLabel}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Attach listeners to action buttons
        document.querySelectorAll('.open-detail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.closest('.open-detail-btn').getAttribute('data-index'));
                const selectedItem = this.processedDocs[idx];
                if (selectedItem) {
                    this.openDocumentDetailsFromDB(selectedItem);
                }
            });
        });
    }



    // --- NUEVO VISOR DESDE SUPABASE ---
    openDocumentDetailsFromDB(dbItem) {
        document.getElementById('dashboard-list-view').classList.add('hidden');
        document.getElementById('dashboard-detail-view').classList.remove('hidden');

        // Render Header
        const titleEl = document.getElementById('detail-doc-title');
        const typeEl = document.getElementById('detail-doc-type');
        const badgeEl = document.getElementById('doc-type-badge');

        if (titleEl) titleEl.innerText = dbItem.nombre_archivo || `DOC-${dbItem.id_caso}`;
        if (typeEl) typeEl.innerText = dbItem.categoria_detectada || 'Documento Analizado';
        if (badgeEl) badgeEl.innerText = dbItem.categoria_detectada || 'Pendiente IA';

        // Animated Confidence
        const confidenceBar = document.querySelector('.progress-fill');
        let generalScore = 0;

        if (dbItem.resultado_ia && dbItem.resultado_ia.confianza_general) {
            generalScore = dbItem.resultado_ia.confianza_general;
        }

        if (confidenceBar) {
            confidenceBar.style.width = '0%';
            setTimeout(() => confidenceBar.style.width = `${generalScore}%`, 100);
        }

        const scoreText = document.querySelector('.score-text');
        if (scoreText) scoreText.innerText = `${generalScore}% Nivel de Confianza`;

        const container = document.getElementById('extraction-results');
        if (!container) return;

        container.innerHTML = ''; // Limpiar campos previos

        // Guardar referencia del Item Activo para el botón Guardar
        this.activeDocumentId = dbItem.id_caso;

        // Parsear Resultados de Supabase
        let aiResult = dbItem.resultado_ia;
        if (typeof aiResult === 'string') {
            try { aiResult = JSON.parse(aiResult); } catch (e) { }
        }

        let pendingValidations = 0;
        let entities = {};
        let displayableKeys = [];

        if (aiResult && typeof aiResult === 'object') {
            // Extraer las llaves del JSON (Pueden venir dentro de un sub-nodo 'entidades' según el prompt)
            entities = aiResult.output || aiResult.entidades || aiResult;

            // Filtramos meta-campos internos
            displayableKeys = Object.keys(entities).filter(k =>
                k !== 'confianza_general' && k !== 'resumen' && k !== 'categoria' && k !== '_id'
            );
        }

        // --- MANEJO DE CAÍDAS (FALLBACKS) ---
        // Si no detectó llaves estructuradas, pero sabemos la categoría del documento, creamos los inputs vacíos según el Esquema Maestro
        if (displayableKeys.length === 0 && dbItem.categoria_detectada && typeof dynamicDocumentTypes !== 'undefined') {
            const mappedType = dynamicDocumentTypes.find(d =>
                d.id === dbItem.categoria_detectada || d.name === dbItem.categoria_detectada || d.id === dbItem.categoria_detectada.replace(/\s+/g, '_')
            );

            if (mappedType && mappedType.esquema_metadatos) {
                displayableKeys = Object.keys(mappedType.esquema_metadatos).filter(k => k !== 'estado');
                displayableKeys.forEach(k => { entities[k] = ''; }); // Inicializar vacíos
            }
        }

        if (displayableKeys.length > 0) {
            displayableKeys.forEach((key) => {
                const valueObj = entities[key];

                // Gemini a veces devuelve { "valor": "Juan", "confianza": 90 } o de frente "Juan"
                let finalValue = valueObj;
                let fieldConfidence = 100; // Por defecto confiamos si no da per-field

                if (typeof valueObj === 'object' && valueObj !== null) {
                    finalValue = valueObj.valor || valueObj.value || JSON.stringify(valueObj);
                    fieldConfidence = valueObj.confianza || valueObj.confidence || fieldConfidence;
                }

                if (!finalValue || finalValue === 'null') finalValue = '';

                // Determinar si requiere revisión por baja confianza (menor a 85%) o si el documento total está PENDIENTE
                const faseCheck = (dbItem.fase || '').toUpperCase();
                const isPerfect = fieldConfidence >= 85 && !faseCheck.includes('PENDIENTE') && !faseCheck.includes('MANUAL');
                const confColor = isPerfect ? 'var(--success-color)' : 'var(--warning-color)';
                const confTitle = isPerfect ? `Confianza Alta (${fieldConfidence}%)` : `Requiere Revisión (${fieldConfidence}%)`;

                if (!isPerfect) pendingValidations++;

                const div = document.createElement('div');
                div.className = 'validator-form-group';
                div.innerHTML = `
                    <label class="validator-label" style="text-transform: capitalize;">${key.replace(/_/g, ' ')}:</label>
                    <div class="validator-input-wrapper">
                        <input type="text" class="validator-input" data-key="${key}" value="${finalValue.replace(/"/g, '&quot;')}" />
                        <div class="validator-success-dot" style="background-color: ${confColor};" title="${confTitle}"></div>
                    </div>
                `;

                // Add interaction logic to the input to auto-mark as validated on edit
                const input = div.querySelector('.validator-input');
                const dot = div.querySelector('.validator-success-dot');

                input.addEventListener('input', () => {
                    dot.style.backgroundColor = 'var(--accent-color)';
                    dot.title = 'Editado Manualmente';
                });

                container.appendChild(div);
            });

        } else {
            container.innerHTML = `<div class="empty-state">⚠️ El documento aún no tiene metadatos extraídos y no hay esquema asignado en DB.</div>`;
        }

        // Setup Right Actions (Save / Discard)
        const saveBtn = document.getElementById('save-validation-btn');
        const discardBtn = document.getElementById('discard-validation-btn');
        const backBtn = document.getElementById('back-to-list-btn');

        const closeDetailView = () => {
            document.getElementById('dashboard-list-view').classList.remove('hidden');
            document.getElementById('dashboard-detail-view').classList.add('hidden');
        };

        if (discardBtn) discardBtn.onclick = closeDetailView;
        if (backBtn) backBtn.onclick = closeDetailView;

        if (saveBtn) {
            saveBtn.onclick = () => this.saveDocumentValidation(dbItem);
        }

        // PREVIEW Left: Buscamos si el archivo está en la sesión actual
        const previewContainer = document.getElementById('doc-preview-container');
        const pdfControls = document.getElementById('pdf-controls');

        previewContainer.innerHTML = '';

        let fileUrl = null;

        // 1. Intentar buscar el archivo original en la cola de subida de la sesión actual
        if (this.uploadQueue && this.uploadQueue.length > 0) {
            const queueItem = this.uploadQueue.find(q => q.file.name === dbItem.nombre_archivo);
            if (queueItem && queueItem.file.type === 'application/pdf') {
                fileUrl = URL.createObjectURL(queueItem.file);
            }
        }

        // 2. Fallback a URL de base de datos si existiera algún día
        if (!fileUrl && dbItem.ruta_archivo) {
            fileUrl = dbItem.ruta_archivo;
        }

        if (fileUrl) {
            if (pdfControls) pdfControls.style.display = 'flex';

            // Re-inyectar canvas
            previewContainer.appendChild(this.pdfCanvas);

            // Cargar con PDF.js
            try {
                const loadingTask = pdfjsLib.getDocument(fileUrl);
                loadingTask.promise.then(doc => {
                    this.pdfDoc = doc;
                    this.pageNum = 1;
                    this.renderPdfPage(this.pageNum);
                }).catch(err => {
                    console.error("Error cargando PDF:", err);
                    previewContainer.innerHTML = `<div style="text-align:center; padding: 2rem; margin-top:2rem;">
                        <h4 style="color:var(--error-color);">Error mostrando PDF</h4>
                        <p>${err.message}</p>
                    </div>`;
                });
            } catch (err) {
                previewContainer.innerHTML = `<div style="text-align:center; padding: 2rem; margin-top:2rem;">
                        <h4 style="color:var(--error-color);">Error Inicializando Lector</h4>
                    </div>`;
            }
        } else {
            // Fallback genérico si no hay archivo en sesión ni en BD, permítiéndoles cargarlo localmente
            if (pdfControls) pdfControls.style.display = 'none';
            previewContainer.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding: 3rem 1.5rem; margin-top: 2rem; border: 2px dashed var(--border-color); border-radius:12px; background:var(--bg-light);">
                <div style="font-size: 3.5rem; margin-bottom: 1rem; color:var(--text-light);">📄</div>
                <h4 style="margin-bottom:0.5rem; color:var(--text-color); font-size:1.2rem;">${dbItem.nombre_archivo || 'Documento no cargado'}</h4>
                <p style="color:var(--text-light); margin-bottom: 1.5rem; font-size:0.9rem;">El archivo ya no reside en tu memoria temporal. Cárgalo de tu PC para validar visualmente los datos extraídos.</p>
                <button class="btn btn-primary" onclick="document.getElementById('local-pdf-loader').click()" style="padding: 0.6rem 1.2rem; font-size: 0.95rem; display:flex; gap:0.5rem; align-items:center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Cargar PDF Local
                </button>
                <input type="file" id="local-pdf-loader" accept=".pdf" style="display:none;" />
            </div>`;

            // Vincular evento al input recién creado
            const localInput = document.getElementById('local-pdf-loader');
            if (localInput) {
                localInput.addEventListener('change', (e) => {
                    const localFile = e.target.files[0];
                    if (localFile && localFile.type === 'application/pdf') {
                        const newFileUrl = URL.createObjectURL(localFile);
                        if (pdfControls) pdfControls.style.display = 'flex';
                        previewContainer.innerHTML = '';
                        previewContainer.appendChild(this.pdfCanvas);

                        const loadingTask = pdfjsLib.getDocument(newFileUrl);
                        loadingTask.promise.then(doc => {
                            this.pdfDoc = doc;
                            this.pageNum = 1;
                            this.renderPdfPage(this.pageNum);
                        }).catch(err => {
                            console.error("PDF Local Falló:", err);
                        });
                    }
                });
            }
        }
    }

    async saveDocumentValidation(dbItem) {
        if (!supabaseClient) {
            alert("No hay conexión con la base de datos.");
            return;
        }

        const container = document.getElementById('extraction-results');
        const inputs = container.querySelectorAll('.validator-input');

        const updatedEntities = {};
        inputs.forEach(input => {
            const key = input.getAttribute('data-key');
            updatedEntities[key] = input.value;
        });

        // Original AI Result merging with updated fields
        const newAiResult = { ...dbItem.resultado_ia };

        // Si el objeto entidades existe, actualizamos adentro
        if (newAiResult.entidades) {
            newAiResult.entidades = { ...newAiResult.entidades, ...updatedEntities };
        } else {
            // Si las llaves están en la raiz, actualizamos la raiz pero mantenemos _id, etc
            Object.assign(newAiResult, updatedEntities);
        }

        const saveBtn = document.getElementById('save-validation-btn');
        saveBtn.innerText = "Guardando...";
        saveBtn.disabled = true;

        try {
            const { error } = await supabaseClient
                .from('trazabilidad_procesos')
                .update({
                    resultado_ia: newAiResult,
                    fase: 'COMPLETADO_VALIDADO', // Cambiar el estado para reflejar validación manual
                    estado: 'COMPLETADO'
                })
                .eq('id_caso', dbItem.id_caso);

            if (error) throw error;

            // Volver al listado y recargar
            document.getElementById('dashboard-list-view').classList.remove('hidden');
            document.getElementById('dashboard-detail-view').classList.add('hidden');
            this.renderDashboardList();

        } catch (err) {
            console.error("Error al guardar validación:", err);
            alert("Error al guardar: " + err.message);
        } finally {
            saveBtn.innerText = "Guardar y Continuar";
            saveBtn.disabled = false;
        }
    }

    // --- PDF.js Helpers ---
    renderPdfPage(num) {
        this.pageRendering = true;
        this.pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: this.scale });
            this.pdfCanvas.height = viewport.height;
            this.pdfCanvas.width = viewport.width;

            const renderContext = {
                canvasContext: this.pdfCtx,
                viewport: viewport
            };
            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
                this.pageRendering = false;
                if (this.pageNumPending !== null) {
                    this.renderPdfPage(this.pageNumPending);
                    this.pageNumPending = null;
                }
            });
        });

        document.getElementById('pdf-page-num').textContent = `${num} / ${this.pdfDoc.numPages}`;
    }

    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPdfPage(num);
        }
    }

    onPdfPrevPage() {
        if (this.pageNum <= 1) return;
        this.pageNum--;
        this.queueRenderPage(this.pageNum);
    }

    onPdfNextPage() {
        if (this.pageNum >= this.pdfDoc.numPages) return;
        this.pageNum++;
        this.queueRenderPage(this.pageNum);
    }

    onPdfZoomIn() {
        this.scale += 0.2;
        this.queueRenderPage(this.pageNum);
    }

    onPdfZoomOut() {
        if (this.scale <= 0.6) return;
        this.scale -= 0.2;
        this.queueRenderPage(this.pageNum);
    }

    async renderAdminRules() {
        const tbody = document.getElementById('doctypes-table-body');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #888;">Cargando configuraciones desde Supabase...</td></tr>';

        // Intentar obtener de Supabase
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('configuracion_documentos')
                    .select('*')
                    .eq('activo', true);

                if (error) throw error;

                // Mapear el formato de DB al formato de la UI localmente para otras funciones
                dynamicDocumentTypes = data.map(doc => ({
                    id: doc.tipo_documento,
                    name: doc.tipo_documento.replace(/_/g, ' '),
                    description: doc.descripcion || "Sin descripción",
                    prompt_sistema: doc.prompt_sistema,
                    esquema_metadatos: doc.esquema_metadatos
                }));
            } catch (err) {
                console.error("Error cargando configuraciones:", err);
                dynamicDocumentTypes = [
                    { id: 'ERROR', name: 'Error de Conexión', description: 'No se pudieron cargar las configuraciones de la BD' }
                ];
            }
        }

        // Renderizar Filas de Tabla
        tbody.innerHTML = '';
        if (dynamicDocumentTypes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: #666; font-style: italic;">No hay tipos documentales configurados.</td></tr>';
            return;
        }

        dynamicDocumentTypes.forEach(doc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span style="font-family:monospace; background:#eee; padding:2px 4px; border-radius:4px;">${doc.id}</span></td>
                <td><strong>${doc.name}</strong></td>
                <td>${doc.description}</td>
                <td>
                    <div style="display:flex; gap:0.5rem; justify-content: flex-end;">
                        <button class="btn btn-secondary config-btn" data-id="${doc.id}" style="padding:0.25rem 0.5rem; font-size:0.8rem;" title="Configurar Prompt y Esquema">⚙️</button>
                        <button class="btn btn-secondary delete-btn" data-id="${doc.id}" style="padding:0.25rem 0.5rem; font-size:0.8rem; color:#dc3545; border-color:#dc3545;" title="Eliminar">🗑️</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Re-attach listeners for dynamic buttons
        document.querySelectorAll('.config-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const docId = e.target.closest('.config-btn').getAttribute('data-id');
                this.openConfigModal(docId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const docId = e.target.closest('.delete-btn').getAttribute('data-id');
                this.confirmDeleteDocType(docId);
            });
        });
    }

    // --- Admin Features ---

    openAddDocTypeModal() {
        document.getElementById('new-doc-id').value = '';
        document.getElementById('new-doc-name').value = '';
        document.getElementById('new-doc-desc').value = '';
        document.getElementById('add-doctype-modal').classList.remove('hidden');
    }

    confirmAddDocType() {
        const id = document.getElementById('new-doc-id').value;
        const name = document.getElementById('new-doc-name').value;
        const desc = document.getElementById('new-doc-desc').value;

        if (!id || !name) {
            alert('Por favor completa los campos requeridos.');
            return;
        }

        mockStore.documentTypes.push({ id, name, description: desc });
        this.renderAdminTable();
        document.getElementById('add-doctype-modal').classList.add('hidden');
    }

    async storeDocument() {
        const btn = document.getElementById('store-doc-btn');
        if (!btn) return;
        const originalText = btn.innerHTML;

        btn.innerHTML = `<div class="spinner" style="width:16px; height:16px; border-width:2px; display:inline-block; vertical-align:middle; margin-right:5px;"></div> Guardando...`;
        btn.disabled = true;

        // Recolectar datos editados/validados por el humano
        const finalExtractedData = {};
        document.querySelectorAll('.editable-field').forEach(field => {
            const label = field.getAttribute('data-key');
            finalExtractedData[label] = field.innerText.trim();
        });

        const activeId = this.activeDocumentId;

        if (!activeId) {
            alert("Error: No se encontró el ID del documento activo.");
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        try {
            // INTEGRACIÓN REAL: Actualizar Supabase (Nuevo Esquema: Log de Fases)
            const docName = document.getElementById('detail-doc-title').innerText;

            const { error } = await supabaseClient
                .from('trazabilidad_procesos')
                .insert({
                    id_caso: activeId,
                    fase: 'VALIDADO_HUMANO',
                    nombre_archivo: docName,
                    resultado_ia: finalExtractedData // Guardamos la versión final corregida
                });

            if (error) throw error;

            console.log("🚀 Documento Validado y Actualizado en BD:", activeId);
            console.log(JSON.stringify(finalExtractedData, null, 2));

            btn.innerHTML = `✅ Almacenado Exitosamente`;
            btn.style.backgroundColor = 'var(--success-color)';
            btn.style.borderColor = 'var(--success-color)';

            // Show Custom Success Modal
            const successModal = document.getElementById('success-modal');
            const closeBtn = document.getElementById('success-close-btn');

            if (successModal) {
                successModal.classList.remove('hidden');

                // Handle Close & Redirect
                const closeAction = () => {
                    successModal.classList.add('hidden');
                    this.switchView('dashboard-view'); // Return to Inbox
                    this.renderDashboardList();        // Recargar desde BD

                    // Resetear el botón original en background
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.backgroundColor = '';
                        btn.style.borderColor = '';
                        btn.disabled = false;
                    }, 500);
                };

                closeBtn.onclick = closeAction;
            } else {
                alert('Documento Validado y Almacenado en BD Exitosamente.');
                this.switchView('dashboard-view');
                this.renderDashboardList();
            }

        } catch (error) {
            console.error("Error guardando en Supabase:", error);
            alert("No se pudo guardar la validación: " + error.message);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    // --- ADMIN METHODS ---
    openAddDocTypeModal() {
        document.getElementById('add-doctype-modal').classList.remove('hidden');
    }

    showErrorModal(title, detailMessage) {
        document.getElementById('error-modal-title').innerText = title || "Hubo un problema";
        document.getElementById('error-modal-detail').innerText = detailMessage || "Error desconocido.";
        document.getElementById('error-modal').classList.remove('hidden');
    }

    async confirmAddDocType() {
        const idInput = document.getElementById('new-doctype-id').value.trim();
        const descInput = document.getElementById('new-doctype-desc').value.trim();

        if (!idInput) {
            this.showErrorModal("Datos Incompletos", "El ID/Nombre del documento es obligatorio para poder registrarlo.");
            return;
        }

        const btn = document.getElementById('confirm-add-doctype-btn');
        const originalText = btn.innerText;
        btn.innerText = "Guardando...";
        btn.disabled = true;

        try {
            if (!supabaseClient) throw new Error("Cliente de Base de Datos no conectado. Revisa tu VPN o conexión local.");

            // Insertar en Supabase
            const { error } = await supabaseClient
                .from('configuracion_documentos')
                .insert([{
                    tipo_documento: idInput.replace(/\s+/g, '_'), // Normalizar ID
                    descripcion: descInput,
                    prompt_sistema: "Pendiente de configuración por IA", // Placeholder
                    esquema_metadatos: { "estado": { "type": "string" } } // Placeholder
                }]);

            if (error) throw error;

            alert("Tipo Documental creado en la Base de Datos exitosamente.");

            // Cerrar modal y limpiar
            document.getElementById('add-doctype-modal').classList.add('hidden');
            document.getElementById('new-doctype-id').value = '';
            document.getElementById('new-doctype-desc').value = '';

            // Recargar UI
            await this.renderAdminRules();

        } catch (err) {
            console.error("Error guardando nueva regla:", err);

            // Reemplazamos el viejo Alert por el nuevo Error Modal
            this.showErrorModal(
                "Error de Base de Datos",
                err.message || JSON.stringify(err)
            );
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }


    promptNewDocType() {
        // Simple mock interaction for creating a new type
        const name = prompt("Nombre del nuevo Tipo Documental:");
        if (name) {
            const id = `DT-00${mockStore.documentTypes.length + 1}`;
            const desc = prompt("Descripción corta:");

            mockStore.documentTypes.push({
                id: id,
                name: name,
                description: desc || "Sin descripción",
                active: true
            });

            this.renderAdminTable();
            // Automatically open config
            setTimeout(() => this.openConfigModal(id), 500);
        }
    }

    openConfigModal(docId) {
        const docType = dynamicDocumentTypes.find(d => d.id === docId);
        if (!docType) return;

        this.activeConfigId = docId;

        const modal = document.getElementById('config-modal');
        document.getElementById('modal-title').innerText = `Configurar: ${docType.name}`;

        const promptInput = document.getElementById('config-system-prompt');
        const schemaInput = document.getElementById('config-metadata-schema');

        promptInput.value = docType.prompt_sistema || '';
        schemaInput.value = docType.esquema_metadatos ? JSON.stringify(docType.esquema_metadatos, null, 2) : '';

        modal.classList.remove('hidden');

        const closeBtn = document.getElementById('close-modal-btn');
        const cancelBtn = document.getElementById('cancel-modal-btn');
        const saveBtn = document.getElementById('save-modal-btn');

        const closeModal = () => modal.classList.add('hidden');

        closeBtn.onclick = closeModal;
        cancelBtn.onclick = closeModal;
        saveBtn.onclick = async () => {
            const newPrompt = promptInput.value;
            let newSchema;

            try {
                newSchema = JSON.parse(schemaInput.value);
            } catch (e) {
                alert("Error: El esquema de metadatos debe ser un JSON válido.");
                return;
            }

            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = "💾 Guardando...";
            saveBtn.disabled = true;

            try {
                const { error } = await supabaseClient
                    .from('configuracion_documentos')
                    .update({
                        prompt_sistema: newPrompt,
                        esquema_metadatos: newSchema,
                        updated_at: new Date()
                    })
                    .eq('tipo_documento', docId);

                if (error) throw error;

                alert("Configuración actualizada correctamente.");
                await this.renderAdminRules();
                closeModal();
            } catch (err) {
                console.error("Error al guardar configuración:", err);
                alert("Error al guardar: " + err.message);
            } finally {
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            }
        };
    }

    async confirmDeleteDocType(docId) {
        const docType = dynamicDocumentTypes.find(d => d.id === docId);
        if (!docType) return;

        if (confirm(`¿Estás seguro de que deseas eliminar el tipo documental "${docType.name}"? Esta acción lo desactivará del sistema.`)) {
            try {
                if (!supabaseClient) throw new Error("Cliente de Base de Datos no conectado.");

                const { error } = await supabaseClient
                    .from('configuracion_documentos')
                    .update({ activo: false, updated_at: new Date() })
                    .eq('tipo_documento', docId);

                if (error) throw error;

                alert("Tipo Documental eliminado exitosamente.");
                await this.renderAdminRules(); // Refrescar tabla
            } catch (err) {
                console.error("Error al eliminar:", err);
                this.showErrorModal("Error al eliminar", err.message);
            }
        }
    }

    wait(ms) { return new Promise(r => setTimeout(r, ms)); }
}

// Robust Initialization
const initApp = () => {
    console.log("🚀 DocuInsight App Initialized!");
    if (!window.app) {
        window.app = new App();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

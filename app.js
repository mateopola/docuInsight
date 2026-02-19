/**
 * DocuInsight - Main Application Logic
 * Mock-Driven Architecture for Document Understanding
 */

// --- MOCK DATA STORE ---
const mockStore = {
    // 3. Tipologías Documentales Configuradas (From implements.md)
    documentTypes: [
        { id: 'DT-001', name: 'Identificación Tributaria', description: 'Documentos relacionados con obligaciones y registros fiscales.', active: true },
        { id: 'DT-002', name: 'Existencia y Rep. Legal', description: 'Documentos corporativos y registrales.', active: true },
        { id: 'DT-003', name: 'Identificación Personal', description: 'Documentos de identidad de personas naturales.', active: true }
    ],

    // 3.1 - 3.3 Full Fields
    subSeries: [
        {
            id: 'SS-001', typeId: 'DT-001', name: 'Registro Único Tributario - RUT',
            fields: ['NIT', 'Razón Social', 'Nombre Comercial', 'Actividad Económica', 'Dirección', 'Municipio', 'Departamento', 'Responsabilidades', 'Fecha Generación']
        },
        {
            id: 'SS-002', typeId: 'DT-002', name: 'Certificado Cámara de Comercio',
            fields: ['Razón Social', 'Matrícula', 'Fecha Constitución', 'Estado', 'Rep. Legal', 'Objeto Social', 'Dirección', 'Ciudad']
        },
        {
            id: 'SS-003', typeId: 'DT-003', name: 'Cédula de Ciudadanía',
            fields: ['Número Documento', 'Nombres', 'Apellidos', 'Fecha Nacimiento', 'Lugar Nacimiento', 'Fecha Expedición', 'Lugar Expedición', 'Sexo']
        }
    ],

    // Mock Extractions based on filename patterns
    mockExtractions: {
        'rut': {
            subSeriesId: 'SS-001',
            confidence: 98,
            data: {
                'NIT': '900689899-6',
                'Razón Social': 'DISTRISEGURIDAD, SERVICIOS Y ACCESORIOS S.A.S.',
                'Nombre Comercial': 'DISERVA S.A.S.',
                'Actividad Económica': '4690 - Comercio al por mayor no especializado',
                'Dirección': 'CR 51 9 A SUR 01',
                'Municipio': 'Medellín',
                'Departamento': 'Antioquia',
                'Responsabilidades': '05, 07, 09, 11, 10, 14, 42',
                'Fecha Generación': '04-03-2019',
                'Representante': 'ZAPATA ALZATE JULLIETH PAOLA'
            }
        },
        'camara': {
            subSeriesId: 'SS-002',
            confidence: 95,
            data: {
                'Razón Social': 'SOSTENIBILIDAD LEGAL SAS',
                'Matrícula': '02529040',
                'Fecha Constitución': '24 DE DICIEMBRE DE 2014',
                'Rep. Legal': 'AMAYA VILLAREAL ALVARO FRANCISCO',
                'Objeto Social': 'Prestación de servicios legales, asesoría y consultoría...',
                'Dirección': 'CR 13 NO. 101 38 AP 202',
                'Ciudad': 'BOGOTA D.C.'
            }
        },
        'cedula': {
            subSeriesId: 'SS-003',
            confidence: 99,
            data: {
                'Número Documento': '1.020.818.311',
                'Nombres': 'MATEO',
                'Apellidos': 'POLANCO RODRIGUEZ',
                'Fecha Nacimiento': '22-AGO-1996',
                'Lugar Nacimiento': 'BOGOTA D.C (CUNDINAMARCA)',
                'Fecha Expedición': '29-AGO-2014',
                'Lugar Expedición': 'BOGOTA D.C.',
                'Sexo': 'M'
            }
        }
    }
};

// --- MOCK COGNITIVE ENGINE ---
class MockEngine {
    constructor() {
        this.baseDelay = 1500;
    }

    async processDocument(file) {
        return new Promise((resolve) => {
            console.log(`Processing file: ${file.name}`);

            // Determine result based on partial filename match
            const lowerName = file.name.toLowerCase();
            let key = null;
            if (lowerName.includes('rut')) key = 'rut';
            else if (lowerName.includes('camara') || lowerName.includes('cert') || lowerName.includes('existencia')) key = 'camara';
            else if (lowerName.includes('cedula') || lowerName.includes('id')) key = 'cedula';

            const extractionProfile = key ? mockStore.mockExtractions[key] : null;

            setTimeout(() => {
                if (extractionProfile) {
                    // Enrich result with metadata
                    const subSeries = mockStore.subSeries.find(s => s.id === extractionProfile.subSeriesId);
                    resolve({
                        found: true,
                        type: subSeries.name,
                        confidence: extractionProfile.confidence,
                        data: extractionProfile.data
                    });
                } else {
                    resolve({
                        found: false,
                        type: 'Desconocido / No Estructurado',
                        confidence: 15,
                        data: {
                            'Texto Crudo': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
                            'Error': 'No se encontró una plantilla coincidente.'
                        }
                    });
                }
            }, this.baseDelay);
        });
    }
}

// --- UI CONTROLLER ---
class App {
    constructor() {
        this.engine = new MockEngine();
        this.currentView = 'metrics-view'; // Default to Dashboard

        this.initEventListeners();
        this.initSidebarToggle();
        this.renderAdminTable();

        // Ensure UI matches state
        this.switchView(this.currentView);
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

    initEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // If clicking an icon inside the button, get the button
                const target = e.target.closest('.nav-item');
                if (target) {
                    const viewId = target.getAttribute('data-view');
                    this.switchView(viewId);
                }
            });
        });

        // File Upload
        document.getElementById('select-file-btn').addEventListener('click', () => document.getElementById('file-input').click());
        document.getElementById('file-input').addEventListener('change', (e) => {
            if (e.target.files.length > 0) this.handleFileUpload(e.target.files[0]);
        });

        // Admin: Add Type - Logic updated to use Modal
        document.getElementById('add-doctype-btn').addEventListener('click', () => this.openAddDocTypeModal());

        // Admin: Confirm Add Type
        document.getElementById('confirm-add-doctype-btn').addEventListener('click', () => this.confirmAddDocType());

        // Admin: Close Add Modal
        const closeAddModal = () => document.getElementById('add-doctype-modal').classList.add('hidden');
        document.getElementById('close-add-modal-btn').addEventListener('click', closeAddModal);
        document.getElementById('cancel-add-modal-btn').addEventListener('click', closeAddModal);

        // Admin: Training Actions
        document.getElementById('start-training-btn').addEventListener('click', () => this.startTrainingSimulation());
        document.getElementById('cancel-training-btn').addEventListener('click', () => this.closeTrainingPanel());

        // New Action Buttons
        document.getElementById('process-upload-btn').addEventListener('click', () => this.processCurrentFile());
        document.getElementById('cancel-upload-btn').addEventListener('click', () => this.resetUploadState());

        // Drag & Drop
        const dropZone = document.getElementById('drop-zone');
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) this.handleFileUpload(e.dataTransfer.files[0]);
        });
    }

    switchView(viewId) {
        // Nav State
        document.querySelectorAll('.nav-item').forEach(btn => {
            if (btn.getAttribute('data-view') === viewId) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        // View Visibility
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.toggle('active', section.id === viewId);
            section.classList.toggle('hidden', section.id !== viewId);
        });

        // Title
        const titleMap = {
            'metrics-view': 'Tablero de Control',
            'upload-view': 'Intake de Documentos',
            'dashboard-view': 'Resultados del Análisis Visual',
            'admin-view': 'Gobierno de Tipologías'
        };
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.innerText = titleMap[viewId];

        // Specific View logic
        if (viewId === 'metrics-view') this.renderMetrics();
    }

    renderMetrics() {
        // Randomize KPI slightly for liveness
        const totalDocs = 1248 + Math.floor(Math.random() * 5);
        this.animateValue("kpi-total-docs", 0, totalDocs, 1500);

        // Animate Accuracy
        this.animateValue("kpi-accuracy", 0, 96, 1500, "%");

        // Randomize Token Count
        // No ID assigned in HTML for tokens yet, but logic is simplified
    }

    animateValue(id, start, end, duration, suffix = '') {
        const obj = document.getElementById(id);
        if (!obj) return;

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Ease out quart
            const easeProgress = 1 - Math.pow(1 - progress, 4);

            const current = Math.floor(progress * (end - start) + start);
            obj.innerText = current.toLocaleString() + suffix;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                if (suffix === '%') obj.innerText = end + '.5' + suffix; // Hardcoded decimal for accuracy
            }
        };
        window.requestAnimationFrame(step);
    }

    // Step 1: User selects file -> Show Preview
    async handleFileUpload(file) {
        this.pendingFile = file; // Store for valid processing

        // Hide Drop Zone
        document.getElementById('drop-zone').classList.add('hidden');

        // Show Preview State
        const previewState = document.getElementById('upload-preview-state');
        previewState.classList.remove('hidden');

        // Render Preview
        this.renderIntakePreview(file);
    }

    renderIntakePreview(file) {
        const container = document.getElementById('intake-preview-frame');
        const fileUrl = URL.createObjectURL(file);

        let content = '';
        if (file.type === 'application/pdf') {
            content = `<embed src="${fileUrl}" type="application/pdf" width="100%" height="100%" />`;
        } else if (file.type.startsWith('image/')) {
            content = `<img src="${fileUrl}" style="max-height:100%; max-width:100%; display:block; margin:auto;" />`;
        } else {
            content = `<div style="padding:2rem; text-align:center;">📄 ${file.name}</div>`;
        }
        container.innerHTML = content;
    }

    // Step 2: User clicks "Eliminar"
    resetUploadState() {
        this.pendingFile = null;
        document.getElementById('file-input').value = ''; // Reset input
        document.getElementById('upload-preview-state').classList.add('hidden');
        document.getElementById('drop-zone').classList.remove('hidden');
    }

    // Step 3: User clicks "Procesar"
    async processCurrentFile() {
        console.log('Processing file:', this.pendingFile);

        if (!this.pendingFile) {
            alert('Error: No hay archivo seleccionado para procesar.');
            return;
        }

        const file = this.pendingFile;
        const processBtn = document.getElementById('process-upload-btn');
        processBtn.disabled = true;

        const overlay = document.getElementById('processing-overlay');
        overlay.classList.remove('hidden');

        // Helper to update list items
        const updateStep = (id, status) => {
            const el = document.getElementById(id);
            if (!el) return;

            const icon = el.querySelector('.step-icon');
            if (!icon) return; // Guard clause

            // Limit to basic states for simplicity
            if (status === 'active') {
                el.className = 'step-item active';
                icon.innerText = '⏳';
            } else if (status === 'completed') {
                el.className = 'step-item completed';
                icon.innerText = '✅';
            } else {
                el.className = 'step-item pending';
                icon.innerText = '⚪';
            }
        };

        // Reset all steps first
        ['step-ingest', 'step-ocr', 'step-classify', 'step-extract'].forEach(id => updateStep(id, 'pending'));

        try {
            // Step 1: Ingest
            updateStep('step-ingest', 'active');
            await this.wait(2000);
            updateStep('step-ingest', 'completed');

            // Step 2: OCR
            updateStep('step-ocr', 'active');
            await this.wait(2000);
            updateStep('step-ocr', 'completed');

            // Step 3: Classification
            updateStep('step-classify', 'active');
            await this.wait(2000);
            updateStep('step-classify', 'completed');

            // Step 4: Extraction
            updateStep('step-extract', 'active');
            // Dynamically update text for this step
            const extractText = document.querySelector('#step-extract .step-text');
            if (extractText) extractText.innerText = `Extrayendo datos de: ${file.name}`;

            const result = await this.engine.processDocument(file);
            await this.wait(2000);
            updateStep('step-extract', 'completed');

            await this.wait(500); // Brief pause to see all checks
            overlay.classList.add('hidden');
            this.renderResults(file, result);
            this.switchView('dashboard-view');

            // Reset upload view for next time
            this.resetUploadState();
        } catch (error) {
            console.error('Processing error:', error);
            alert('Error al procesar el documento: ' + error.message);
            overlay.classList.add('hidden');
        } finally {
            processBtn.disabled = false;
        }
    }

    renderResults(file, result) {
        // Defensive DOM updates
        const badge = document.getElementById('doc-type-badge');
        if (badge) badge.innerText = result.type;

        // Animated Confidence
        const confidenceBar = document.querySelector('.progress-fill');
        if (confidenceBar) {
            confidenceBar.style.width = '0%';
            setTimeout(() => confidenceBar.style.width = `${result.confidence}%`, 100);
        }

        const scoreText = document.querySelector('.score-text');
        if (scoreText) scoreText.innerText = `${result.confidence}% Nivel de Confianza`;

        // Fields
        const container = document.getElementById('extraction-results');
        if (!container) return; // Critical bucket missing

        container.innerHTML = '';

        if (result.found) {
            Object.entries(result.data).forEach(([key, value]) => {
                const div = document.createElement('div');
                div.className = 'field-item';
                // Input for editing
                div.innerHTML = `
                    <span class="field-label">${key}</span>
                    <input type="text" class="field-value-input" value="${value}" style="width: 100%; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; color: #333; font-family: inherit;">
                `;
                container.appendChild(div);
            });

            // Add Storage Button
            const footer = document.createElement('div');
            footer.style.marginTop = '1.5rem';
            footer.style.textAlign = 'right';
            footer.innerHTML = `
                <button id="store-doc-btn" class="btn btn-primary" style="width: 100%; display: flex; justify-content: center; gap: 0.5rem;">
                    <span>💾</span> Almacenar en Gestor Documental
                </button>
            `;
            container.appendChild(footer);

            // Listener for Store Button
            document.getElementById('store-doc-btn').addEventListener('click', () => this.storeDocument());

        } else {
            container.innerHTML = `<div class="empty-state">⚠️ ${result.data.Error}</div>`;
        }

        // Preview - REAL implementation using Blob URL
        const fileUrl = URL.createObjectURL(file);
        const previewContainer = document.getElementById('doc-preview-container');

        // Determine mime type roughly
        let embedTag = '';
        if (file.type === 'application/pdf') {
            embedTag = `<embed src="${fileUrl}" type="application/pdf" width="100%" height="100%" />`;
        } else if (file.type.startsWith('image/')) {
            embedTag = `<img src="${fileUrl}" style="max-width:100%; max-height:100%; object-fit:contain;" />`;
        } else {
            // Fallback for unknown types
            embedTag = `<div style="text-align:center; padding: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📄</div>
                <h4 style="margin-bottom:0.5rem; color:var(--text-color);">${file.name}</h4>
                <p>Vista previa no disponible para este tipo de archivo.</p>
            </div>`;
        }

        previewContainer.innerHTML = embedTag;

        // Remove style class that bumps text centering, make it full-size container
        previewContainer.style.display = 'block';
        previewContainer.style.height = '100%';
        previewContainer.style.padding = '0';
        previewContainer.className = 'document-preview-container'; // Changed class name conceptually
    }

    renderAdminTable() {
        const tbody = document.getElementById('doctypes-table-body');
        tbody.innerHTML = '';
        mockStore.documentTypes.forEach(doc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span style="font-family:monospace; background:#eee; padding:2px 4px; border-radius:4px;">${doc.id}</span></td>
                <td><strong>${doc.name}</strong></td>
                <td>${doc.description}</td>
                <td>
                    <div style="display:flex; gap:0.5rem; justify-content: flex-end;">
                        <button class="btn btn-secondary config-btn" data-id="${doc.id}" style="padding:0.25rem 0.5rem; font-size:0.8rem;" title="Configurar Campos">⚙️</button>
                        <button class="btn btn-secondary train-btn" data-name="${doc.name}" style="padding:0.25rem 0.5rem; font-size:0.8rem; color:var(--primary-color); border-color:var(--primary-color);" title="Entrenar Modelo">🧠</button>
                        <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.8rem; color:#dc3545; border-color:#dc3545;" title="Eliminar">🗑️</button>
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

        document.querySelectorAll('.train-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.closest('.train-btn').getAttribute('data-name');
                this.openTrainingPanel(name);
            });
        });
    }

    // --- Admin Features ---
    openTrainingPanel(docName) {
        document.getElementById('admin-main-panel').classList.add('hidden');
        document.getElementById('admin-training-panel').classList.remove('hidden');

        const input = document.getElementById('train-model-name');
        input.value = docName || '';
        if (docName) input.focus();
    }

    closeTrainingPanel() {
        document.getElementById('admin-training-panel').classList.add('hidden');
        document.getElementById('admin-main-panel').classList.remove('hidden');
    }

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

    storeDocument() {
        const btn = document.getElementById('store-doc-btn');
        const originalText = btn.innerHTML;

        btn.innerHTML = `<div class="spinner" style="width:16px; height:16px; border-width:2px; display:inline-block;"></div> Guardando...`;
        btn.disabled = true;

        // Collect processed data
        const data = {};
        document.querySelectorAll('.field-value-input').forEach(input => {
            const label = input.previousElementSibling.innerText;
            data[label] = input.value;
        });

        // Simulate API call
        setTimeout(() => {
            btn.innerHTML = `✅ Documento Almacenado`;
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
                    this.switchView('metrics-view');
                };

                // One-time listener to avoid duplicates if called multiple times
                closeBtn.onclick = closeAction;
            } else {
                // Fallback just in case
                alert('Enviado exitosamente a AZ-Digital Cloud');
                this.switchView('metrics-view');
            }

        }, 1500);
    }

    async startTrainingSimulation() {
        const name = document.getElementById('train-model-name').value;
        if (!name) {
            alert('Por favor ingresa un nombre para el nuevo tipo de documento.');
            return;
        }

        const area = document.getElementById('training-progress-area');
        const log = document.getElementById('training-log');
        const bar = document.getElementById('training-progress-fill');
        const status = document.getElementById('training-status-text');

        area.classList.remove('hidden');
        log.innerHTML = '> Inicializando entorno de entrenamiento...<br>';
        bar.style.width = '0%';

        const steps = [
            { pct: 10, msg: "Analizando 50 muestras subidas..." },
            { pct: 30, msg: "Extrayendo características visuales (Key-Value Pairs)..." },
            { pct: 50, msg: "Generando embeddings vectoriales..." },
            { pct: 70, msg: "Ajustando pesos del modelo (Fine-tuning)..." },
            { pct: 90, msg: "Validando contra set de pruebas..." },
            { pct: 100, msg: "¡Modelo entrenado exitosamente!" }
        ];

        for (let step of steps) {
            await this.wait(1000 + Math.random() * 500);
            bar.style.width = `${step.pct}%`;
            status.innerText = step.msg;
            log.innerHTML += `> ${step.msg}<br>`;
            log.scrollTop = log.scrollHeight;
        }

        await this.wait(800);
        alert(`Modelo para "${name}" entrenado y desplegado.`);

        // Auto-add to doctypes
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        mockStore.documentTypes.push({ id: slug, name: name, description: 'Generado por Entrenamiento IA' });
        this.renderAdminTable();

        // Reset UI
        document.getElementById('train-model-name').value = '';
        area.classList.add('hidden');
        // Return to main list
        this.closeTrainingPanel();
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
        const docType = mockStore.documentTypes.find(d => d.id === docId);
        if (!docType) return;

        const modal = document.getElementById('config-modal');
        document.getElementById('modal-title').innerText = `Configurar: ${docType.name}`;

        // Generate Mock Fields (Random mix of standard fields for demo)
        const standardFields = ['NIT', 'Razón Social', 'Fecha', 'Dirección', 'Ciudad', 'Teléfono', 'Email', 'Total', 'Subtotal', 'Impuestos', 'Representante Legal'];
        const container = document.getElementById('modal-fields-list');
        container.innerHTML = '';

        standardFields.forEach((field, index) => {
            const checked = index < 5 ? 'checked' : ''; // Hack: check first 5 by default
            const label = document.createElement('label');
            label.className = 'checkbox-item';
            label.innerHTML = `
                <input type="checkbox" ${checked}>
                <span>${field}</span>
            `;
            container.appendChild(label);
        });

        modal.classList.remove('hidden');

        // Modal Button Listeners (One-time or replacement approach - simplified here)
        const closeBtn = document.getElementById('close-modal-btn');
        const cancelBtn = document.getElementById('cancel-modal-btn');
        const saveBtn = document.getElementById('save-modal-btn');
        const addFieldBtn = document.getElementById('add-field-btn');
        const newFieldInput = document.getElementById('new-field-input');

        const closeModal = () => modal.classList.add('hidden');

        // Logic to add new field
        if (addFieldBtn && newFieldInput) {
            addFieldBtn.onclick = () => {
                const val = newFieldInput.value.trim();
                if (val) {
                    const label = document.createElement('label');
                    label.className = 'checkbox-item';
                    label.innerHTML = `<input type="checkbox" checked><span>${val}</span>`;
                    container.insertBefore(label, container.firstChild); // Add to top
                    newFieldInput.value = '';
                }
            };
        }

        closeBtn.onclick = closeModal;
        cancelBtn.onclick = closeModal;
        saveBtn.onclick = () => {
            const selected = [];
            container.querySelectorAll('input:checked').forEach(cb => {
                selected.push(cb.nextElementSibling.innerText);
            });
            alert(`Configuración Almacenada para ${docType.name}.\nCampos a extraer: ${selected.join(', ')}`);
            closeModal();
        };
    }

    wait(ms) { return new Promise(r => setTimeout(r, ms)); }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });

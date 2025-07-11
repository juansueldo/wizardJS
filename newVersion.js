class WizardJS {
    constructor(selector, config = null, options = {}) {
        this.container = document.querySelector(selector);
        this.config = config;
        this.options = options;
        this.mode = options.mode || 'wizard'; // 'wizard', 'generator', o 'preview'
        this.locale = options.locale || 'en';
        this.translations = this.initTranslations();
        this.loadExample = options.loadExample || false;
        this.exportJson =  options.exportJson || false;
        this.previewJson = options.previewJson || false;
        this.copyJson = options.copyJson || false;
        this.showTitle = options.showTitle || false;
        this.inputAdd = options.inputAdd || 'jsonPreview';
        
        this.currentStep = 0;
        this.data = {};
        this.errors = {};
        this.eventHandlers = {};
        this.stepHistory = [];
        this.conditionalPaths = config?.conditionalPaths || {};
        
        this.generatorConfig = config || {
            title: "Mi Wizard",
            steps: []
        };
        
        this.currentStepIndex = -1;
        this.currentFieldIndex = -1;
        this.tempFields = [];
    }

    getSVGIcon(iconName) {
        const icons = {
            plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            edit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            download: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            copy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            play: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="5,3 19,12 5,21" fill="currentColor"/>
            </svg>`,
            eye: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            file: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        };
        return icons[iconName] || '';
    }

    init() {
        if (this.mode === 'generator') {
            this.initGenerator();
        } else {
            this.render();
            this.bindEvents();
            this.initStyles();
        }
    }
     
    initTranslations() {
        const translations = {
            es: {
                wizard: {
                    next: 'Siguiente',
                    previous: 'Anterior',
                    finish: 'Finalizar',
                    selectOption: 'Selecciona una opción',
                    required: 'obligatorio',
                    validationErrors: {
                        required: 'El campo {field} es obligatorio',
                        email: 'Ingresa un email válido'
                    }
                },
                generator: {
                    title: 'WizardJS - Modo Generador',
                    subtitle: 'Crea y edita configuraciones de wizard visualmente',
                    configuration: 'Configuración',
                    preview: 'Vista Previa',
                    wizardTitle: 'Título del Wizard',
                    addStep: 'Agregar Paso',
                    loadExample: 'Cargar Ejemplo',
                    exportJson: 'Exportar JSON',
                    previewWizard: 'Previsualizar',
                    copyJson: 'Copiar JSON',
                    noSteps: 'No hay pasos configurados',
                    noFields: 'No hay campos agregados',
                    stepConfig: 'Configurar Paso',
                    fieldConfig: 'Configurar Campo',
                    save: 'Agregar',
                    cancel: 'Cancelar',
                    edit: 'Editar',
                    delete: 'Eliminar',
                    deleteConfirm: '¿Eliminar este paso?',
                    jsonCopied: 'JSON copiado al portapapeles',
                    stepId: 'ID del Paso',
                    stepTitle: 'Título',
                    stepDescription: 'Descripción',
                    hasCondition: 'Este paso tiene condiciones',
                    condition: 'Condición',
                    conditionField: 'Campo',
                    conditionOperator: 'Operador',
                    conditionValue: 'Valor',
                    stepFields: 'Campos del Paso',
                    addField: 'Agregar Campo',
                    fieldName: 'Nombre del Campo',
                    fieldLabel: 'Etiqueta',
                    fieldType: 'Tipo',
                    fieldPlaceholder: 'Placeholder',
                    fieldRequired: 'Campo obligatorio',
                    fieldOptions: 'Opciones',
                    addOption: 'Agregar Opción',
                    optionValue: 'Valor',
                    optionLabel: 'Etiqueta',
                    fields: 'campos'
                },
                fieldTypes: {
                    text: 'Texto',
                    email: 'Email',
                    password: 'Contraseña',
                    number: 'Número',
                    textarea: 'Área de Texto',
                    select: 'Lista Desplegable',
                    checkbox: 'Casillas de Verificación',
                    radio: 'Botones de Radio',
                    file: 'Archivo',
                },
                operators: {
                    equals: 'Igual a',
                    not_equals: 'Diferente de',
                    contains: 'Contiene',
                    greater_than: 'Mayor que',
                    less_than: 'Menor que',
                    exists: 'Existe'
                }
            },
            en: {
                wizard: {
                    next: 'Next',
                    previous: 'Previous',
                    finish: 'Finish',
                    selectOption: 'Select an option',
                    required: 'required',
                    validationErrors: {
                        required: 'The field {field} is required',
                        email: 'Enter a valid email'
                    }
                },
                generator: {
                    title: 'WizardJS - Generator Mode',
                    subtitle: 'Create and edit wizard configurations visually',
                    configuration: 'Configuration',
                    preview: 'Preview',
                    wizardTitle: 'Wizard Title',
                    addStep: 'Add Step',
                    loadExample: 'Load Example',
                    exportJson: 'Export JSON',
                    previewWizard: 'Preview',
                    copyJson: 'Copy JSON',
                    noSteps: 'No steps configured',
                    noFields: 'No fields added',
                    stepConfig: 'Configure Step',
                    fieldConfig: 'Configure Field',
                    save: 'Add',
                    cancel: 'Cancel',
                    edit: 'Edit',
                    delete: 'Delete',
                    deleteConfirm: 'Delete this step?',
                    jsonCopied: 'JSON copied to clipboard',
                    stepId: 'Step ID',
                    stepTitle: 'Title',
                    stepDescription: 'Description',
                    hasCondition: 'This step has conditions',
                    condition: 'Condition',
                    conditionField: 'Field',
                    conditionOperator: 'Operator',
                    conditionValue: 'Value',
                    stepFields: 'Step Fields',
                    addField: 'Add Field',
                    fieldName: 'Field Name',
                    fieldLabel: 'Label',
                    fieldType: 'Type',
                    fieldPlaceholder: 'Placeholder',
                    fieldRequired: 'Required field',
                    fieldOptions: 'Options',
                    addOption: 'Add Option',
                    optionValue: 'Value',
                    optionLabel: 'Label',
                    fields: 'fields'
                },
                fieldTypes: {
                    text: 'Text',
                    email: 'Email',
                    password: 'Password',
                    number: 'Number',
                    textarea: 'Text Area',
                    select: 'Dropdown',
                    checkbox: 'Checkboxes',
                    radio: 'Radio Buttons',
                    file: 'File',
                },
                operators: {
                    equals: 'Equals',
                    not_equals: 'Not equals',
                    contains: 'Contains',
                    greater_than: 'Greater than',
                    less_than: 'Less than',
                    exists: 'Exists'
                }
            }
        };
        return translations[this.locale] || translations.es;
    }

    t(key, replacements = {}) {
        const keys = key.split('.');
        let value = this.translations;
        for (const k of keys) {
            value = value[k];
            if (!value) return key;
        }
        
        if (typeof value === 'string') {
            Object.keys(replacements).forEach(placeholder => {
                value = value.replace(`{${placeholder}}`, replacements[placeholder]);
            });
        }
        return value;
    }
    
    initGenerator() {
        this.initGeneratorStyles();
        this.renderGenerator();
        this.bindGeneratorEvents();
        if (this.config) {
            this.generatorConfig = JSON.parse(JSON.stringify(this.config));
            this.updateGeneratorUI();
        }
    }

    initGeneratorStyles() {
        if (!document.getElementById('wizard-generator-styles')) {
            const styles = document.createElement('style');
            styles.id = 'wizard-generator-styles';
            styles.textContent = `
                ${this.getWizardStyles()}
                ${this.getGeneratorStyles()}
            `;
            document.head.appendChild(styles);
        }
    }

    getGeneratorStyles() {
        return `
            .generator-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 15px;
                margin-bottom: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }

            .generator-layout {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
            }

            @media (max-width: 1024px) {
                .generator-layout {
                    grid-template-columns: 1fr;
                }
            }

            .generator-actions {
                display: flex;
                gap: 10px;
            }

            .step-config-item {
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 15px;
                transition: all 0.3s ease;
            }

            .step-config-item:hover {
                border-color: #667eea;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }

            .json-preview {
                background: #1e1e1e;
                color: #d4d4d4;
                padding: 20px;
                border-radius: 10px;
                font-family: 'Monaco', 'Consolas', monospace;
                font-size: 13px;
                line-height: 1.5;
                overflow-x: auto;
                max-height: 500px;
                position: relative;
            }

            .option-input-group {
                display: flex;
                gap: 10px;
                margin: 10px 0px;
            }

            .condition-builder {
                background: #f8f9fb;
                border-radius: 8px;
                padding: 15px;
                margin-top: 10px;
            }

            .condition-row {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 10px;
            }
        `;
    }

    renderGenerator() {
        this.container.innerHTML = `
        <div class="generator-container">
            <div class="generator-layout">
                <div class="generator-panel">
                    ${this.showTitle ? `<h2 class="page-title mb-3">${this.t('generator.configuration')}</h2>` : ''}

                    <div class="form-group mb-3">
                        <label class="form-label">${this.t('generator.wizardTitle')}</label>
                        <input type="text" class="form-control" id="genWizardTitle" value="${this.generatorConfig.title}">
                    </div>

                    <div class="generator-actions mb-3">
                        <button type="button" class="btn btn-primary" onclick="wizardInstance.addStepConfig()">
                            ${this.getSVGIcon('plus')} ${this.t('generator.addStep')}
                        </button>
                        ${this.loadExample ? 
                            `<button type="button" class="btn btn-secondary" onclick="wizardInstance.loadExample()">
                                ${this.getSVGIcon('file')} ${this.t('generator.loadExample')}
                            </button>`
                            : ''
                        }
                    </div>

                    ${this.renderCollapseAreas()}
                    <div id="stepsConfigList"></div>
                    
                </div>

                <div class="generator-panel">
                    ${this.showTitle ? `<h2 class="page-title mb-5">${this.t('generator.preview')}</h2>`:''}
                    
                    <div class="generator-actions mt-4">
                        ${this.exportJson ? 
                        `<button type="button" class="btn btn-primary" onclick="wizardInstance.exportConfig()">
                            ${this.getSVGIcon('download')} ${this.t('generator.exportJson')}
                        </button>` : ''
                        }
                        <button type="button" class="btn btn-secondary" onclick="wizardInstance.previewWizard()">
                            ${this.getSVGIcon('play')} ${this.t('generator.previewWizard')}
                        </button>
                        ${this.copyJson ? 
                            `<button type="button" class="btn btn-secondary" onclick="wizardInstance.copyJSON()">
                                ${this.getSVGIcon('copy')} ${this.t('generator.copyJson')}
                            </button>` : ''
                        }
                    </div>
                    ${this.previewJson ? `<div class="json-preview mt-3">
                        <pre id="jsonPreview"></pre>
                    </div>` : ''}

                    <div id="wizardPreviewContainer" style="margin-top: 20px;"></div>
                </div>
            </div>
        </div>
        `;
        window.wizardInstance = this;
    
        this.updateGeneratorUI();
    }

    openCollapse(collapseId) {
    const targetCollapse = document.getElementById(collapseId);
    if (targetCollapse) {
        const collapse = new bootstrap.Collapse(targetCollapse, { toggle: false });
        collapse.show();
    }
}
    closeCollapse(collapseId) {
        const targetCollapse = document.getElementById(collapseId);
        if (targetCollapse) {
            const collapse = new bootstrap.Collapse(targetCollapse, { toggle: false });
            collapse.hide();
        }
    }

    updateGeneratorUI() {
        this.renderStepsList();
        this.updateJSONPreview();
    }

    renderStepsList() {
        const container = document.getElementById('stepsConfigList');
        
        if (this.generatorConfig.steps.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: #999;">${this.t('generator.noFields')}</p>`;
            return;
        }

        container.innerHTML = this.generatorConfig.steps.map((step, index) => `
            <div class="step-config-item card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>${step.title}</h4>
                        <p>ID: ${step.id} | ${step.fields.length} ${this.t('generator.fields')}</p>
                        ${step.condition ? `<span class="field-type" style="background: #fbbf24;">${this.t('generator.hasCondition')}</span>` : ''}
                    </div>
                    <div style="display: flex; gap: 0.5rem">
                        <a style="cursor:pointer" onclick="wizardInstance.editStepConfig(${index})">
                            ${this.getSVGIcon('edit')}
                        </a>
                        <a style="cursor:pointer" onclick="wizardInstance.deleteStepConfig(${index})">
                            ${this.getSVGIcon('trash')}
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateJSONPreview() {
        const preview = document.getElementById(this.inputAdd);
        if (preview) {
            if(this.inputAdd !== 'jsonPreview'){
                preview.value = JSON.stringify(this.generatorConfig, null, 2);
            }else{
                preview.textContent = JSON.stringify(this.generatorConfig, null, 2);
            }
        }
    }

    addStepConfig() {
        this.currentStepIndex = -1;
        this.tempFields = [];
        this.clearConfigForm();
       
        
        this.openCollapse('stepConfigCollapse');
    }

    editStepConfig(index) {
        this.currentStepIndex = index;
        const step = this.generatorConfig.steps[index];
        this.tempFields = [...step.fields];
        
        // Poblar campos directamente
        document.getElementById('stepId').value = step.id;
        document.getElementById('stepTitle').value = step.title;
        document.getElementById('stepDescription').value = step.description || '';
        document.getElementById('hasCondition').checked = !!step.condition;
        
        if (step.condition) {
            document.getElementById('conditionFields').style.display = 'block';
            document.getElementById('conditionField').value = step.condition.field;
            document.getElementById('conditionOperator').value = step.condition.operator;
            document.getElementById('conditionValue').value = step.condition.value;
        } else {
            document.getElementById('conditionFields').style.display = 'none';
        }
        
        this.renderFieldsList();
        this.openCollapse('stepConfigCollapse');
    }

    deleteStepConfig(index) {
        if (confirm('¿Eliminar este paso?')) {
            this.generatorConfig.steps.splice(index, 1);
            this.updateGeneratorUI();
        }
    }

   saveStepConfig() {
        const stepData = {
            id: document.getElementById('stepId').value,
            title: document.getElementById('stepTitle').value,
            description: document.getElementById('stepDescription').value,
            fields: this.tempFields
        };
        
        if (document.getElementById('hasCondition').checked) {
            stepData.condition = {
                field: document.getElementById('conditionField').value,
                operator: document.getElementById('conditionOperator').value,
                value: document.getElementById('conditionValue').value
            };
        }
        
        if (this.currentStepIndex === -1) {
            this.generatorConfig.steps.push(stepData);
        } else {
            this.generatorConfig.steps[this.currentStepIndex] = stepData;
        }
        
        this.closeCollapse('stepConfigCollapse');
        this.updateGeneratorUI();
    }

    saveFieldConfig() {
        const fieldData = {
            name: document.getElementById('fieldName').value,
            label: document.getElementById('fieldLabel').value,
            type: document.getElementById('fieldType').value,
            placeholder: document.getElementById('fieldPlaceholder').value,
            required: document.getElementById('fieldRequired').checked
        };
        
        if (['select', 'checkbox', 'radio'].includes(fieldData.type)) {
            fieldData.options = this.getFieldOptions();
        }
        
        if (this.currentFieldIndex === -1) {
            this.tempFields.push(fieldData);
        } else {
            this.tempFields[this.currentFieldIndex] = fieldData;
        }
        
        this.hideFieldConfig();
        this.renderFieldsList();
    }

    renderFieldsList() {
        const container = document.getElementById('stepFieldsList');
        
        if (this.tempFields.length === 0) {
            container.innerHTML = '<p style="color: #999;">No hay campos agregados</p>';
            return;
        }
        
        container.innerHTML = this.tempFields.map((field, index) => `
            <div class="card p-2 mb-3">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${field.label}</strong> (${field.type})
                        ${field.required ? '<span style="color: #f56565;">*</span>' : ''}
                    </div>
                    <div>
                        <a style="cursor:pointer;" 
                                onclick="wizardInstance.editFieldConfig(${index})">${this.getSVGIcon('edit')}</a>
                        <a style="cursor:pointer;" 
                                onclick="wizardInstance.deleteFieldConfig(${index})">${this.getSVGIcon('trash')}</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    toggleFieldOptions() {
        const type = document.getElementById('fieldType').value;
        const container = document.getElementById('fieldOptionsContainer');
        const optionsList = document.getElementById('fieldOptionsList');
        
        if (['select', 'checkbox', 'radio'].includes(type)) {
            container.style.display = 'block';
            if (optionsList.children.length === 0) {
                this.addFieldOption();
                this.addFieldOption();
            }
        } else {
            container.style.display = 'none';
            optionsList.innerHTML = '';
        }
    }

    addFieldOption() {
        const container = document.getElementById('fieldOptionsList');
        const optionDiv = document.createElement('div');
        optionDiv.className = 'row mb-2'; // Cambiar de 'option-input-group' a clases Bootstrap
        optionDiv.innerHTML = `
            <div class="col-5">
                <input type="text" class="form-control form-control-sm" placeholder="${this.t('generator.optionValue')}" name="optionValue">
            </div>
            <div class="col-5">
                <input type="text" class="form-control form-control-sm" placeholder="${this.t('generator.optionLabel')}" name="optionLabel">
            </div>
            <div class="col-2">
                <a style="cursor:pointer" onclick="this.closest('.row').remove()">
                    ${this.getSVGIcon('trash')}
                </a>
            </div>
        `;
        container.appendChild(optionDiv);
    }

    getFieldOptions() {
        const options = [];
        const container = document.getElementById('fieldOptionsList');
        const items = container.querySelectorAll('.row');
        
        items.forEach(item => {
            const value = item.querySelector('[name="optionValue"]').value;
            const label = item.querySelector('[name="optionLabel"]').value;
            if (value && label) {
                options.push({ value, label });
            }
        });
        
        return options;
    }

    editFieldConfig(index) {
        this.currentFieldIndex = index;
        const field = this.tempFields[index];
        this.showFieldConfig();

        document.getElementById('fieldOptionsContainer').style.display = 'none';
        document.getElementById('fieldOptionsList').innerHTML = '';
        
        document.getElementById('fieldName').value =  field.name || '';
        document.getElementById('fieldLabel').value =  field.label || '';
        document.getElementById('fieldType').value =  field.type;
        document.getElementById('fieldPlaceholder').value =  field.placeholder || '';
        document.getElementById('fieldRequired').checked =  field.required || false;

        
        if (field.options && ['select', 'checkbox', 'radio'].includes(field.type)) {
            this.toggleFieldOptions();
            const container = document.getElementById('fieldOptionsList');
            
            field.options.forEach(option => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'row mb-2';
                optionDiv.innerHTML = `
                    <div class="col-5">
                        <input type="text" class="form-control form-control-sm" value="${option.value}" name="optionValue">
                    </div>
                    <div class="col-5">
                        <input type="text" class="form-control form-control-sm" value="${option.label}" name="optionLabel">
                    </div>
                    <div class="col-2">
                        <a style="cursor:pointer;" onclick="this.closest('.row').remove()">
                            ${this.getSVGIcon('trash')}
                        </a>
                    </div>
                `;
                container.appendChild(optionDiv);
            });
        }
        
        this.openCollapse('fieldConfigCollapse');
    }

    deleteFieldConfig(index) {
        this.tempFields.splice(index, 1);
        this.renderFieldsList();
    }

    toggleCondition() {
        const conditionFields = document.getElementById('conditionFields');
        conditionFields.style.display = document.getElementById('hasCondition').checked ? 'block' : 'none';
    }

    openModal(modalId) {
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    }

    closeModal(modalId) {
        const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
        if (modal) {
            modal.hide();
        }
    }

    exportConfig() {
        const jsonString = JSON.stringify(this.generatorConfig, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wizard-config.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    copyJSON() {
        const jsonText = document.getElementById('jsonPreview').textContent;
        navigator.clipboard.writeText(jsonText);
        alert('JSON copiado al portapapeles');
    }

    previewWizard() {
        const container = document.getElementById('wizardPreviewContainer');
        this.generatorConfig.title = document.getElementById('genWizardTitle').value;
        this.updateJSONPreview();
        
        container.innerHTML = '<div id="previewWizard"></div>';
        const previewWizard = new WizardJS('#previewWizard', this.generatorConfig, { mode: 'wizard' });
        previewWizard.init();
    }

  

    bindGeneratorEvents() {
        document.getElementById('genWizardTitle').addEventListener('input', (e) => {
            this.generatorConfig.title = e.target.value;
            this.updateJSONPreview();
        });
    }

    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    emit(event, ...args) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(...args));
        }
    }

    initStyles() {
        if (!document.getElementById('wizard-styles')) {
            const styles = document.createElement('style');
            styles.id = 'wizard-styles';
            styles.textContent = this.getWizardStyles();
            document.head.appendChild(styles);
        }
    }

    getWizardStyles() {
        return `
            .wizard-container {
                display: flex;
                flex-direction: column;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                overflow: hidden;
            }
    
            .wizard-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
            }
            
            .wizard-title {
                font-size: 1.8em;
                color: #333;
                margin-bottom: 10px;
                font-weight: 600;
            }
            
            .wizard-progress {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .wizard-content {
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding: 30px;
                position: relative;
            }
            
            .wizard-step {
                display:none;
                transform: translateX(50px);
                transition: all 0.4s ease;
            }
            
            .wizard-step.active {
                display:block;
                opacity: 1;
                transform: translateX(0);
            }
            
            .progress-step {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: #e0e0e0;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 10px;
                font-weight: bold;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .progress-step.active {
                background:rgb(152, 164, 216);
                color: white;
                transform: scale(1.1);
            }
            
            .progress-step.completed {
                background: #4c59af;
                color: white;
            }
            
            .progress-line {
                height: 2px;
                width: 40px;
                background: #e0e0e0;
                transition: all 0.3s ease;
            }
            
            .progress-line.completed {
                background: #4c59af;
            }
            
            .step-title {
                font-size: 1.4em;
                margin-bottom: 15px;
                font-weight: 600;
            }
            
            .step-description {
                margin-bottom: 25px;
                line-height: 1.6;
            }
            
            .wizard-actions {
                display: flex;
                justify-content: space-between;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #f0f0f0;
            }
            

            .error-message {
                color: #f56565;
                font-size: 13px;
                margin-top: 5px;
            }

            .success-message {
                text-align: center;
                padding: 40px;
            }

            .success-icon {
                font-size: 48px;
                margin-bottom: 20px;
            }

            .field-type {
                display: inline-block;
                padding: 3px 8px;
                background: #e0e0e0;
                border-radius: 4px;
                font-size: 12px;
                color: #666;
            }
        `;
    }

    render() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-header" style="flex-direction: column;"">
                    <h1 class="text-center">${this.config.title}</h1>
                    <div class="wizard-progress">
                        ${this.renderProgress()}
                    </div>
                </div>
                <div class="card-body">
                    ${this.renderSteps()}
                </div>
                <div class="card-footer">
                    ${this.renderActions()}
                </div>
            </div>
        `;
    }
    
    renderProgress() {
        const visibleSteps = this.getVisibleSteps();
        const currentVisibleIndex = visibleSteps.findIndex(step => step.index === this.currentStep);
        
        return visibleSteps.map((step, index) => {
            const isActive = index === currentVisibleIndex;
            const isCompleted = index < currentVisibleIndex;
            const stepClass = isActive ? 'active' : (isCompleted ? 'completed' : '');
            
            let html = `<div class="progress-step ${stepClass}" title="${step.title}">${index + 1}</div>`;
            
            if (index < visibleSteps.length - 1) {
                const lineClass = isCompleted ? 'completed' : '';
                html += `<div class="progress-line ${lineClass}"></div>`;
            }
            
            return html;
        }).join('');
    }
    
    renderSteps() {
        return this.config.steps.map((step, index) => {
            const isActive = index === this.currentStep;
            const isVisible = this.isStepVisible(step, index);
            const stepClass = isActive ? 'active' : '';
            const displayClass = isVisible ? '' : 'hidden';
            const title = step.title ? `<h2 class="step-title">${step.title}</h2>` : '';
            const description = step.description ? `<p class="step-description">${step.description}</p>` : '';
            return `
                <div class="wizard-step ${stepClass} ${displayClass}" data-step="${index}">
                    ${title}
                    ${description}
                    ${this.renderFields(step.fields, step.id)}
                </div>
            `;
        }).join('');
    }

    renderActions() {
        const isFirstStep = this.currentStep === 0;
        const isLastStep = this.isLastVisibleStep();
        
        return `
            <button type="button" class="btn btn-secondary" id="prev-btn" 
                    ${isFirstStep ? 'disabled' : ''}>
                ${this.t('wizard.previous')}
            </button>
            <button type="button" class="btn btn-primary" id="next-btn">
                ${isLastStep ? this.t('wizard.finish') : this.t('wizard.next')}
            </button>
        `;
    }
    
    getVisibleSteps() {
        const visibleSteps = [];
        
        this.config.steps.forEach((step, index) => {
            if (this.isStepVisible(step, index)) {
                visibleSteps.push({
                    ...step,
                    index: index
                });
            }
        });
        
        return visibleSteps;
    }
     
    isStepVisible(step, stepIndex) {
        if (!step.condition) {
            return true;
        }
        return this.evaluateCondition(step.condition);
    }
     
    evaluateCondition(condition) {
        const { field, operator, value } = condition;
        const fieldValue = this.data[field];
        
        switch (operator) {
            case 'equals':
                return fieldValue === value;
            case 'not_equals':
                return fieldValue !== value;
            case 'contains':
                return Array.isArray(fieldValue) && fieldValue.includes(value);
            case 'not_contains':
                return !Array.isArray(fieldValue) || !fieldValue.includes(value);
            case 'greater_than':
                return parseFloat(fieldValue) > parseFloat(value);
            case 'less_than':
                return parseFloat(fieldValue) < parseFloat(value);
            case 'exists':
                return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
            case 'not_exists':
                return fieldValue === undefined || fieldValue === null || fieldValue === '';
            default:
                return true;
        }
    }

    isLastVisibleStep() {
        const visibleSteps = this.getVisibleSteps();
        const currentVisibleIndex = visibleSteps.findIndex(step => step.index === this.currentStep);
        return currentVisibleIndex === visibleSteps.length - 1;
    }

    renderFields(fields, stepId) {
        return fields.map(field => {
            const value = this.data[field.name] || '';
            const error = this.errors[field.name] || '';
            
            return `
                <div class="form-group mb-3">
                    <label class="form-label">${field.label}${field.required ? ' *' : ''}</label>
                    ${this.renderField(field, value)}
                    ${error ? `<div class="error-message">${error}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    renderField(field, value) {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
            case 'number':
                return `<input type="${field.type}" name="${field.name}" class="form-control" 
                        value="${value}" placeholder="${field.placeholder || ''}" />`;
            
            case 'textarea':
                return `<textarea name="${field.name}" class="form-textarea" 
                        placeholder="${field.placeholder || ''}">${value}</textarea>`;
            
            case 'select':
                return `<select name="${field.name}" class="form-select">
                            <option value="">Selecciona una opción</option>
                            ${field.options.map(option => 
                                `<option value="${option.value}" ${value === option.value ? 'selected' : ''}>${option.label}</option>`
                            ).join('')}
                        </select>`;
            
            case 'checkbox':
                return `<div class="checkbox-group">
                            ${field.options.map(option => {
                                const checked = Array.isArray(value) && value.includes(option.value);
                                return `<div class="checkbox-item">
                                            <input type="checkbox" name="${field.name}" value="${option.value}" 
                                                    ${checked ? 'checked' : ''} />
                                            <label>${option.label}</label>
                                        </div>`;
                            }).join('')}
                        </div>`;
            
            case 'radio':
                return `<div class="radio-group">
                            ${field.options.map(option => 
                                `<div class="radio-item">
                                    <input type="radio" name="${field.name}" value="${option.value}" 
                                            ${value === option.value ? 'checked' : ''} />
                                    <label>${option.label}</label>
                                </div>`
                            ).join('')}
                        </div>`;
            
            default:
                return `<input type="${field.type}" name="${field.name}" class="form-control" value="${value}" />`;
        }
    }
     
    bindEvents() {
        const nextBtn = this.container.querySelector('#next-btn');
        nextBtn.addEventListener('click', () => {
            if (this.validateCurrentStep()) {
                this.nextStep();
            }
        });

        const prevBtn = this.container.querySelector('#prev-btn');
        prevBtn.addEventListener('click', () => {
            this.prevStep();
        });

        this.container.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.updateData(e.target);
            }
        });

        this.container.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"], input[type="radio"], select')) {
                this.updateData(e.target);
                this.checkConditionalPaths();
            }
        });
    }
     
    updateData(element) {
        const name = element.name;
        const type = element.type;
        
        if (type === 'checkbox') {
            if (!this.data[name]) this.data[name] = [];
            
            if (element.checked) {
                if (!this.data[name].includes(element.value)) {
                    this.data[name].push(element.value);
                }
            } else {
                this.data[name] = this.data[name].filter(val => val !== element.value);
            }
        } else {
            this.data[name] = element.value;
        }
        
        if (this.errors[name]) {
            delete this.errors[name];
            this.renderCurrentStep();
        }
    }

    validateCurrentStep() {
        const currentStepConfig = this.config.steps[this.currentStep];
        this.errors = {};
        
        currentStepConfig.fields.forEach(field => {
            const value = this.data[field.name];
            
            if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
                this.errors[field.name] = `El campo ${field.label} es obligatorio`;
            }
            
            if (field.type === 'email' && value && !this.isValidEmail(value)) {
                this.errors[field.name] = 'Ingresa un email válido';
            }
        });
        
        if (Object.keys(this.errors).length > 0) {
            this.emit('validation', this.errors);
            this.renderCurrentStep();
            return false;
        }
        
        return true;
    }
     
    checkConditionalPaths() {

        const wasVisible = this.getVisibleSteps().some(step => step.index === this.currentStep);
        
        if (!wasVisible) {
            this.navigateToNextVisibleStep();
        }
        
        this.renderCurrentStep();
        this.emit('pathChange', this.currentStep, this.data);
    }

    navigateToNextVisibleStep() {
        const nextStep = this.getNextVisibleStep();
        if (nextStep !== null) {
            this.currentStep = nextStep;
        }
    }

    getNextVisibleStep() {
        const visibleSteps = this.getVisibleSteps();
        const currentVisibleIndex = visibleSteps.findIndex(step => step.index === this.currentStep);
        if (currentVisibleIndex < visibleSteps.length - 1) {
            return visibleSteps[currentVisibleIndex + 1].index;
        }
        return null;
    }
     
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
     
    renderCurrentStep() {
        const stepsContainer = this.container.querySelector('.wizard-content');
        const progressContainer = this.container.querySelector('.wizard-progress');
        const actionsContainer = this.container.querySelector('.wizard-actions');
        stepsContainer.innerHTML = this.renderSteps();
        progressContainer.innerHTML = this.renderProgress();
        actionsContainer.innerHTML = this.renderActions();
        this.bindEvents();
    }
    
    nextStep() {
        this.stepHistory.push(this.currentStep);
        const nextStep = this.getNextVisibleStep();
        if (nextStep !== null) {
            this.currentStep = nextStep;
            this.render();
            this.bindEvents();
            this.emit('stepChange', this.currentStep, this.data);
        } else {
            this.complete();
        }
    }
     
    getNextVisibleStep() {
        const visibleSteps = this.getVisibleSteps();
        const currentVisibleIndex = visibleSteps.findIndex(step => step.index === this.currentStep);
        
        if (currentVisibleIndex < visibleSteps.length - 1) {
            return visibleSteps[currentVisibleIndex + 1].index;
        }
        
        return null;
    }
      
    prevStep() {
        if (this.stepHistory.length > 0) {
            this.currentStep = this.stepHistory.pop();
        } else {
            const prevStep = this.getPrevVisibleStep();
            if (prevStep !== null) {
                this.currentStep = prevStep;
            }
        }
        this.render();
        this.bindEvents();
        this.emit('stepChange', this.currentStep, this.data);
    }

    getPrevVisibleStep() {
        const visibleSteps = this.getVisibleSteps();
        const currentVisibleIndex = visibleSteps.findIndex(step => step.index === this.currentStep);
        
        if (currentVisibleIndex > 0) {
            return visibleSteps[currentVisibleIndex - 1].index;
        }
        
        return null;
    }

    complete() {
        this.emit('complete', this.data);
    }

    showFieldConfig() {
        document.getElementById('fieldConfigArea').style.display = 'block';
    }

    hideFieldConfig() {
        document.getElementById('fieldConfigArea').style.display = 'none';
        this.clearFieldForm();
    }

    clearFieldForm() {
        document.getElementById('fieldName').value = '';
        document.getElementById('fieldLabel').value = '';
        document.getElementById('fieldType').value = 'text';
        document.getElementById('fieldPlaceholder').value = '';
        document.getElementById('fieldRequired').checked = false;
        document.getElementById('fieldOptionsContainer').style.display = 'none';
        document.getElementById('fieldOptionsList').innerHTML = '';
    }

    clearConfigForm(){
        document.getElementById('stepId').value = '';
        document.getElementById('stepTitle').value = '';
        document.getElementById('stepDescription').value = '';
        document.getElementById('hasCondition').checked = false;
        document.getElementById('stepFieldsList').innerHTML = '';
        document.getElementById('conditionFields').style.display = 'none';
    }

    renderCollapseAreas() {
        return `
        <div class="collapse mb-3" id="stepConfigCollapse">
            <div class="card card-body mt-3">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0">${this.t('generator.stepConfig')}</h5>
                    <button type="button" class="btn-close" onclick="wizardInstance.closeCollapse('stepConfigCollapse')"></button>
                </div>
                
                <!-- Información básica del paso -->
                <div class="mb-3">
                    <label class="form-label">${this.t('generator.stepId')}</label>
                    <input type="text" class="form-control" id="stepId" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">${this.t('generator.stepTitle')}</label>
                    <input type="text" class="form-control" id="stepTitle" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">${this.t('generator.stepDescription')}</label>
                    <textarea class="form-control" id="stepDescription" rows="3"></textarea>
                </div>
                
                <!-- Condiciones -->
                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="hasCondition" onchange="wizardInstance.toggleCondition()">
                        <label class="form-check-label" for="hasCondition">
                            ${this.t('generator.hasCondition')}
                        </label>
                    </div>
                </div>
                
                <div id="conditionFields" style="display: none;" class="mb-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <label class="form-label">${this.t('generator.conditionField')}</label>
                                    <input type="text" class="form-control" id="conditionField">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">${this.t('generator.conditionOperator')}</label>
                                    <select class="form-select" id="conditionOperator">
                                        <option value="equals">${this.t('operators.equals')}</option>
                                        <option value="not_equals">${this.t('operators.not_equals')}</option>
                                        <option value="contains">${this.t('operators.contains')}</option>
                                        <option value="greater_than">${this.t('operators.greater_than')}</option>
                                        <option value="less_than">${this.t('operators.less_than')}</option>
                                        <option value="exists">${this.t('operators.exists')}</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">${this.t('generator.conditionValue')}</label>
                                    <input type="text" class="form-control" id="conditionValue">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Campos del paso -->
                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="mb-0">${this.t('generator.stepFields')}</h6>
                        <button type="button" class="btn btn-sm btn-outline-primary" 
                                onclick="wizardInstance.addFieldConfig()">
                            ${this.getSVGIcon('plus')} ${this.t('generator.addField')}
                        </button>
                    </div>
                    <div id="stepFieldsList"></div>
                </div>
                
                <!-- Área de configuración de campo (se muestra/oculta dinámicamente) -->
                <div id="fieldConfigArea" style="display: none;" class="mb-3">
                    <div class="card border-primary">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="mb-0">${this.t('generator.fieldConfig')}</h6>
                                <button type="button" class="btn-close btn-sm" onclick="wizardInstance.hideFieldConfig()"></button>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">${this.t('generator.fieldName')}</label>
                                <input type="text" class="form-control" id="fieldName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">${this.t('generator.fieldLabel')}</label>
                                <input type="text" class="form-control" id="fieldLabel" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">${this.t('generator.fieldType')}</label>
                                <select class="form-select" id="fieldType" onchange="wizardInstance.toggleFieldOptions()">
                                    <option value="text">${this.t('fieldTypes.text')}</option>
                                    <option value="email">${this.t('fieldTypes.email')}</option>
                                    <option value="password">${this.t('fieldTypes.password')}</option>
                                    <option value="number">${this.t('fieldTypes.number')}</option>
                                    <option value="textarea">${this.t('fieldTypes.textarea')}</option>
                                    <option value="select">${this.t('fieldTypes.select')}</option>
                                    <option value="checkbox">${this.t('fieldTypes.checkbox')}</option>
                                    <option value="radio">${this.t('fieldTypes.radio')}</option>
                                    <option value="file">${this.t('fieldTypes.file')}</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">${this.t('generator.fieldPlaceholder')}</label>
                                <input type="text" class="form-control" id="fieldPlaceholder">
                            </div>
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="fieldRequired">
                                    <label class="form-check-label" for="fieldRequired">
                                        ${this.t('generator.fieldRequired')}
                                    </label>
                                </div>
                            </div>

                            <div id="fieldOptionsContainer" style="display: none;" class="mb-3">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <h6 class="card-title mb-0">${this.t('generator.fieldOptions')}</h6>
                                            <button type="button" class="btn btn-sm btn-outline-primary" 
                                                    onclick="wizardInstance.addFieldOption()">
                                                ${this.getSVGIcon('plus')} ${this.t('generator.addOption')}
                                            </button>
                                        </div>
                                        <div id="fieldOptionsList"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-primary" onclick="wizardInstance.saveFieldConfig()">${this.t('generator.save')}</button>
                                <button type="button" class="btn btn-secondary" onclick="wizardInstance.hideFieldConfig()">${this.t('generator.cancel')}</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Acciones principales del paso -->
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-primary" onclick="wizardInstance.saveStepConfig()">${this.t('generator.save')}</button>
                    <button type="button" class="btn btn-secondary" onclick="wizardInstance.closeCollapse('stepConfigCollapse')">${this.t('generator.cancel')}</button>
                </div>
            </div>
        </div>`;
    }

    addFieldConfig() {
        this.currentFieldIndex = -1;
        this.clearFieldForm();
        this.showFieldConfig();
    }
}

// govmap functions

function initGovMap() {
    govmap.createMap('map', {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        visibleLayers: [],
        layers: ['kids_g', 'school', 'bus_stops'],
        layersMode: 2,
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: true
    });
}

function zoomToXY() {
    toggleParentDropdown();
    openModal([
        { label: 'X', value: '', type: 'number', isOptional: false },
        { label: 'Y', value: '', type: 'number', isOptional: false },
        { label: 'level', value: '', type: 'number', isOptional: true },
        { label: 'marker', value: '', type: 'boolean', isOptional: true },
    ]).then(values => {
        if (!values) return; // canceled or dismissed
        const x = parseFloat(values[0]);
        const y = parseFloat(values[1]);
        const levelVal = parseFloat(values[2]);
        const level = isFinite(levelVal) ? levelVal : 10;
        const marker = (values[3] == null || values[3] === '') ? true : (values[3] === 'true');
        if (isFinite(x) && isFinite(y)) {
            // Show what is being requested as feedback
            renderResponse({ action: 'zoomToXY', params: { x, y, level, marker } });
            govmap.zoomToXY({ x, y, level, marker });
        }
    });
}

function draw(type) {
    const subContainer = document.getElementById('general-functions-dropdown');
    closeAllDropdowns();
    renderResponse(null);
    
    // Clear the current trigger and active states
    if (subContainer) {
        delete subContainer.dataset.currentTrigger;
        closeSubMenus();
    }
    
    // Execute the draw action
    govmap.draw(type)
        .then(response => {
            renderResponse(response);
        });
}

function onEvent(eventName) {
    renderResponse({ action: 'onEvent', event: eventName });
    govmap.onEvent(eventName).progress((payload) => {
        renderResponse({ event: eventName, payload });
    });
    closeSubMenus();
}

function unbindEvent(eventName) {
    govmap.unbindEvent(eventName);
    closeSubMenus();
}

function searchAndLocate() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { 
            label: 'type',
            options: [
                { 
                    value: govmap.locateType.lotParcelToAddress,
                    label: 'govmap.locateType.lotParcelToAddress' 
                },
                { 
                    value: govmap.locateType.addressToLotParcel,
                    label: 'govmap.locateType.addressToLotParcel' 
                }
            ],
            isOptional: false,
            value: govmap.locateType.lotParcelToAddress
         },
        { label: 'address', value: '', type: 'string', isOptional: true },
        { label: 'lot', value: '', type: 'number', isOptional: true },
        { label: 'parcel', value: '', type: 'number', isOptional: true },
    ]).then(values => {
        if (!values) return; // canceled or dismissed
        const params = Number(values[0]) === govmap.locateType.addressToLotParcel ? {
            lot: Number(values[2]),
            parcel: Number(values[3]),
            } : {
                address: values[1]
            };
        govmap.searchAndLocate({type: Number(values[0], ...params)})
            .then(response => {
                renderResponse(response);
            });
    });
}

// Utils

// Unified renderer: pretty-prints an object/string into #response and toggles #response-section
function renderResponse(data) {
    // Close any open menus; do NOT toggle-open them here
    closeAllDropdowns();
    const out = document.getElementById('response');
    const section = document.getElementById('response-section');
    if (!out || !section) return;
    // Hide by default
    section.style.display = 'none';
    out.innerHTML = '';
    if (data == null) return;
    const pre = document.createElement('pre');
    pre.style.margin = '0.5rem 0';
    pre.style.direction = 'ltr';
    pre.textContent = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    out.appendChild(pre);
    if (out.textContent.trim()) section.style.display = 'block';
}

function copy() {
    const response = document.getElementById('response');
    const section = document.getElementById('response-section');
    if (!response) return;
    const text = (response.textContent || '').trim();
    if (!text) return;

    const showTooltip = (msg) => {
        if (!section) return;
        // Remove existing tooltip if present
        const old = document.getElementById('copy-tooltip');
        if (old) old.remove();
        const tip = document.createElement('div');
        tip.id = 'copy-tooltip';
        tip.textContent = msg;
        tip.style.cssText = [
            'position:absolute',
            'top:8px',
            'right:80px',
            'background:rgba(31,41,55,0.95)',
            'color:#fff',
            'padding:4px 8px',
            'border-radius:6px',
            'font-size:12px',
            'box-shadow:0 2px 6px rgba(0,0,0,0.2)',
            'z-index: 30'
        ].join(';');
        section.appendChild(tip);
        setTimeout(() => tip.remove(), 2000);
    };

    const doCopy = (str) => navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(str)
        : new Promise((resolve, reject) => {
            try {
                const ta = document.createElement('textarea');
                ta.value = str;
                ta.style.position = 'fixed';
                ta.style.top = '-1000px';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                const ok = document.execCommand('copy');
                document.body.removeChild(ta);
                ok ? resolve() : reject(new Error('copy failed'));
            } catch (e) { reject(e); }
        });

    doCopy(text)
        .then(() => showTooltip('הועתק'))
        .catch(() => showTooltip('שגיאה בהעתקה'));
}

function handleSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchTerm = searchInput.value.trim();

    govmap.geocode({ keyword: searchTerm, type: govmap.geocodeType.AccuracyOnly })
        .then(function (response) {
            console.log(response);
            if (response.data && response.data.length > 0) {
                const firstResult = response.data[0];
                console.log(`Zooming to: ${firstResult.X}, ${firstResult.Y}`);
                zoomToXY(firstResult.X, firstResult.Y);
            } else {
                console.warn('לא נמצאו תוצאות');
            }
        });
}

function getLayerData(x, y) {
    var params = {
        LayerName: 'bus_stops',
        Point: { x, y },
        Radius: 200,
    };

    return new Promise(resolve => govmap.getLayerData(params).then(response => resolve(response)));
}

// Opens a generic modal with dynamic fields and confirm.
// fields: Array of { label: string, value: string|number, type: 'string'|'number' }
// Returns a Promise that resolves to an array of values (strings) on OK, or null on cancel/dismiss.
function openModal(fields) {
    // Prevent multiple modals
    const existing = document.getElementById('generic-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'generic-modal-overlay';
    overlay.style.cssText = [
        'position:fixed',
        'inset:0',
        'background:rgba(0,0,0,0.4)',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'z-index: 2000'
    ].join(';');

    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.style.cssText = [
        'background:#fff',
        'min-width:320px',
        'max-width:90vw',
        'border-radius:8px',
        'box-shadow:0 10px 25px rgba(0,0,0,0.2)',
        'padding:16px',
        'direction: rtl',
        'font-family: inherit'
    ].join(';');

    dialog.innerHTML = `
        <div style="margin-bottom:8px;font-weight:600;color:#1f2937;">חלון קלט</div>
        <div id="modal-fields" style="display:flex;flex-direction:column;gap:8px;"></div>
        <div style="display:flex;gap:8px;justify-content:flex-start;margin-top:12px;">
            <button id="modal-ok" class="btn" style="padding:0.4rem 0.8rem;">אישור</button>
            <button id="modal-cancel" style="padding:0.4rem 0.8rem;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;cursor:pointer;">ביטול</button>
        </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Render dynamic fields
    const fieldsContainer = dialog.querySelector('#modal-fields');
    const inputs = [];
    (fields || []).forEach((f, idx) => {
        const wrapper = document.createElement('label');
        wrapper.style.cssText = 'display:flex;align-items:center;gap:8px;';

        const span = document.createElement('span');
        span.style.minWidth = '80px';
        span.textContent = f.label ?? `Field ${idx + 1}`;
        
        let input;
        
        if (Array.isArray(f.options)) {
            // Create dropdown for array options
            input = document.createElement('select');
            input.style.cssText = 'flex:1;padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;';
            
            // Add empty option if field is optional
            if (f.isOptional) {
                const emptyOption = document.createElement('option');
                emptyOption.value = '';
                emptyOption.textContent = '-- Select --';
                input.appendChild(emptyOption);
            }
            
            // Add provided options
            f.options.forEach(option => {
                const optionEl = document.createElement('option');
                optionEl.value = option.value ?? option;
                optionEl.textContent = option.label ?? option;
                optionEl.selected = (f.value !== undefined && (option.value === f.value || option === f.value));
                input.appendChild(optionEl);
            });
        } else if (f.type === 'number') {
            input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.style.cssText = 'flex:1;padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;';
            input.value = (f.value ?? '').toString();
        } else if (f.type === 'boolean') {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.style.cssText = 'width:auto;height:auto;';
            const v = f.value;
            input.checked = v === true || v === 'true' || v === 1 || v === '1';
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.style.cssText = 'flex:1;padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;';
            input.value = (f.value ?? '').toString();
        }

        wrapper.appendChild(span);
        wrapper.appendChild(input);

        if (f.isOptional) {
            const optional = document.createElement('span');
            optional.textContent = 'לא חובה';
            optional.style.cssText = 'color:#6b7280;font-size:0.85rem;';
            wrapper.appendChild(optional);
        }

        fieldsContainer.appendChild(wrapper);
        inputs.push(input);
    });

    // Focus first input
    setTimeout(() => { if (inputs[0]) inputs[0].focus(); }, 0);

    return new Promise(resolve => {
        const cleanup = () => {
            document.removeEventListener('keydown', onKeyDown);
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        };

        const submit = () => {
            const result = inputs.map(inp => inp.type === 'checkbox' ? (inp.checked ? 'true' : 'false') : inp.value);
            cleanup();
            resolve(result);
        };

        const cancel = () => {
            cleanup();
            resolve(null);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
            } else if (e.key === 'Enter') {
                // Allow enter to confirm if focus is in inputs
                if (inputs.includes(document.activeElement)) {
                    submit();
                }
            }
        };

        document.addEventListener('keydown', onKeyDown);

        // Overlay click closes only if clicking outside the dialog
        overlay.addEventListener('click', cancel);
        dialog.addEventListener('click', (e) => e.stopPropagation());

        dialog.querySelector('#modal-ok').addEventListener('click', submit);
        dialog.querySelector('#modal-cancel').addEventListener('click', cancel);
    });
}

// Generic submenu toggle by trigger id (e.g., 'draw-link', 'onevent-link')
function toggleGeneralFunctionsSubMenu(triggerId) {
    const subContainer = document.getElementById('general-functions-dropdown');
    const trigger = document.getElementById(triggerId);
    if (!subContainer || !trigger) return;

    // Get the target menu type based on the trigger
    const menuTypeMap = {
        'draw-link': 'draw-link',
        'onevent-link': 'onevent-link',
        'unbindevent-link': 'onevent-link'
    };
    
    const menuType = menuTypeMap[triggerId] || triggerId;
    const targetMenu = subContainer.querySelector(`.${menuType}`);
    
    if (!targetMenu) return;

    // Check if the same menu is already open
    const isAlreadyOpen = subContainer.classList.contains('active') && 
                         targetMenu.classList.contains('active');

    // Close all menus first
    subContainer.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('#general-functions .dropdown-item').forEach(a => a.classList.remove('active'));

    if (isAlreadyOpen) {
        subContainer.classList.remove('active');
        return;
    }

    // Position the submenu next to the trigger
    const rect = trigger.getBoundingClientRect();
    subContainer.style.top = `${rect.top}px`;
    subContainer.style.left = `${rect.left - subContainer.offsetWidth - 10}px`;

    // Set the current trigger for action handling
    subContainer.dataset.currentTrigger = triggerId;

    // Show the submenu and highlight the trigger
    subContainer.classList.add('active');
    targetMenu.classList.add('active');
    trigger.classList.add('active');
    
    // Prevent event from bubbling up to document click handler
    event.stopPropagation();
}

// Use the currentTrigger stored on the submenu container to decide whether to bind or unbind
function handleEventAction(eventName) {
    const subContainer = document.getElementById('general-functions-dropdown');
    const from = subContainer?.dataset?.currentTrigger;
    
    // Close all dropdowns first
    closeAllDropdowns();
    
    // Clear any previous response
    renderResponse(null);
    
    // Handle the action
    if (from === 'unbindevent-link') {
        unbindEvent(eventName);
        renderResponse({ action: 'unbindEvent', event: eventName });
    } else if (from === 'onevent-link') {
        onEvent(eventName);
        renderResponse({ action: 'onEvent', event: eventName });
    }
    
    // Clear the current trigger and active states
    if (subContainer) {
        delete subContainer.dataset.currentTrigger;
        // Remove active class from parent menu items
        closeSubMenus();
    }
    
    // Prevent event from bubbling up to document click handler
    event.stopPropagation();
    
    // Return false to prevent default action
    return false;
}

function toggleParentDropdown(id) {
    // Close all dropdowns first
    const categories = ['general-functions', 'search-functions'];
    const dropdown = document.getElementById(id);
    
    categories.forEach(categoryId => {
        if (categoryId !== id) {
            const otherDropdown = document.getElementById(categoryId);
            if (otherDropdown) otherDropdown.classList.remove('active');
        }
        
        closeSubMenus();
    });
    
    // Toggle the clicked dropdown
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function closeSubMenus() {
    document.querySelectorAll('.submenu-container').forEach(item => {
        item.classList.remove('active');
    });
}

function closeAllDropdowns() {
    const parent = document.getElementById('general-functions');
    const subContainer = document.getElementById('dropdown');
    if (parent) parent.classList.remove('active');
    if (subContainer) {
        subContainer.classList.remove('active');
        subContainer.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
    }
    // clear active state from all submenu trigger links
    document.querySelectorAll('#general-functions .dropdown-item').forEach(a => a.classList.remove('active'));
}

// Close dropdowns when clicking outside
document.addEventListener('click', function (event) {
    const dropdownParents = document.querySelectorAll('.dropdown-parent');
    const subContainers = document.querySelectorAll('.sub-dropdown');
    
    // Check if click is outside all dropdown parents and submenus
    const isOutsideAll = Array.from(dropdownParents).every(parent => 
        !parent.contains(event.target)
    ) && Array.from(subContainers).every(container => 
        !container.contains(event.target)
    );
    
    if (isOutsideAll) {
        // Close all parent dropdowns
        dropdownParents.forEach(dropdown => {
            dropdown.classList.remove('active');
            const arrow = dropdown.querySelector('.dropdown-arrow');
            if (arrow) arrow.style.transform = '';
        });
        
        // Close all submenus
        subContainers.forEach(container => {
            container.classList.remove('active');
            container.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
        });
        
        // Remove active state from all dropdown items
        document.querySelectorAll('.dropdown-parent .dropdown-item').forEach(a => a.classList.remove('active'));
    } else {
        // If clicking inside a dropdown, prevent it from closing
        event.stopPropagation();
    }
});
const searchInput = document.querySelector('.search-input');
const searchBtn = document.getElementById('searchBtn');
function updateSearchBtn() {
    searchBtn.disabled = searchInput.value.trim() === '';
}
searchInput.addEventListener('input', updateSearchBtn);
// Initial state
updateSearchBtn();

// Handle Enter key in search input
searchInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter' && !searchBtn.disabled) {
        handleSearch();
    }
});


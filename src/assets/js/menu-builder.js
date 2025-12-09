// ============================================
// Menu Builder - Main JavaScript Module
// ============================================
// Description: Nested drag-drop menu builder with Sortable.js
// Features: 
// - Create nested menus with parent selection
// - Drag & drop to reorder and change hierarchy
// - Max depth limitation (default: 3 levels)
// - Auto-update data-level attributes
// - JSON export functionality
// - Real-time notifications
// ============================================

import Sortable from 'sortablejs';

// ============================================
// Configuration & State
// ============================================

// Maximum allowed nesting depth
const MAX_DEPTH = 3;

// Global state
let menuData = [];
let menuCounter = 0;
let sortableInstances = [];

// ============================================
// Initialization
// ============================================

/**
 * Initialize the menu builder
 * Call this function when DOM is ready
 */
export function initMenuBuilder() {
  setupEventListeners();
  renderMenu();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  const menuForm = document.getElementById('menuForm');
  if (menuForm) {
    menuForm.addEventListener('submit', handleFormSubmit);
  }
}

// ============================================
// Form Handling
// ============================================

/**
 * Handle form submission to add new menu item
 * @param {Event} e - Form submit event
 */
function handleFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('menuTitle').value.trim();
  const url = document.getElementById('menuUrl').value.trim();
  const icon = document.getElementById('menuIcon').value.trim();
  const parentId = document.getElementById('parentMenu').value;

  if (!title || !url) {
    showNotification('لطفاً عنوان و آدرس را وارد کنید', 'error');
    return;
  }

  const menuItem = {
    id: ++menuCounter,
    title: title,
    url: url,
    icon: icon || 'fas fa-link',
    children: []
  };

  if (parentId) {
    // Add to parent menu
    const parent = findItemById(menuData, parseInt(parentId));
    if (parent) {
      parent.children.push(menuItem);
      showNotification('منو با موفقیت به زیرمجموعه اضافه شد', 'success');
    }
  } else {
    // Add to root level
    menuData.push(menuItem);
    showNotification('منو با موفقیت اضافه شد', 'success');
  }

  renderMenu();
  updateParentSelect();
  e.target.reset();
}

// ============================================
// Parent Select Dropdown
// ============================================

/**
 * Update parent menu dropdown with current menu structure
 */
function updateParentSelect() {
  const select = document.getElementById('parentMenu');
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = '<option value="">بدون والد (سطح اول)</option>';

  function addOptions(items, prefix = '') {
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = prefix + item.title;
      select.appendChild(option);

      if (item.children && item.children.length > 0) {
        addOptions(item.children, prefix + '-- ');
      }
    });
  }

  addOptions(menuData);
  select.value = currentValue;
}

// ============================================
// Sortable.js Integration
// ============================================

/**
 * Create a Sortable instance for nested drag-drop
 * @param {HTMLElement} el - Element to make sortable
 * @returns {Sortable} - Sortable instance
 */
function createNestedSortable(el) {
  const sortable = new Sortable(el, {
    group: 'nested', // Allow dragging between lists
    animation: 150,
    fallbackOnBody: true, // Required for nested sortables
    swapThreshold: 0.65, // Recommended for nested sortables
    invertSwap: true, // Better drag behavior
    handle: '.drag-handle', // Only drag from handle
    ghostClass: 'sortable-ghost', // Class for dragged item
    chosenClass: 'sortable-chosen', // Class for selected item

    /**
     * Before moving item - Check depth limit
     * @param {Event} evt - Move event
     * @returns {boolean} - Allow move or not
     */
    onMove: function (evt) {
      const draggedItem = evt.dragged;
      const toList = evt.to;

      // Calculate target depth
      let targetDepth = 0;
      let currentEl = toList;

      while (currentEl && currentEl.id !== 'menuList') {
        if (currentEl.classList.contains('nested-sortable')) {
          targetDepth++;
        }
        currentEl = currentEl.parentElement;
      }

      // Calculate depth of dragged item (including its children)
      const draggedDepth = getMaxDepthOfItem(draggedItem);

      // Check if total depth exceeds limit
      if (targetDepth + draggedDepth > MAX_DEPTH) {
        showNotification(`حداکثر عمق مجاز ${MAX_DEPTH} سطح است!`, 'error');
        return false; // Prevent move
      }

      return true; // Allow move
    },

    /**
     * After item is dropped
     */
    onEnd: function () {
      updateAllLevels(); // Update data-level attributes
      updateMenuDataFromDOM(); // Sync data with DOM
    }
  });

  sortableInstances.push(sortable);
  return sortable;
}

// ============================================
// Depth Calculation
// ============================================

/**
 * Get maximum depth of an item including all its nested children
 * @param {HTMLElement} element - Menu item element
 * @returns {number} - Maximum depth
 */
function getMaxDepthOfItem(element) {
  let maxDepth = 0;

  function traverse(el, depth) {
    const nestedList = el.querySelector(':scope > .nested-sortable');
    if (nestedList && nestedList.children.length > 0) {
      const children = Array.from(nestedList.children).filter(child =>
        child.classList.contains('menu-item')
      );

      children.forEach(child => {
        maxDepth = Math.max(maxDepth, depth + 1);
        traverse(child, depth + 1);
      });
    }
  }

  traverse(element, 0);
  return maxDepth;
}

/**
 * Update data-level attribute for all menu items
 * Called after drag-drop to keep levels in sync
 */
function updateAllLevels() {
  const menuList = document.getElementById('menuList');
  if (!menuList) return;

  function updateLevel(element, level) {
    const items = Array.from(element.children).filter(el =>
      el.classList.contains('menu-item')
    );

    items.forEach(item => {
      item.setAttribute('data-level', level);

      const nestedList = item.querySelector(':scope > .nested-sortable');
      if (nestedList) {
        updateLevel(nestedList, level + 1);
      }
    });
  }

  updateLevel(menuList, 0);
}

// ============================================
// Menu Rendering
// ============================================

/**
 * Render entire menu structure to DOM
 */
function renderMenu() {
  const menuList = document.getElementById('menuList');
  if (!menuList) return;

  // Destroy previous Sortable instances
  sortableInstances.forEach(instance => {
    if (instance && instance.destroy) {
      instance.destroy();
    }
  });
  sortableInstances = [];

  // Show empty state if no items
  if (menuData.length === 0) {
    menuList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>هنوز آیتمی اضافه نشده است</p>
      </div>
    `;
    return;
  }

  menuList.innerHTML = '';

  // Render each top-level item
  menuData.forEach(item => {
    menuList.appendChild(createMenuItem(item, 0));
  });

  // Make root list sortable
  createNestedSortable(menuList);
  updateJsonOutput();
}

/**
 * Create a single menu item element with nested children
 * @param {Object} item - Menu item data
 * @param {number} level - Nesting level (0 = root)
 * @returns {HTMLElement} - Menu item element
 */
function createMenuItem(item, level = 0) {
  const li = document.createElement('li');
  li.className = 'menu-item';
  li.setAttribute('data-id', item.id);
  li.setAttribute('data-level', level);

  li.innerHTML = `
    <div class="menu-item-header">
      <span class="drag-handle">
        <i class="fas fa-grip-vertical"></i>
      </span>
      <div class="menu-item-info">
        <div class="menu-item-title">
          <i class="${item.icon}"></i> ${item.title}
        </div>
        <div class="menu-item-url">${item.url}</div>
      </div>
      <div class="menu-item-actions">
        <button class="btn-icon btn-delete" onclick="window.menuBuilder.deleteMenuItem(${item.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;

  // Always create nested container (even if empty) to allow dropping items
  const childContainer = document.createElement('ul');
  childContainer.className = 'nested-sortable';

  if (item.children && item.children.length > 0) {
    item.children.forEach(child => {
      childContainer.appendChild(createMenuItem(child, level + 1));
    });
  } else {
    childContainer.classList.add('empty-nested');
  }

  li.appendChild(childContainer);
  createNestedSortable(childContainer);

  return li;
}

// ============================================
// Data Management
// ============================================

/**
 * Update menuData from current DOM structure
 * Called after drag-drop operations
 */
function updateMenuDataFromDOM() {
  function parseList(listElement) {
    const items = [];
    const directChildren = Array.from(listElement.children).filter(el =>
      el.classList.contains('menu-item')
    );

    directChildren.forEach(li => {
      const id = parseInt(li.getAttribute('data-id'));
      const originalItem = findItemById(menuData, id);

      if (originalItem) {
        const newItem = {
          id: originalItem.id,
          title: originalItem.title,
          url: originalItem.url,
          icon: originalItem.icon,
          children: []
        };

        const nestedList = li.querySelector(':scope > .nested-sortable');
        if (nestedList) {
          newItem.children = parseList(nestedList);

          // Update empty state class
          if (newItem.children.length === 0) {
            nestedList.classList.add('empty-nested');
          } else {
            nestedList.classList.remove('empty-nested');
          }
        }

        items.push(newItem);
      }
    });

    return items;
  }

  const menuList = document.getElementById('menuList');
  if (menuList) {
    menuData = parseList(menuList);
    updateJsonOutput();
    updateParentSelect();
  }
}

/**
 * Find menu item by ID (recursive search)
 * @param {Array} items - Array of menu items
 * @param {number} id - Item ID to find
 * @returns {Object|null} - Found item or null
 */
function findItemById(items, id) {
  for (let item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Delete menu item by ID
 * @param {number} id - Item ID to delete
 */
export function deleteMenuItem(id) {
  function removeById(items) {
    return items.filter(item => {
      if (item.id === id) {
        return false;
      }
      if (item.children) {
        item.children = removeById(item.children);
      }
      return true;
    });
  }

  menuData = removeById(menuData);
  renderMenu();
  updateParentSelect();
  showNotification('منو با موفقیت حذف شد', 'success');
}

// ============================================
// JSON Export
// ============================================

/**
 * Update JSON output display
 */
function updateJsonOutput() {
  const output = document.getElementById('jsonOutput');
  if (!output) return;

  // Remove 'id' field from output (internal use only)
  const cleanData = JSON.parse(
    JSON.stringify(menuData, (key, value) => {
      if (key === 'id') return undefined;
      return value;
    })
  );

  output.textContent = JSON.stringify(cleanData, null, 2);
}

/**
 * Export menu structure as JSON file
 */
export function exportMenu() {
  // Remove 'id' field from export
  const cleanData = JSON.parse(
    JSON.stringify(menuData, (key, value) => {
      if (key === 'id') return undefined;
      return value;
    })
  );

  const dataStr = JSON.stringify(cleanData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'menu-structure.json';
  link.click();
  URL.revokeObjectURL(url);

  showNotification('فایل JSON دانلود شد', 'success');
}

// ============================================
// Notifications
// ============================================

/**
 * Show notification message
 * @param {string} message - Message text
 * @param {string} type - Notification type (info, success, error)
 */
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existingNotif = document.querySelector('.notification');
  if (existingNotif) {
    existingNotif.remove();
  }

  // Create new notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// Public API
// ============================================

// Export functions to window for HTML onclick handlers
if (typeof window !== 'undefined') {
  window.menuBuilder = {
    deleteMenuItem,
    exportMenu,
    initMenuBuilder
  };
}

// Export for module usage
export default {
  initMenuBuilder,
  deleteMenuItem,
  exportMenu
};
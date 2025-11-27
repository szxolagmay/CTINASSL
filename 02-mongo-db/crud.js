// Simple client-side CRUD using localStorage (no backend)
// Functions: add, list, edit (prompt), delete, clear

const STORAGE_KEY = 'crud_items_v1';

function loadItems() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch (e) {
		return [];
	}
}

function saveItems(items) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderItems() {
	const items = loadItems();
	const tbody = document.getElementById('itemsBody');
	tbody.innerHTML = '';
	items.forEach((it, i) => {
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td>${i + 1}</td>
			<td>${escapeHtml(it.name)}</td>
			<td>${escapeHtml(String(it.qty))}</td>
			<td class="text-center">
				<button class="btn btn-sm btn-outline-secondary me-2" data-action="edit" data-id="${it.id}">Edit</button>
				<button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${it.id}">Delete</button>
			</td>
		`;
		tbody.appendChild(tr);
	});
}

function escapeHtml(s) {
	return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);
}

function addItem(name, qty) {
	const items = loadItems();
	items.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2,6), name, qty });
	saveItems(items);
	renderItems();
}

function deleteItem(id) {
	let items = loadItems();
	items = items.filter(i => i.id !== id);
	saveItems(items);
	renderItems();
}

function editItem(id) {
  const items = loadItems();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return;
  const current = items[idx];
  
  // Populate modal fields
  document.getElementById('editItemId').value = id;
  document.getElementById('editItemName').value = current.name;
  document.getElementById('editItemQty').value = current.qty;
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('editModal'));
  modal.show();
}document.addEventListener('DOMContentLoaded', () => {
	// initial render
	renderItems();

	// add form
	const form = document.getElementById('addForm');
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const nameEl = document.getElementById('itemName');
		const qtyEl = document.getElementById('itemQty');
		const name = nameEl.value.trim();
		const qty = parseInt(qtyEl.value, 10) || 0;
		if (!name) {
			alert('Please provide an item name.');
			return;
		}
		addItem(name, qty);
		nameEl.value = '';
		qtyEl.value = '';
		nameEl.focus();
	});

  // table actions (event delegation)
  const tbody = document.getElementById('itemsBody');
  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === 'delete') {
      document.getElementById('deleteItemId').value = id;
      const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
      modal.show();
    } else if (action === 'edit') {
      editItem(id);
    }
  });  // clear all
  const clearBtn = document.getElementById('clearAll');
  clearBtn.addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('clearAllModal'));
    modal.show();
  });

  // confirm delete from modal
  const confirmDeleteBtn = document.getElementById('confirmDelete');
  confirmDeleteBtn.addEventListener('click', () => {
    const id = document.getElementById('deleteItemId').value;
    deleteItem(id);
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    modal.hide();
  });

  // confirm clear all from modal
  const confirmClearAllBtn = document.getElementById('confirmClearAll');
  confirmClearAllBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    renderItems();
    const modal = bootstrap.Modal.getInstance(document.getElementById('clearAllModal'));
    modal.hide();
  });

  // save edit from modal
  const saveEditBtn = document.getElementById('saveEdit');
  saveEditBtn.addEventListener('click', () => {
    const id = document.getElementById('editItemId').value;
    const newName = document.getElementById('editItemName').value.trim();
    const newQty = parseInt(document.getElementById('editItemQty').value, 10);
    
    if (!newName) {
      alert('Please provide an item name.');
      return;
    }
    
    const items = loadItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx].name = newName;
      items[idx].qty = Number.isNaN(newQty) ? 0 : newQty;
      saveItems(items);
      renderItems();
    }
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
    modal.hide();
  });
});
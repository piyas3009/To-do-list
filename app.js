  // --- Storage helpers ---
    const STORAGE_KEY = 'todo.tasks.v1';
    const load = () => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
      catch { return []; }
    };
    const save = (tasks) => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

    // --- State ---
    let tasks = load();
    let filter = 'all'; // 'all' | 'active' | 'completed'

    // --- Elements ---
    const listEl = document.getElementById('list');
    const inputEl = document.getElementById('taskInput');
    const formEl = document.getElementById('newTaskForm');
    const countEl = document.getElementById('count');
    const emptyEl = document.getElementById('emptyState');
    const todayEl = document.getElementById('today');
      // --- Utilities ---
    const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

    const formatDate = (d = new Date()) => d.toLocaleString(undefined, {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });

    function setFilter(next) {
      filter = next;
      document.querySelectorAll('.chip').forEach(btn => {
        btn.setAttribute('aria-pressed', btn.dataset.filter === filter);
      });
      render();
    }

    function filteredTasks() {
      if (filter === 'active') return tasks.filter(t => !t.completed);
      if (filter === 'completed') return tasks.filter(t => t.completed);
      return tasks;
    }
  function updateCount() {
      const active = tasks.filter(t => !t.completed).length;
      const total = tasks.length;
      countEl.textContent = `${active} active / ${total} total`;
    }

    function ensureEmptyState() {
      const hasAny = tasks.length > 0;
      emptyEl.hidden = hasAny;
    }

    function createItemEl(task) {
      const li = document.createElement('li');
      li.className = 'item' + (task.completed ? ' completed' : '');
      li.dataset.id = task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'checkbox';
      checkbox.checked = !!task.completed;
      checkbox.ariaLabel = 'Mark task completed';
      checkbox.addEventListener('change', () => toggleTask(task.id));

      const label = document.createElement('div');
      label.className = 'label';
      label.contentEditable = 'true';
      label.spellcheck = false;
      label.textContent = task.text;
      label.addEventListener('blur', () => editTask(task.id, label.textContent.trim()));
      label.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); label.blur(); }
      });
 const del = document.createElement('button');
      del.className = 'del-btn';
      del.innerHTML = '✕';
      del.title = 'Delete task';
      del.addEventListener('click', () => deleteTask(task.id));

      li.append(checkbox, label, del);
      return li;
    }

    function render() {
      listEl.innerHTML = '';
      filteredTasks().forEach(t => listEl.appendChild(createItemEl(t)));
      updateCount();
      ensureEmptyState();
    }

    function addTask(text) {
      const trimmed = text.trim();
      if (!trimmed) return;
      tasks.unshift({ id: uid(), text: trimmed, completed: false, createdAt: Date.now() });
      save(tasks);
      inputEl.value = '';
      render();
    }
     function toggleTask(id) {
      const t = tasks.find(x => x.id === id);
      if (!t) return;
      t.completed = !t.completed;
      save(tasks);
      render();
    }

    function deleteTask(id) {
      tasks = tasks.filter(t => t.id !== id);
      save(tasks);
      render();
    }

    function editTask(id, nextText) {
      const t = tasks.find(x => x.id === id);
      if (!t) return;
      if (!nextText) { deleteTask(id); return; }
      t.text = nextText;
      save(tasks);
      render();
    }

    function clearCompleted() {
      tasks = tasks.filter(t => !t.completed);
      save(tasks);
      render();
    }

    function clearAll() {
      if (!confirm('Clear all tasks?')) return;
      tasks = [];
      save(tasks);
      render();
    }

    function exportJSON() {
      const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'tasks.json'; a.click();
      URL.revokeObjectURL(url);
    }

    // --- Event wiring ---
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      addTask(inputEl.value);
    });

    document.querySelectorAll('.chip').forEach(btn =>
      btn.addEventListener('click', () => setFilter(btn.dataset.filter))
    );

    document.getElementById('clearCompleted').addEventListener('click', clearCompleted);
    document.getElementById('clearAll').addEventListener('click', clearAll);
    document.getElementById('exportJSON').addEventListener('click', exportJSON);

    // --- Init ---
    todayEl.textContent = formatDate();
    render();


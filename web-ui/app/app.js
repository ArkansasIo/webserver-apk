const menuButtons = [...document.querySelectorAll('.menu-btn')];
const sections = [...document.querySelectorAll('.section')];

const defaults = {
  tsBase: 'http://localhost:3000',
  phpBase: 'http://localhost:8080',
  apiSource: 'ts',
  prettyJson: true
};

const state = {
  ...defaults,
  ...JSON.parse(localStorage.getItem('uiSettings') || '{}')
};

const els = {
  tsBase: document.getElementById('tsBase'),
  phpBase: document.getElementById('phpBase'),
  prettyJson: document.getElementById('prettyJson'),
  settingsOutput: document.getElementById('settingsOutput'),
  healthOutput: document.getElementById('healthOutput'),
  usersOutput: document.getElementById('usersOutput'),
  createUserOutput: document.getElementById('createUserOutput'),
  loginOutput: document.getElementById('loginOutput')
};

function setActiveSection(sectionId) {
  menuButtons.forEach((button) => button.classList.toggle('active', button.dataset.section === sectionId));
  sections.forEach((section) => section.classList.toggle('active', section.id === sectionId));
}

function saveSettings() {
  localStorage.setItem('uiSettings', JSON.stringify(state));
}

function getBaseUrl() {
  return state.apiSource === 'php' ? state.phpBase : state.tsBase;
}

function formatOutput(data) {
  if (!state.prettyJson) {
    return String(typeof data === 'string' ? data : JSON.stringify(data));
  }
  return JSON.stringify(data, null, 2);
}

async function fetchApi(path, options = {}) {
  const url = `${getBaseUrl()}${path}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const body = await response.json().catch(() => ({ message: 'invalid json response' }));
  return { status: response.status, body };
}

function initControls() {
  els.tsBase.value = state.tsBase;
  els.phpBase.value = state.phpBase;
  els.prettyJson.checked = state.prettyJson;

  const selected = document.querySelector(`input[name="apiSource"][value="${state.apiSource}"]`);
  if (selected) {
    selected.checked = true;
  }

  menuButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveSection(button.dataset.section));
  });

  document.querySelectorAll('input[name="apiSource"]').forEach((radio) => {
    radio.addEventListener('change', (event) => {
      state.apiSource = event.target.value;
      saveSettings();
    });
  });

  els.prettyJson.addEventListener('change', (event) => {
    state.prettyJson = event.target.checked;
    saveSettings();
  });

  document.getElementById('settingsForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.tsBase = els.tsBase.value.trim();
    state.phpBase = els.phpBase.value.trim();
    saveSettings();
    els.settingsOutput.textContent = formatOutput({ message: 'settings saved', state });
  });

  document.getElementById('checkTsHealth').addEventListener('click', async () => {
    const oldSource = state.apiSource;
    state.apiSource = 'ts';
    try {
      const result = await fetchApi('/health');
      els.healthOutput.textContent = formatOutput(result);
    } catch (error) {
      els.healthOutput.textContent = formatOutput({ error: String(error) });
    } finally {
      state.apiSource = oldSource;
    }
  });

  document.getElementById('checkPhpHealth').addEventListener('click', async () => {
    const oldSource = state.apiSource;
    state.apiSource = 'php';
    try {
      const result = await fetchApi('/health');
      els.healthOutput.textContent = formatOutput(result);
    } catch (error) {
      els.healthOutput.textContent = formatOutput({ error: String(error) });
    } finally {
      state.apiSource = oldSource;
    }
  });

  document.getElementById('loadUsers').addEventListener('click', async () => {
    try {
      const result = await fetchApi('/users');
      els.usersOutput.textContent = formatOutput(result);
    } catch (error) {
      els.usersOutput.textContent = formatOutput({ error: String(error) });
    }
  });

  document.getElementById('createUserForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const payload = {
      email: form.get('email'),
      name: form.get('name'),
      password: form.get('password')
    };
    try {
      const result = await fetchApi('/users', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      els.createUserOutput.textContent = formatOutput(result);
    } catch (error) {
      els.createUserOutput.textContent = formatOutput({ error: String(error) });
    }
  });

  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const payload = {
      email: form.get('email'),
      password: form.get('password')
    };
    try {
      const result = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      els.loginOutput.textContent = formatOutput(result);
    } catch (error) {
      els.loginOutput.textContent = formatOutput({ error: String(error) });
    }
  });
}

initControls();

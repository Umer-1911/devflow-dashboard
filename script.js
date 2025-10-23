// ==================== Student Dev Hub: script.js ====================
// Full interactivity for Dashboard, Tasks, Chat, Projects, Workspaces
// ====================================================================

// ---------- Local Data Setup ----------
let messages = JSON.parse(localStorage.getItem("sdh_msgs") || "[]");
let tasks = JSON.parse(
    localStorage.getItem("sdh_tasks") ||
    JSON.stringify([
        { id: 1, title: "Setup repo", status: "todo" },
        { id: 2, title: "Design homepage", status: "inprogress" },
        { id: 3, title: "Prepare presentation", status: "done" },
    ])
);
let projects = JSON.parse(localStorage.getItem("sdh_projects") || "[]");
let workspaces = JSON.parse(localStorage.getItem("sdh_workspaces") || "[]");

// ---------- Feed Utility ----------
function pushFeed(msg) {
    const feed = document.getElementById("activityFeed");
    if (!feed) return;
    const div = document.createElement("div");
    div.textContent = msg;
    div.className = "feed-item";
    feed.prepend(div);
}

// ---------- Tab Navigation ----------
document.querySelectorAll(".nav button").forEach((btn) => {
    btn.addEventListener("click", () => {
        document
            .querySelectorAll(".nav button")
            .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const tab = btn.dataset.tab;
        document
            .querySelectorAll("#mainPanel > .card")
            .forEach((c) => (c.style.display = "none"));
        document.getElementById(tab).style.display = "block";
    });
});

// ---------- Chat System ----------
function renderMessages() {
    const chatBox = document.getElementById("messages");
    if (!chatBox) return;
    chatBox.innerHTML = "";
    messages.forEach((m) => {
        const msg = document.createElement("div");
        msg.textContent = `${m.from}: ${m.text}`;
        msg.className = "chat-msg";
        chatBox.appendChild(msg);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendChat() {
    const input = document.getElementById("chatInput");
    if (!input) return;
    const txt = input.value.trim();
    if (!txt) return;
    messages.push({ from: "Me", text: txt });
    localStorage.setItem("sdh_msgs", JSON.stringify(messages));
    input.value = "";
    renderMessages();
    pushFeed("Sent a message in team chat");
}

document.getElementById("sendMsg")?.addEventListener("click", sendChat);
document
    .getElementById("chatInput")
    ?.addEventListener("keypress", (e) => e.key === "Enter" && sendChat());

document.getElementById("toggleChat")?.addEventListener("click", () => {
    const shell = document.querySelector(".chat-shell");
    if (!shell) return;
    if (shell.style.height === "60px" || !shell.style.height) {
        shell.style.height = "560px";
        document.getElementById("toggleChat").textContent = "Collapse";
    } else {
        shell.style.height = "60px";
        document.getElementById("toggleChat").textContent = "Expand";
    }
});

// ---------- Meetings (Simulation) ----------
document.getElementById("startCall")?.addEventListener("click", () => {
    showModal(`
    <h3>Start Meeting</h3>
    <p style="color:var(--muted)">
      This demo opens a simulated meeting window.<br>
      In production, integrate with Jitsi / Zoom / Meet SDK.
    </p>
    <div style="text-align:right;margin-top:12px">
      <button class="btn" id="joinCallBtn">Join</button>
    </div>
  `);

    setTimeout(() => {
        document.getElementById("joinCallBtn")?.addEventListener("click", () => {
            closeModal();
            alert("Joining meeting (demo) – integrate SDK here");
            pushFeed("Started a meeting");
        });
    }, 100);
});

document
    .getElementById("quickJoinCall")
    ?.addEventListener("click", () =>
        document.getElementById("startCall")?.click()
    );

// ---------- Tasks (Kanban System) ----------
function renderTasks() {
    const todo = document.getElementById("todoList");
    const inprog = document.getElementById("inprogressList");
    const done = document.getElementById("doneList");
    if (!todo || !inprog || !done) return;
    todo.innerHTML = inprog.innerHTML = done.innerHTML = "";

    tasks.forEach((t) => {
        const el = document.createElement("div");
        el.className = "task";
        el.draggable = true;
        el.dataset.id = t.id;
        el.textContent = t.title;
        el.addEventListener("dragstart", onDragStart);
        if (t.status === "todo") todo.appendChild(el);
        if (t.status === "inprogress") inprog.appendChild(el);
        if (t.status === "done") done.appendChild(el);
    });
}

function onDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.id);
}

document.querySelectorAll(".lane").forEach((lane) => {
    lane.addEventListener("dragover", (e) => e.preventDefault());
    lane.addEventListener("drop", (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        const status = lane.dataset.status;
        tasks = tasks.map((t) => (t.id == id ? { ...t, status } : t));
        localStorage.setItem("sdh_tasks", JSON.stringify(tasks));
        renderTasks();
        pushFeed("Updated a task’s status");
    });
});

document.getElementById("addTaskBtn")?.addEventListener("click", () => {
    const title = document.getElementById("newTaskTitle")?.value.trim();
    if (!title) return;
    const id = Math.random().toString(36).slice(2, 9);
    tasks.push({ id, title, status: "todo" });
    localStorage.setItem("sdh_tasks", JSON.stringify(tasks));
    renderTasks();
    document.getElementById("newTaskTitle").value = "";
    pushFeed("Created a new task: " + title);
});

// ---------- Projects ----------
function renderProjects() {
    const list = document.getElementById("projectsList");
    const recent = document.getElementById("recentProjects");
    if (!list || !recent) return;
    list.innerHTML = recent.innerHTML = "";
    projects.forEach((p) => {
        const item = document.createElement("div");
        item.className = "proj";
        item.innerHTML = `
      <strong>${p.title}</strong>
      <button class="btn ghost">Open</button>
    `;
        list.appendChild(item);
        recent.appendChild(item.cloneNode(true));
    });
}

document.getElementById("uploadProject")?.addEventListener("click", () => {
    const title = document.getElementById("projTitle")?.value.trim();
    if (!title) return alert("Please enter a project title.");
    const id = Math.random().toString(36).slice(2, 9);
    projects.push({ id, title });
    localStorage.setItem("sdh_projects", JSON.stringify(projects));
    renderProjects();
    document.getElementById("projTitle").value = "";
    document.getElementById("projFiles").value = "";
    pushFeed("Uploaded a new project: " + title);
});

document.getElementById("clearProject")?.addEventListener("click", () => {
    document.getElementById("projTitle").value = "";
    document.getElementById("projFiles").value = "";
});

// ---------- Workspace Creation ----------
document.getElementById('openCreateWs')?.addEventListener('click', openWorkspaceModal);
document.getElementById('newWorkspaceBtn')?.addEventListener('click', openWorkspaceModal);

function openWorkspaceModal() {
    showModal(`
    <h3>Create New Workspace</h3>
    <label style="display:block;margin-top:8px">Workspace Name</label>
    <input id="wsName" placeholder="Enter workspace name" style="width:100%;padding:6px;margin-top:4px;border-radius:6px;border:none;outline:none;background:#334155;color:white"/>
    <div style="text-align:right;margin-top:12px">
      <button class="btn" id="saveWs">Create</button>
    </div>
  `);

    setTimeout(() => {
        document.getElementById('saveWs')?.addEventListener('click', () => {
            const wsName = document.getElementById('wsName').value.trim();
            if (!wsName) return;
            const wsList = document.getElementById('workspaces');
            const div = document.createElement('div');
            div.textContent = wsName;
            div.className = 'workspace-item';
            wsList.appendChild(div);
            pushFeed('Created a new workspace: ' + wsName);
            closeModal();
        });
    }, 100);
}


// ---------- Modal Utility ----------
function showModal(html) {
    const backdrop = document.getElementById('modalBackdrop');
    const content = document.getElementById('modalContent');
    content.innerHTML = html;
    backdrop.classList.add('active');
}

function closeModal() {
    document.getElementById('modalBackdrop').classList.remove('active');
}

document.getElementById("modalBackdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "modalBackdrop") closeModal();
});

// ---------- Quick Buttons ----------
document.getElementById("quickNewProject")?.addEventListener("click", () => {
    document.querySelector('[data-tab="projects"]')?.click();
    document.getElementById("projTitle")?.focus();
});
document.getElementById("quickNewTask")?.addEventListener("click", () => {
    document.querySelector('[data-tab="tasks"]')?.click();
    document.getElementById("newTaskTitle")?.focus();
});
document.getElementById("openChat")?.addEventListener("click", () =>
    document.querySelector('[data-tab="chat"]')?.click()
);
document.getElementById("viewTasks")?.addEventListener("click", () =>
    document.querySelector('[data-tab="tasks"]')?.click()
);
document.getElementById("openProjects")?.addEventListener("click", () =>
    document.querySelector('[data-tab="projects"]')?.click()
);

// ---------- Project Open Simulation ----------
document.addEventListener("click", (e) => {
    if (e.target.matches(".proj button")) {
        alert("Open project (demo)");
        pushFeed("Viewed project details");
    }
});

// ---------- Initial Load ----------
window.addEventListener("DOMContentLoaded", () => {
    renderTasks();
    renderMessages();
    renderProjects();
    renderWorkspaces();
    document.querySelector('[data-tab="dashboard"]')?.click();
});

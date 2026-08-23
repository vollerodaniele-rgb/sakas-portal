/* SAKAS Portal Admin
   ------------------------------------------------------------
   Loads data/plan.json into editable forms and publishes changes
   back to GitHub with the Contents API. The access token is a
   fine-grained GitHub token (Contents: read and write, this repo
   only) and lives in this browser's localStorage, nowhere else.
   ------------------------------------------------------------ */
const OWNER = "vollerodaniele-rgb";
const REPO = "sakas-portal";
const FILE = "data/plan.json";
const TOKEN_KEY = "sakas-admin-token";

let plan = null;

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", async () => {
  wireTokenPanel();
  try {
    const res = await fetch(FILE + "?t=" + Math.random(), { cache: "no-store" });
    plan = await res.json();
    render();
  } catch (err) {
    $("app").innerHTML = `<p class="muted">Could not load ${FILE}: ${err}</p>`;
  }
  $("save-btn").addEventListener("click", save);
});

/* ============ TOKEN ============ */

function wireTokenPanel() {
  const msg = $("token-msg");
  if (localStorage.getItem(TOKEN_KEY)) {
    msg.textContent = "A key is saved in this browser.";
  }
  $("token-save").addEventListener("click", () => {
    const v = $("token-input").value.trim();
    if (!v) { msg.textContent = "Paste the token first."; return; }
    localStorage.setItem(TOKEN_KEY, v);
    $("token-input").value = "";
    msg.textContent = "Key saved in this browser.";
  });
  $("token-clear").addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    msg.textContent = "Key removed from this browser.";
  });
}

/* ============ FORM BUILDING ============ */

function render() {
  const app = $("app");
  app.innerHTML = "";

  app.appendChild(panel("Intro texts", (body) => {
    body.appendChild(textField("Tagline (under the big SAKAS title)", plan, "tagline", true));
    body.appendChild(textField("Deal intro line", plan, "dealNotes", true));
  }));

  app.appendChild(listPanel("Deal tiles", plan.deal, () => ({ num: "", label: "" }), (item, body) => {
    body.appendChild(row(
      textField("Number (e.g. 12 or 1 week)", item, "num"),
      textField("Label", item, "label")
    ));
  }));

  app.appendChild(panel("Next shoot", (body) => {
    body.appendChild(row(
      textField("Date (YYYY-MM-DD)", plan.nextShoot, "date"),
      textField("Time", plan.nextShoot, "time")
    ));
    body.appendChild(row(
      textField("Location", plan.nextShoot, "location"),
      textField("Focus (one line)", plan.nextShoot, "focus")
    ));
    body.appendChild(linesField("Checklist for the client (one per line)", plan.nextShoot, "checklist"));
  }));

  app.appendChild(panel("What we film this month", (body) => {
    body.appendChild(textField("Month title (e.g. September 2026)", plan.filmPlan, "month"));
    body.appendChild(sublist(plan.filmPlan.items, () => ({ what: "", note: "" }), (item, wrap) => {
      wrap.appendChild(row(
        textField("What", item, "what"),
        textField("Note", item, "note")
      ));
    }, "Add shot"));
  }));

  app.appendChild(listPanel("Months", plan.months, () => ({
    label: "", status: "planned",
    reels: { done: 0, total: 12 }, photos: { done: 0, total: 20 }, notes: ""
  }), (m, body) => {
    body.appendChild(row(
      textField("Month label", m, "label"),
      selectField("Status", m, "status", ["planned", "active", "done"])
    ));
    body.appendChild(row(
      numField("Reels done", m.reels, "done"),
      numField("Reels total", m.reels, "total"),
      numField("Photos done", m.photos, "done"),
      numField("Photos total", m.photos, "total")
    ));
    body.appendChild(textField("Notes", m, "notes", true));
  }));

  app.appendChild(listPanel("Documents & deliveries", plan.documents, () => ({
    type: "Delivery", title: "", note: "", url: ""
  }), (doc, body) => {
    body.appendChild(row(
      textField("Type (Contract / Brief / Delivery)", doc, "type"),
      textField("Title", doc, "title")
    ));
    body.appendChild(row(
      textField("Note", doc, "note"),
      textField("Link (WeTransfer, Drive...)", doc, "url")
    ));
  }));

  app.appendChild(listPanel("Invoices", plan.invoices, () => ({
    number: "", period: "", issued: "", status: "upcoming", url: ""
  }), (inv, body) => {
    body.appendChild(row(
      textField("Invoice number", inv, "number"),
      textField("Period", inv, "period")
    ));
    body.appendChild(row(
      textField("Issued (YYYY-MM-DD)", inv, "issued"),
      selectField("Status", inv, "status", ["upcoming", "open", "paid"]),
      textField("Link to PDF (optional)", inv, "url")
    ));
  }));

  app.appendChild(panel("Contact footer", (body) => {
    body.appendChild(row(
      textField("Footer line", plan.contact, "line"),
      textField("Email", plan.contact, "email")
    ));
  }));
}

function panel(title, fill) {
  const div = document.createElement("div");
  div.className = "panel";
  div.innerHTML = `<h2>${title}</h2>`;
  fill(div);
  return div;
}

function listPanel(title, arr, blank, fillItem) {
  return panel(title, (body) => {
    body.appendChild(sublist(arr, blank, fillItem, "Add"));
  });
}

function sublist(arr, blank, fillItem, addLabel) {
  const wrap = document.createElement("div");
  const draw = () => {
    wrap.innerHTML = "";
    arr.forEach((item, i) => {
      const box = document.createElement("div");
      box.className = "item";
      const rm = document.createElement("button");
      rm.className = "btn-mini danger remove";
      rm.textContent = "Remove";
      rm.addEventListener("click", () => { arr.splice(i, 1); draw(); });
      box.appendChild(rm);
      fillItem(item, box);
      wrap.appendChild(box);
    });
    const add = document.createElement("button");
    add.className = "btn-mini";
    add.textContent = "+ " + addLabel;
    add.addEventListener("click", () => { arr.push(blank()); draw(); });
    wrap.appendChild(add);
  };
  draw();
  return wrap;
}

function row(...fields) {
  const div = document.createElement("div");
  div.className = "row";
  for (const f of fields) div.appendChild(f);
  return div;
}

function textField(label, obj, key, multiline) {
  const lab = document.createElement("label");
  lab.className = "field";
  const span = document.createElement("span");
  span.textContent = label;
  const input = document.createElement(multiline ? "textarea" : "input");
  input.value = obj[key] == null ? "" : obj[key];
  input.addEventListener("input", () => { obj[key] = input.value; });
  lab.append(span, input);
  return lab;
}

function numField(label, obj, key) {
  const lab = textField(label, obj, key);
  const input = lab.querySelector("input");
  input.type = "number";
  input.min = "0";
  input.addEventListener("input", () => { obj[key] = Number(input.value) || 0; });
  return lab;
}

function selectField(label, obj, key, options) {
  const lab = document.createElement("label");
  lab.className = "field";
  const span = document.createElement("span");
  span.textContent = label;
  const sel = document.createElement("select");
  for (const o of options) {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    if (obj[key] === o) opt.selected = true;
    sel.appendChild(opt);
  }
  sel.addEventListener("change", () => { obj[key] = sel.value; });
  lab.append(span, sel);
  return lab;
}

function linesField(label, obj, key) {
  const lab = document.createElement("label");
  lab.className = "field";
  const span = document.createElement("span");
  span.textContent = label;
  const ta = document.createElement("textarea");
  ta.value = (obj[key] || []).join("\n");
  ta.addEventListener("input", () => {
    obj[key] = ta.value.split("\n").map((s) => s.trim()).filter(Boolean);
  });
  lab.append(span, ta);
  return lab;
}

/* ============ SAVE ============ */

async function save() {
  const msg = $("save-msg");
  const btn = $("save-btn");
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    msg.textContent = "Save your access key first (top of the page).";
    return;
  }

  btn.disabled = true;
  msg.textContent = "Publishing...";

  try {
    const api = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;
    const headers = {
      "Authorization": "Bearer " + token,
      "Accept": "application/vnd.github+json"
    };

    const cur = await fetch(api, { headers });
    if (!cur.ok) throw new Error("could not read current file (" + cur.status + ")");
    const { sha } = await cur.json();

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(plan, null, 2) + "\n")));
    const put = await fetch(api, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Update plan via admin", content, sha })
    });
    if (!put.ok) throw new Error("publish failed (" + put.status + ")");

    msg.textContent = "Published! The live site updates in about a minute.";
  } catch (err) {
    console.error("save failed:", err);
    msg.textContent = "Error: " + err.message + (String(err.message).includes("401") || String(err.message).includes("403")
      ? " (check the access key and its permissions)" : "");
  } finally {
    btn.disabled = false;
  }
}

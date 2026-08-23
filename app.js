/* SAKAS Content Portal
   ------------------------------------------------------------
   Everything on this page comes from data/plan.json.
   Edit that one file to update the portal.
   ------------------------------------------------------------ */
const CONFIG = {
  owner: "vollerodaniele-rgb",
  repo: "sakas-portal"
};

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", loadPlan);

async function loadPlan() {
  let data;
  try {
    const res = await fetch("data/plan.json", { cache: "no-store" });
    data = await res.json();
  } catch (err) {
    $("tagline").textContent = "Could not load the plan data.";
    console.error("plan load failed:", err);
    return;
  }

  $("tagline").textContent = data.tagline || "";
  $("deal-notes").textContent = data.dealNotes || "";

  renderDeal(data.deal || []);
  renderShoot(data.nextShoot);
  renderMonths(data.months || []);
  renderDocs(data.documents || []);
  renderInvoices(data.invoices || []);
  renderFooter(data.contact);

  if (CONFIG.owner && CONFIG.repo) {
    const edit = $("edit-plan");
    edit.href = `https://github.com/${CONFIG.owner}/${CONFIG.repo}/edit/main/data/plan.json`;
    edit.hidden = false;
  }
}

function renderDeal(tiles) {
  const wrap = $("deal-tiles");
  wrap.innerHTML = "";
  for (const t of tiles) {
    const el = document.createElement("div");
    el.className = "tile";
    el.innerHTML = `<div class="num">${esc(t.num)}</div><div class="lbl">${esc(t.label)}</div>`;
    wrap.appendChild(el);
  }
}

function renderShoot(shoot) {
  const card = $("shoot-card");
  if (!shoot || !shoot.date) {
    card.innerHTML = `<p class="muted">Next shoot date to be planned. Watch this space.</p>`;
    return;
  }

  const d = new Date(shoot.date + "T00:00:00");
  const dateStr = d.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
  const days = Math.ceil((d - new Date()) / 86400000);
  const countdown =
    days > 1 ? `<div class="num">${days}</div><div class="lbl">days to go</div>` :
    days === 1 ? `<div class="num">1</div><div class="lbl">day to go</div>` :
    days === 0 ? `<div class="num">🎬</div><div class="lbl">today</div>` :
    `<div class="num">✓</div><div class="lbl">wrapped</div>`;

  card.innerHTML = `
    <div>
      <div class="shoot-date">${esc(dateStr)}${shoot.time ? " · " + esc(shoot.time) : ""}</div>
      <div class="shoot-meta">${esc(shoot.location || "")}</div>
      ${shoot.focus ? `<div class="shoot-meta">${esc(shoot.focus)}</div>` : ""}
    </div>
    <div class="shoot-count">${countdown}</div>
    ${(shoot.checklist && shoot.checklist.length)
      ? `<div class="shoot-checklist">${shoot.checklist.map((c) => `<span>${esc(c)}</span>`).join("")}</div>`
      : ""}
  `;
}

function renderMonths(months) {
  const wrap = $("month-list");
  wrap.innerHTML = "";
  for (const m of months) {
    const badgeClass =
      m.status === "done" ? "done" :
      m.status === "active" ? "active" : "";
    const badgeText =
      m.status === "done" ? "Delivered" :
      m.status === "active" ? "In progress" : "Planned";

    const card = document.createElement("div");
    card.className = "month-card";
    card.innerHTML = `
      <div class="month-top">
        <span class="month-title">${esc(m.label)}</span>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>
      ${bar("Reels", m.reels)}
      ${bar("Photos", m.photos)}
      ${m.notes ? `<p class="month-notes">${esc(m.notes)}</p>` : ""}
    `;
    wrap.appendChild(card);
  }
}

function bar(label, v) {
  if (!v || !v.total) return "";
  const pct = Math.min(100, Math.round((v.done / v.total) * 100));
  return `
    <div class="progress-row">
      <span class="plabel">${esc(label)}</span>
      <span class="bar"><i style="width:${pct}%"></i></span>
      <span class="pcount">${v.done} / ${v.total}</span>
    </div>
  `;
}

function renderDocs(docs) {
  const wrap = $("doc-grid");
  wrap.innerHTML = "";
  for (const doc of docs) {
    const a = document.createElement("a");
    a.className = "doc-card" + (doc.url ? "" : " pending");
    if (doc.url) {
      a.href = doc.url;
      a.target = "_blank";
      a.rel = "noopener";
    }
    a.innerHTML = `
      <div class="doc-type">${esc(doc.type || "File")}</div>
      <div class="doc-title">${esc(doc.title)}</div>
      <div class="doc-note">${esc(doc.note || "")}${doc.url ? "" : " · link coming soon"}</div>
    `;
    wrap.appendChild(a);
  }
}

function renderInvoices(invoices) {
  const tbody = $("invoice-rows");
  tbody.innerHTML = "";
  if (!invoices.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="muted">No invoices yet.</td></tr>`;
    return;
  }
  for (const inv of invoices) {
    const cls = ["paid", "open", "upcoming"].includes(inv.status) ? inv.status : "upcoming";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${esc(inv.number)}</td>
      <td>${esc(inv.period)}</td>
      <td>${esc(inv.issued || "")}</td>
      <td><span class="pill ${cls}">${esc(inv.status)}</span></td>
      <td>${inv.url ? `<a href="${esc(inv.url)}" target="_blank" rel="noopener">View</a>` : ""}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderFooter(contact) {
  if (!contact) return;
  $("contact-line").textContent = contact.line || "SAKAS x STUDIO";
  if (contact.email) {
    const p = document.querySelector(".footer .muted");
    p.innerHTML = `Questions about planning or content? <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>`;
  }
}

function esc(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

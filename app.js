/* USC GPA Calculator with Grade Forgiveness
   University Advising Center, USC Columbia
*/

const gradePoints = {
  "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0.0, "WF": 0.0, "FN": 0.0
};
const validForgiveFirst = new Set(["D+","D","F","WF"]); // per Registrar policy

// Build initial rows
const tbody = document.getElementById("coursesBody");
const addRowBtn = document.getElementById("addRowBtn");
const resetRowsBtn = document.getElementById("resetRowsBtn");

function gradeSelectHTML(id){
  // Build a select element with allowed GPA grades
  const grades = Object.keys(gradePoints);
  return `<select id="${id}" class="grade-select">${grades.map(g=>`<option value="${g}">${g}</option>`).join("")}</select>`;
}

function addRow(i){
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${i+1}</td>
    <td><input type="text" id="c${i}_name" placeholder="e.g., MATH 122"></td>
    <td><input type="number" id="c${i}_hrs" min="0" step="0.1" placeholder="3"></td>
    <td>${gradeSelectHTML(`c${i}_grade`)}</td>
    <td><span id="c${i}_qp">—</span></td>
  `;
  tbody.appendChild(tr);
}

for(let i=0;i<5;i++) addRow(i);

addRowBtn.addEventListener("click", ()=>{
  addRow(tbody.children.length);
});
resetRowsBtn.addEventListener("click", ()=>{
  tbody.innerHTML="";
  for(let i=0;i<5;i++) addRow(i);
  recalcAll();
});

// Populate grade selects in GF cards
document.querySelectorAll(".grade-select").forEach(sel=>{}); // placeholder
function populateGFSelects(){
  const gradeOptions = Object.keys(gradePoints).map(g=>`<option value="${g}">${g}</option>`).join("");
  ["gf1OrigGrade","gf1NewGrade","gf2OrigGrade","gf2NewGrade"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.innerHTML = gradeOptions;
  });
}
populateGFSelects();

// Inputs
const currentHoursEl = document.getElementById("currentHours");
const currentQPEl = document.getElementById("currentQP");
const currentGPAEl = document.getElementById("currentGPA");

const semHoursEl = document.getElementById("semHours");
const semGPAEl = document.getElementById("semGPA");

const projNoGFEl = document.getElementById("projNoGF");
const projWithGFEl = document.getElementById("projWithGF");
const gfAlertEl = document.getElementById("gfAlert");

// GF inputs
const gf = {
  one: {
    hrs: document.getElementById("gf1Hours"),
    g1: document.getElementById("gf1OrigGrade"),
    g2: document.getElementById("gf1NewGrade"),
    inSem: document.getElementById("gf1InSemester"),
  },
  two: {
    hrs: document.getElementById("gf2Hours"),
    g1: document.getElementById("gf2OrigGrade"),
    g2: document.getElementById("gf2NewGrade"),
    inSem: document.getElementById("gf2InSemester"),
  }
};

function toNum(v){ const n = Number(v); return isFinite(n)? n : 0; }

function calcCurrentGPA(){
  const h = toNum(currentHoursEl.value);
  const qp = toNum(currentQPEl.value);
  if(h > 0 && qp >= 0){
    currentGPAEl.textContent = (qp / h).toFixed(3);
  }else{
    currentGPAEl.textContent = "—";
  }
}

function calcSemesterTotals(){
  let h = 0;
  let qp = 0;
  for(let i=0;i<tbody.children.length;i++){
    const hrs = toNum(document.getElementById(`c${i}_hrs`)?.value);
    const grade = document.getElementById(`c${i}_grade`)?.value;
    const cell = document.getElementById(`c${i}_qp`);
    if(hrs > 0 && grade && grade in gradePoints){
      const q = hrs * gradePoints[grade];
      h += hrs; qp += q;
      if(cell) cell.textContent = q.toFixed(3);
    }else{
      if(cell) cell.textContent = "—";
    }
  }
  semHoursEl.textContent = h.toFixed(1);
  semGPAEl.textContent = (h>0)? (qp/h).toFixed(3) : "—";
  return {h, qp};
}

function projectedNoForgiveness(){
  const baseH = toNum(currentHoursEl.value);
  const baseQP = toNum(currentQPEl.value);
  const sem = calcSemesterTotals();
  const H = baseH + sem.h;
  const QP = baseQP + sem.qp;
  if(H > 0){
    projNoGFEl.textContent = (QP/H).toFixed(3);
  } else {
    projNoGFEl.textContent = "—";
  }
  return {H, QP};
}

function withinPolicyAndMessages(){
  // Validate policy caps and eligible grades
  let messages = [];
  const gfHours = toNum(gf.one.hrs.value) + toNum(gf.two.hrs.value);
  if(gfHours > 8){
    messages.push("Grade forgiveness is limited to 8 credits total.");
  }
  // eligible first attempt grades
  ["one","two"].forEach(k=>{
    const g1 = gf[k].g1.value;
    const hrs = toNum(gf[k].hrs.value);
    if(hrs>0 && g1 && !validForgiveFirst.has(g1)){
      messages.push(`GF ${k === "one" ? "1" : "2"}: first attempt grade must be D+, D, F, or WF.`);
    }
  });
  // show or hide alert
  if(messages.length){
    gfAlertEl.style.display = "block";
    gfAlertEl.textContent = messages.join(" ");
  }else{
    gfAlertEl.style.display = "none";
    gfAlertEl.textContent = "";
  }
  return {ok: messages.length===0, messages};
}

function projectedWithForgiveness(){
  const base = projectedNoForgiveness(); // ensures semester recalc
  let H = base.H;
  let QP = base.QP;

  // For each GF slot:
  ["one","two"].forEach(k=>{
    const hrs = toNum(gf[k].hrs.value);
    const g1 = gf[k].g1.value;
    const g2 = gf[k].g2.value;
    const inSemester = gf[k].inSem.checked;

    if(hrs > 0 && g1 in gradePoints && g2 in gradePoints){
      const origQP = hrs * gradePoints[g1];
      const newQP = hrs * gradePoints[g2];

      // Policy: remove original attempt GPA hours and QP.
      // If the repeat is already included in this term's list, then semester totals already added new hours+QP.
      // Denominator H stays the same in that case, so only subtract original QP.
      // If the repeat is NOT included in this term's list (e.g., it is already posted), then base includes both attempts.
      // Remove original HOURS and original QP from totals.
      if(inSemester){
        QP = QP - origQP + newQP; // add explicit newQP so the GF card can be used even if user did not add the repeat in the table
        // no H change (semester hours likely already include the repeat)
      }else{
        QP = QP - origQP; // keep new attempt QP as already in base or not part of this term
        H = H - hrs;      // remove original hours
        // If the second attempt is posted in base, do nothing else. If not yet posted anywhere, user should include it above.
      }
    }
  });

  // Cap: 8 credits and at most two courses. We only warn above; keep computation regardless to preview impact.
  if(H > 0){
    projWithGFEl.textContent = (QP/H).toFixed(3);
  }else{
    projWithGFEl.textContent = "—";
  }
}

function recalcAll(){
  calcCurrentGPA();
  calcSemesterTotals();
  projectedNoForgiveness();
  withinPolicyAndMessages();
  projectedWithForgiveness();
}

// Attach listeners
document.addEventListener("input", (e)=>{
  if(e.target.matches("input, select")){
    recalcAll();
  }
});

// Initial calc
recalcAll();
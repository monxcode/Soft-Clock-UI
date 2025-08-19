function updateClock(){
  const now=new Date();
  const h=String(now.getHours()).padStart(2,'0');
  const m=String(now.getMinutes()).padStart(2,'0');
  const s=String(now.getSeconds()).padStart(2,'0');
  document.getElementById("clock").innerHTML=`<span>${h}</span><span>:</span><span>${m}</span><span>:</span><span>${s}</span>`;
  const day=now.toLocaleString('default',{weekday:'long'});
  const date=now.getDate();
  document.getElementById("dayInfo").textContent=`${day}, ${date}`;
}
setInterval(updateClock,1000);
updateClock();

const monthYear=document.getElementById("monthYear");
const calendarDays=document.getElementById("calendarDays");
const calendar=document.getElementById("calendarContainer");
const popupOverlay=document.getElementById("popupOverlay");
const popupDate=document.getElementById("popupDate");
const eventInput=document.getElementById("eventInput");
const popupButtons=document.querySelector(".popup-buttons");

const rollerOverlay=document.getElementById("rollerOverlay");
const rollDay=document.getElementById("rollDay");
const rollMonth=document.getElementById("rollMonth");
const rollYear=document.getElementById("rollYear");

const savedEvents=JSON.parse(localStorage.getItem("savedEvents")||"{}");
let currentDate=new Date();
let activeDateKey="";
let isEditing=false;

function renderCalendar(date){
  const year=date.getFullYear();
  const month=date.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const lastDate=new Date(year,month+1,0).getDate();
  monthYear.textContent=date.toLocaleString('default',{month:'long'})+' '+year;
  calendarDays.innerHTML="";
  for(let i=0;i<firstDay;i++){ calendarDays.innerHTML+="<div></div>"; }
  for(let d=1;d<=lastDate;d++){
    const fullDate=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday=d===new Date().getDate() && month===new Date().getMonth() && year===new Date().getFullYear();
    let eventText = savedEvents[fullDate] || savedEvents[`always-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`];
    calendarDays.innerHTML+=
      `<div class="${isToday?'today':''}" style="${eventText?'background:#4CAF50;color:white;font-weight:bold;':''}" title="${eventText||''}" data-date="${fullDate}">${d}</div>`;
  }
  document.querySelectorAll(".days div[data-date]").forEach(div=>{
    div.onclick=()=>{
      activeDateKey=div.getAttribute("data-date");
      const existingEvent=savedEvents[activeDateKey] || savedEvents[`always-${activeDateKey.slice(5)}`];
      isEditing=existingEvent!==undefined;
      popupDate.textContent=activeDateKey;
      eventInput.value=existingEvent||"";
      document.querySelector('input[name="repeat"][value="always"]').checked=!!savedEvents[`always-${activeDateKey.slice(5)}`];
      document.querySelector('input[name="repeat"][value="once"]').checked=!savedEvents[`always-${activeDateKey.slice(5)}`];
      popupButtons.innerHTML=isEditing?
        `<button onclick="saveEvent()">Update</button><button onclick="deleteEvent()">Remove</button><button onclick="closePopup()">Cancel</button>`:
        `<button onclick="saveEvent()">Save</button><button onclick="closePopup()">Cancel</button>`;
      popupOverlay.style.display="flex";
    }
  });
}

function saveEvent(){
  const text=eventInput.value.trim();
  const repeat=document.querySelector('input[name="repeat"]:checked').value;
  if(text){
    if(repeat==='once'){
      savedEvents[activeDateKey]=text;
      delete savedEvents[`always-${activeDateKey.slice(5)}`];
    } else {
      savedEvents[`always-${activeDateKey.slice(5)}`]=text;
      delete savedEvents[activeDateKey];
    }
    localStorage.setItem("savedEvents",JSON.stringify(savedEvents));
  }
  closePopup();
  renderCalendar(currentDate);
}

function deleteEvent(){
  if(confirm("Remove this marked event?")){
    delete savedEvents[activeDateKey];
    delete savedEvents[`always-${activeDateKey.slice(5)}`];
    localStorage.setItem("savedEvents",JSON.stringify(savedEvents));
    closePopup();
    renderCalendar(currentDate);
  }
}

function closePopup(){ popupOverlay.style.display="none"; }
function nextMonth(e){ e.stopPropagation(); currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(currentDate);}
function prevMonth(e){ e.stopPropagation(); currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(currentDate);}
document.getElementById("mainContainer").addEventListener("click", function(e){
  if(!e.target.closest(".calendar")&&!e.target.closest("button")&&!e.target.closest(".days div")){ calendar.classList.toggle("expanded"); }
});

renderCalendar(currentDate);

// Roller functions
function openRoller(){
  rollDay.innerHTML=""; for(let i=1;i<=31;i++){ rollDay.innerHTML+=`<option value="${i}">${i}</option>`; }
  rollMonth.innerHTML=""; for(let i=0;i<12;i++){ rollMonth.innerHTML+=`<option value="${i}">${new Date(0,i).toLocaleString('default',{month:'long'})}</option>`; }
  rollYear.innerHTML=""; let cy=new Date().getFullYear(); for(let i=cy-10;i<=cy+10;i++){ rollYear.innerHTML+=`<option value="${i}">${i}</option>`; }
  rollDay.value=currentDate.getDate(); rollMonth.value=currentDate.getMonth(); rollYear.value=currentDate.getFullYear();
  rollerOverlay.style.display="flex";
}
function applyRoller(){
  let y=parseInt(rollYear.value), m=parseInt(rollMonth.value), d=parseInt(rollDay.value);
  currentDate=new Date(y,m,d);
  rollerOverlay.style.display="none";
  renderCalendar(currentDate);
}
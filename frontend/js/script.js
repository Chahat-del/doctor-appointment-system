// Simple client-only data (images are local paths)
const doctorsDB = {
  Cardiologist: [
    { id: 'c1', name: "Dr. Rajesh Kumar", exp: "15 years", img: "images/doctor1.jpg" },
    { id: 'c2', name: "Dr. Sneha Reddy", exp: "10 years", img: "images/doctor2.jpg" }
  ],
  Dermatologist: [
    { id: 'd1', name: "Dr. Aisha Malik", exp: "8 years", img: "images/doctor3.jpg" },
    { id: 'd2', name: "Dr. Nikhil Jain", exp: "12 years", img: "images/doctor1.jpg" }
  ],
  Orthopedic: [
    { id: 'o1', name: "Dr. Meera Narayan", exp: "9 years", img: "images/doctor2.jpg" },
    { id: 'o2', name: "Dr. Arjun Patel", exp: "11 years", img: "images/doctor3.jpg" }
  ]
};

// A default set of slots (could be generated per-day)
const defaultSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM"
];

// Keys
const STORAGE_KEY = "appointments_v1"; // localStorage key to persist bookings

// State
let bookingState = {
  selectedDoctor: null,
  selectedSlot: null,
  bookings: {} // { doctorId: [slotStrings] }
};

// Load bookings from localStorage
function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    bookingState.bookings = raw ? JSON.parse(raw) : {};
  } catch (e) {
    bookingState.bookings = {};
  }
}

// Save bookings
function saveBookings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingState.bookings));
}

// Helper: check if slot booked
function isSlotBooked(doctorId, slot) {
  return bookingState.bookings[doctorId] && bookingState.bookings[doctorId].includes(slot);
}

// Render doctors for a selected specialization
function renderDoctors(specialization) {
  const container = document.getElementById("doctors-list");
  container.innerHTML = "";

  if (!specialization || !doctorsDB[specialization]) {
    container.innerHTML = `<p style="color:#444">Please choose a specialization and click "Find Doctors".</p>`;
    return;
  }

  const list = doctorsDB[specialization];
  list.forEach(doc => {
    const card = document.createElement("div");
    card.className = "doctor-card";
    card.innerHTML = `
      <img src="${doc.img}" alt="${doc.name}">
      <h3>${doc.name}</h3>
      <p><strong>${specialization}</strong> • ${doc.exp}</p>
      <div class="slot-list" id="slots-${doc.id}"></div>
      <div class="doctor-actions">
        <button class="book-btn" data-docid="${doc.id}">Book Appointment</button>
      </div>
    `;
    container.appendChild(card);

    // render slot items
    const slotContainer = card.querySelector(`#slots-${doc.id}`);
    defaultSlots.forEach(slot => {
      const slotEl = document.createElement("div");
      slotEl.className = "slot " + (isSlotBooked(doc.id, slot) ? "booked" : "available");
      slotEl.innerHTML = `<small>${slot}</small><span>${isSlotBooked(doc.id, slot) ? "Booked" : "Free"}</span>`;
      slotContainer.appendChild(slotEl);
    });
  });

  // attach book button listeners
  document.querySelectorAll(".book-btn").forEach(btn=>{
    btn.addEventListener("click", () => openBookingModal(btn.dataset.docid, specialization));
  });
}

// Modal controls
const modal = document.getElementById("booking-modal");
const modalClose = document.getElementById("modal-close");
const modalDoctorImg = document.getElementById("modal-doctor-img");
const modalDoctorName = document.getElementById("modal-doctor-name");
const modalDoctorSpec = document.getElementById("modal-doctor-spec");
const modalSlots = document.getElementById("modal-slots");
const confirmBtn = document.getElementById("confirm-book");

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e)=> {
  if (e.target === modal) closeModal();
});

// Open modal for chosen doctor
function openBookingModal(docId, specialization) {
  const doctor = findDoctorById(docId);
  if (!doctor) return;

  bookingState.selectedDoctor = { ...doctor, specialization: specialization };
  bookingState.selectedSlot = null;

  modalDoctorImg.src = doctor.img;
  modalDoctorName.textContent = doctor.name;
  modalDoctorSpec.textContent = specialization;

  // render slots inside modal
  modalSlots.innerHTML = "";
  defaultSlots.forEach(slot => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "modal-slot " + (isSlotBooked(docId, slot) ? "booked" : "");
    el.textContent = slot;
    el.disabled = isSlotBooked(docId, slot);
    el.addEventListener("click", () => {
      // deselect others
      document.querySelectorAll(".modal-slot").forEach(s => s.classList.remove("selected"));
      el.classList.add("selected");
      bookingState.selectedSlot = slot;
      confirmBtn.disabled = false;
    });
    modalSlots.appendChild(el);
  });

  confirmBtn.disabled = true;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");

  // attach confirm handler (ensure only one listener)
  confirmBtn.onclick = confirmBooking;
}

// Close modal
function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  bookingState.selectedDoctor = null;
  bookingState.selectedSlot = null;
}

// Confirm booking (mark slot booked, save, update UI)
function confirmBooking() {
  const doc = bookingState.selectedDoctor;
  const slot = bookingState.selectedSlot;
  if (!doc || !slot) return;

  if (!bookingState.bookings[doc.id]) bookingState.bookings[doc.id] = [];
  // avoid double-book
  if (bookingState.bookings[doc.id].includes(slot)) {
    alert("Slot already taken — please pick another.");
    renderDoctors(doc.specialization);
    closeModal();
    return;
  }

  bookingState.bookings[doc.id].push(slot);
  saveBookings();

  // simple confirmation UI: show alert with doctor's photo & details
  closeModal();
  renderDoctors(doc.specialization);
  showConfirmationPopup(doc, slot);
}

// small confirmation (you can replace with nicer toast/modal)
function showConfirmationPopup(doc, slot) {
  // build a small temporary modal-like confirmation
  const info = document.createElement("div");
  info.style.position = "fixed";
  info.style.right = "18px";
  info.style.bottom = "18px";
  info.style.zIndex = 200;
  info.style.background = "#fff";
  info.style.padding = "12px 16px";
  info.style.borderRadius = "10px";
  info.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)";
  info.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
      <img src="${doc.img}" style="width:56px;height:56px;border-radius:8px;object-fit:cover" alt="${doc.name}">
      <div style="text-align:left">
        <strong style="display:block;color:#00796b">${doc.name}</strong>
        <small>Slot: ${slot}</small><br/>
        <small>${doc.specialization}</small>
      </div>
    </div>
  `;
  document.body.appendChild(info);
  setTimeout(()=> info.remove(), 4500);
}

// Utility: find doctor by id within DB
function findDoctorById(id) {
  for (const spec in doctorsDB) {
    const d = doctorsDB[spec].find(x => x.id === id);
    if (d) return d;
  }
  return null;
}

// Initialization
document.getElementById("findBtn").addEventListener("click", () => {
  const spec = document.getElementById("specialization").value;
  renderDoctors(spec);
});

// On load
loadBookings();
// optional: show default (none) or auto-render last selection
renderDoctors(""); // shows prompt

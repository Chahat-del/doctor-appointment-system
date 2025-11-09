// === Doctor Data ===
const doctorsDB = {
  Cardiologist: [
    { id: "c1", name: "Dr. Rajesh Kumar", exp: "15 years", fee: 600, img: "images/doctor1.jpg" },
    { id: "c2", name: "Dr. Sneha Reddy", exp: "10 years", fee: 550, img: "images/doctor2.jpg" },
  ],
  Dermatologist: [
    { id: "d1", name: "Dr. Aisha Malik", exp: "8 years", fee: 400, img: "images/doctor3.jpg" },
    { id: "d2", name: "Dr. Nikhil Jain", exp: "12 years", fee: 450, img: "images/doctor1.jpg" },
  ],
  Orthopedic: [
    { id: "o1", name: "Dr. Meera Narayan", exp: "9 years", fee: 500, img: "images/doctor2.jpg" },
    { id: "o2", name: "Dr. Arjun Patel", exp: "11 years", fee: 650, img: "images/doctor3.jpg" },
  ],
};

// === Default Slots ===
const defaultSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:30 PM"];
const STORAGE_KEY = "appointments_v3";
let bookings = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

// === Render Doctors ===
function renderDoctors(spec) {
  const container = document.getElementById("doctors-list");
  container.innerHTML = "";

  if (!spec) {
    container.innerHTML = `<p>Please select a specialization.</p>`;
    return;
  }

  doctorsDB[spec].forEach((doc) => {
    const card = document.createElement("div");
    card.className = "doctor-card";
    card.innerHTML = `
      <img src="${doc.img}" alt="${doc.name}">
      <h3>${doc.name}</h3>
      <p>${spec} • ${doc.exp}</p>
      <p><strong>Fee:</strong> ₹${doc.fee}</p>
      <button onclick="openModal('${doc.id}', '${spec}')">Book Appointment</button>
    `;
    container.appendChild(card);
  });
}

document.getElementById("findBtn").addEventListener("click", () => {
  const spec = document.getElementById("specialization").value;
  renderDoctors(spec);
});

// === Modal Logic ===
const modal = document.getElementById("booking-modal");
const closeBtn = document.getElementById("modal-close");
const confirmBtn = document.getElementById("confirm-book");

let currentDoctor = null;
let selectedSlot = null;

function openModal(id, spec) {
  const doctor = findDoctor(id);
  currentDoctor = { ...doctor, spec };
  selectedSlot = null;

  document.getElementById("modal-doctor-img").src = doctor.img;
  document.getElementById("modal-doctor-name").textContent = doctor.name;
  document.getElementById("modal-doctor-spec").textContent = `${spec} • ${doctor.exp}`;
  document.getElementById("modal-fee").textContent = doctor.fee;

  const slotsContainer = document.getElementById("modal-slots");
  slotsContainer.innerHTML = "";

  defaultSlots.forEach((s) => {
    const el = document.createElement("div");
    el.textContent = s;
    el.className = "modal-slot";
    if (isBooked(id, s)) el.classList.add("booked");

    el.addEventListener("click", () => {
      if (el.classList.contains("booked")) {
        cancelSlot(id, s);
        return;
      }
      document.querySelectorAll(".modal-slot").forEach((x) => x.classList.remove("selected"));
      el.classList.add("selected");
      selectedSlot = s;
      confirmBtn.disabled = false;
    });
    slotsContainer.appendChild(el);
  });

  confirmBtn.disabled = true;
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

function findDoctor(id) {
  for (let spec in doctorsDB) {
    const doc = doctorsDB[spec].find((d) => d.id === id);
    if (doc) return doc;
  }
}

function isBooked(id, slot) {
  return bookings[id]?.includes(slot);
}

// === Beautiful Toast Notification ===
function showToast(message, img, subtext = "", type = "success") {
  const toast = document.createElement("div");
  toast.className = "toast" + (type === "cancel" ? " cancel" : "");
  toast.innerHTML = `
    <img src="${img}" alt="Doctor">
    <div class="toast-text">
      <strong>${message}</strong>
      <small>${subtext}</small>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// === Booking Logic ===
confirmBtn.addEventListener("click", () => {
  if (!selectedSlot) return;
  const id = currentDoctor.id;
  if (!bookings[id]) bookings[id] = [];
  if (!bookings[id].includes(selectedSlot)) bookings[id].push(selectedSlot);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));

  showToast(
    `Appointment Confirmed`,
    currentDoctor.img,
    `${currentDoctor.name} • ${selectedSlot} • ₹${currentDoctor.fee}`,
    "success"
  );
  closeModal();
});

// === Cancel Single Slot ===
function cancelSlot(id, slot) {
  if (confirm(`Cancel appointment at ${slot}?`)) {
    bookings[id] = bookings[id].filter((s) => s !== slot);
    if (bookings[id].length === 0) delete bookings[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    showToast(
      `Appointment Cancelled`,
      currentDoctor.img,
      `${currentDoctor.name} • ${slot}`,
      "cancel"
    );
    openModal(id, currentDoctor.spec);
  }
}

// === Modal Close ===
closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => e.target === modal && closeModal());

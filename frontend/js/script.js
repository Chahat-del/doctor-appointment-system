// Temporary dummy data until backend is ready
const dummyDoctors = {
    "Cardiologist": [
        { id: 1, name: "Dr. Rakesh Sharma", experience: "12 years", hospital: "Apollo Hospital" },
        { id: 2, name: "Dr. Meera Nair", experience: "8 years", hospital: "Fortis Hospital" }
    ],
    "Dermatologist": [
        { id: 3, name: "Dr. Ananya Patel", experience: "5 years", hospital: "SkinCare Clinic" },
        { id: 4, name: "Dr. Karan Singh", experience: "10 years", hospital: "Glow Hospital" }
    ],
    "Orthopedic": [
        { id: 5, name: "Dr. Ritu Malhotra", experience: "7 years", hospital: "OrthoCare Centre" },
        { id: 6, name: "Dr. Arvind Gupta", experience: "15 years", hospital: "AIIMS Delhi" }
    ]
};

function searchDoctors() {
    const specialization = document.getElementById('specialization').value;
    if (!specialization) {
        alert('Please select a specialization');
        return;
    }

    // Redirect to doctors.html with specialization info in URL
    window.location.href = `doctors.html?specialization=${encodeURIComponent(specialization)}`;
}

function loadDoctors() {
    const params = new URLSearchParams(window.location.search);
    const specialization = params.get("specialization");

    if (!specialization) return;

    const doctorListDiv = document.getElementById("doctor-list");
    const doctors = dummyDoctors[specialization] || [];

    if (doctors.length === 0) {
        doctorListDiv.innerHTML = `<p>No doctors found for ${specialization}</p>`;
        return;
    }

    doctorListDiv.innerHTML = `<h3>${specialization} Specialists:</h3>`;
    doctors.forEach(doc => {
        doctorListDiv.innerHTML += `
            <div class="doctor-card">
                <h4>${doc.name}</h4>
                <p>${doc.experience}</p>
                <p>${doc.hospital}</p>
                <button onclick="bookDoctor(${doc.id}, '${doc.name}')">Book Appointment</button>
            </div>
        `;
    });
}

function bookDoctor(id, name) {
    alert(`Booking appointment with ${name} (Doctor ID: ${id})`);
    window.location.href = "appointment.html";
}

function cancelAppointment(event) {
    event.preventDefault();
    const id = document.getElementById('appointmentId').value;
    document.getElementById('cancelMsg').innerText =
        `Appointment ${id} cancelled successfully (mock for now).`;
}

// When doctors.html loads, show doctor list
if (window.location.pathname.endsWith("doctors.html")) {
    window.onload = loadDoctors;
}

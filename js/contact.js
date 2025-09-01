// ===================== CONTACTS DATA =====================
const contacts = [
  {name:'Alex John', avatar:'https://picsum.photos/51'},
  {name:'Maria Lee', avatar:'https://picsum.photos/52'},
  {name:'David Kim', avatar:'https://picsum.photos/53'},
  {name:'Sophie Chen', avatar:'https://picsum.photos/54'},
  {name:'John Doe', avatar:'https://picsum.photos/55'},
  {name:'Emily Davis', avatar:'https://picsum.photos/56'},
  {name:'Michael Brown', avatar:'https://picsum.photos/57'},
  {name:'Sarah Wilson', avatar:'https://picsum.photos/58'},
  {name:'Chris Evans', avatar:'https://picsum.photos/59'},
  {name:'Olivia Taylor', avatar:'https://picsum.photos/60'},
  {name:'Daniel Harris', avatar:'https://picsum.photos/61'},
  {name:'Sophia Martinez', avatar:'https://picsum.photos/62'},
  {name:'James Anderson', avatar:'https://picsum.photos/63'},
  {name:'Emma Thomas', avatar:'https://picsum.photos/64'},
  {name:'William Jackson', avatar:'https://picsum.photos/65'},
  {name:'Isabella White', avatar:'https://picsum.photos/66'},
  {name:'Benjamin Lewis', avatar:'https://picsum.photos/67'},
  {name:'Mia Robinson', avatar:'https://picsum.photos/68'},
  {name:'Alexander Walker', avatar:'https://picsum.photos/69'},
  {name:'Charlotte Hall', avatar:'https://picsum.photos/70'}
];

const contactsList = document.getElementById('contactsList');

// ===================== GENERATE CONTACT LIST =====================
contacts.forEach(contact => {
  const div = document.createElement('div');
  div.classList.add('contact');
  div.innerHTML = `
    <img src="${contact.avatar}" alt="${contact.name}">
    <span class="name">${contact.name}</span>
  `;

  div.addEventListener('click', () => {
    window.location.href = `chat.html?name=${encodeURIComponent(contact.name)}&avatar=${encodeURIComponent(contact.avatar)}`;
  });

  contactsList.appendChild(div);
});

// ===================== SEARCH FUNCTIONALITY =====================
document.getElementById("searchInput").addEventListener("keyup", function() {
  let filter = this.value.toLowerCase();
  let contacts = document.querySelectorAll(".contact");

  contacts.forEach(contact => {
    let name = contact.querySelector(".name").textContent.toLowerCase();
    contact.style.display = name.includes(filter) ? "" : "none";
  });
});

// ===================== QR SCANNER FUNCTIONALITY =====================
const qrBtn = document.getElementById("qrBtn");
const qrScanner = document.getElementById("qrScanner");
const closeScanner = document.getElementById("closeScanner");

let html5QrCode; // keep reference to scanner

if (qrBtn) {
  qrBtn.addEventListener("click", () => {
    qrScanner.style.display = "flex";

    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("reader");
    }

    const config = { fps: 10, qrbox: 250 };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      qrCodeMessage => {
        // Example: QR code contains chat link
        window.location.href = qrCodeMessage;
        html5QrCode.stop();
      },
      errorMessage => {
        console.log("QR scan error:", errorMessage);
      }
    ).catch(err => {
      console.error("Camera start failed:", err);
    });
  });
}

if (closeScanner) {
  closeScanner.addEventListener("click", () => {
    qrScanner.style.display = "none";
    if (html5QrCode) {
      html5QrCode.stop().catch(err => console.error("Stop failed:", err));
    }
  });
}

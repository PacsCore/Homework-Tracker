// import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// your Firebase-Config
const firebaseConfig = {
  apiKey: "AIzaSyB-3-Piwnoda_cO0dzKhHt25OikGOXxzZk",
  authDomain: "klassen-hue-tracker.firebaseapp.com",
  projectId: "klassen-hue-tracker",
  storageBucket: "klassen-hue-tracker.firebasestorage.app",
  messagingSenderId: "914966951850",
  appId: "1:914966951850:web:a99a178f57a7f0d51b9dd3"
};

// start Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Password-Logic ---
const CORRECT_PASSWORD = "8b"; // correct password

const lockScreen = document.getElementById("lock-screen");
const appDiv = document.getElementById("app");
const passwordInput = document.getElementById("passcode-input");
const unlockBtn = document.getElementById("unlock-btn");
const errorMsg = document.getElementById("error-msg");

function unlock() {
  if (passwordInput.value.toLowerCase() === CORRECT_PASSWORD.toLowerCase()) {
    lockScreen.classList.add("hidden");
    appDiv.classList.remove("hidden");
    sessionStorage.setItem("unlocked", "true");
  } else {
    errorMsg.textContent = "Wrong password!";
  }
}

unlockBtn.addEventListener("click", unlock);
passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") unlock();
});

// already unlocked in this browser session? then don't ask again
if (sessionStorage.getItem("unlocked") === "true") {
  lockScreen.classList.add("hidden");
  appDiv.classList.remove("hidden");
}

// --- add homework ---
const form = document.getElementById("entry-form");
const subjectInput = document.getElementById("subject-input");
const hwInput = document.getElementById("hw-input");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // prevent page reload

  await addDoc(collection(db, "homework"), {
    subject: subjectInput.value,
    text: hwInput.value,
    createdAt: serverTimestamp()
  });

  form.reset(); // clear form after submitting
});

// --- show live list ---
const hwList = document.getElementById("hw-list");
const q = query(collection(db, "homework"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  hwList.innerHTML = ""; // clear list, then rebuild

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;

    const li = document.createElement("li");
    li.className = "hw-item";
    li.innerHTML = `
      <div class="hw-item-content">
        <span class="subject">${data.subject}</span>
        <span>${data.text}</span>
        <span class="date">${data.createdAt ? data.createdAt.toDate().toLocaleString("de-AT") : "just now"}</span>
      </div>
      <button class="delete-btn" data-id="${id}">🗑️</button>
    `;

    hwList.appendChild(li);
  });

    // connect delete buttons with function
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await deleteDoc(doc(db, "homework", id));
    });
  });
});
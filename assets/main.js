// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

const firebaseConfig = { /* Your config */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Create Paste
async function createPaste() {
  const content = document.getElementById("paste-content").value;
  const pasteId = generateId(); // Custom ID generator
  await setDoc(doc(db, "pastes", pasteId), { content });
  
  // Show share link
  const url = `${window.location.origin}/?id=${pasteId}`;
  document.getElementById("paste-url").classList.remove("hidden");
  document.querySelector("#paste-url input").value = url;
}

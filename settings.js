
// IMPORTS & FIREBASE INITIALIZATION

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    sendPasswordResetEmail,
    signOut 
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD6QxcNAaVikp2Coq1NceO0cryBZp_mvks",
    authDomain: "booktracker-b92f3.firebaseapp.com",
    projectId: "booktracker-b92f3",
    storageBucket: "booktracker-b92f3.firebasestorage.app",
    messagingSenderId: "995531307770",
    appId: "1:995531307770:web:4d29e235893074eec8a743",
    measurementId: "G-RQMJ6VECKX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// SETTINGS SUB-NAVIGATION TABS

window.switchSettingsTab = function(evt, tabId) {
    const contents = document.getElementsByClassName("settings-tab-content");
    for (let i = 0; i < contents.length; i++) {
        contents[i].style.display = "none";
    }

    const links = document.querySelectorAll(".sidebar .tab-link");
    for (let i = 0; i < links.length; i++) {
        links[i].style.background = "transparent";
        links[i].style.color = "#94a3b8";
    }

    document.getElementById(tabId).style.display = "block";
    evt.currentTarget.style.background = "#1e293b";
    evt.currentTarget.style.color = "#f8fafc";
};


// LOAD USER DATA & AUTH STATE

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Populate Email
        const emailInput = document.getElementById("settings-email");
        if (emailInput) emailInput.value = user.email;

        // Fetch Username from Firestore
        const usernameInput = document.getElementById("settings-username");
        if (usernameInput) {
            try {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    usernameInput.value = userData.username || "N/A";
                });
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        }
    } else {
        window.location.href = "log_in.html";
    }
});


// APPEARANCE (Dark / Light Mode Toggle)

const currentTheme = localStorage.getItem("theme") || "dark";
if (currentTheme === "light") {
    document.body.classList.add("light-mode");
}

const themeToggleBtn = document.getElementById("theme-toggle-btn");
if (themeToggleBtn) {
    if (currentTheme === "light") {
        themeToggleBtn.textContent = " Light Mode";
    }

    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        
        let theme = "dark";
        if (document.body.classList.contains("light-mode")) {
            theme = "light";
            themeToggleBtn.textContent = " Light Mode";
        } else {
            themeToggleBtn.textContent = " Dark Mode";
        }
        localStorage.setItem("theme", theme);
    });
}


//  SECURITY (Change Password via Email)

const changePasswordBtn = document.getElementById("change-password-btn");
if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (user && user.email) {
            try {
                await sendPasswordResetEmail(auth, user.email);
                alert(`Password reset email sent to ${user.email}. Check your inbox to update your password.`);
            } catch (error) {
                console.error("Error sending password reset email:", error);
                alert("Failed to send password reset email. Please try again.");
            }
        } else {
            alert("No user session found.");
        }
    });
}


// LOGOUT HANDLER

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            alert("Logged out successfully!");
            window.location.href = "log_in.html";
        }).catch((error) => {
            console.error("Error signing out:", error);
        });
    });
}
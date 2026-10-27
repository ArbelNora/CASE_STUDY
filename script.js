function switchTab(evt, sectionId) {
    // 1. Hide all tab contents
    const contents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < contents.length; i++) {
        contents[i].classList.remove("active-content");
    }

    // 2. Remove the 'active' class from all navigation links
    const links = document.getElementsByClassName("tab-link");
    for (let i = 0; i < links.length; i++) {
        links[i].classList.remove("active");
    }

    // 3. Show the target content section
    document.getElementById(sectionId).classList.add("active-content");

    // 4. Add the 'active' class to the clicked tab link
    evt.currentTarget.classList.add("active");
}

//Drop down button
//shows the drop menu button when clicked
function toggleDropdown() {
    document.getElementById("dropdown-menu").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of the menu button
window.onclick = function(event) {
    // If the click target is not the menu button (or inside it), close the dropdown
    if (!event.target.matches('.menu-btn') && !event.target.closest('.menu-btn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}


// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD6QxcNAaVikp2Coq1NceO0cryBZp_mvks",
    authDomain: "booktracker-b92f3.firebaseapp.com",
    projectId: "booktracker-b92f3",
    storageBucket: "booktracker-b92f3.firebasestorage.app",
    messagingSenderId: "995531307770",
    appId: "1:995531307770:web:4d29e235893074eec8a743",
    measurementId: "G-RQMJ6VECKX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

// Handle Sign Up
const signUpForm = document.getElementById("signup-form"); // Replace with your actual form ID if different

if (signUpForm) {
    signUpForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up successfully!
                const user = userCredential.user;
                alert("Account created successfully!");
                window.location.href = "main.html"; // Redirect to main app page
            })
            .catch((error) => {
                console.error("Error signing up:", error.message);
                alert(error.message);
            });
    });
}
//handle log in
const logInForm = document.getElementById("login-form"); // Replace with your actual form ID if different

if (logInForm) {
    logInForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Logged in successfully!
                const user = userCredential.user;
                alert("Logged in successfully!");
                window.location.href = "main.html"; // Redirect to main app page
            })
            .catch((error) => {
                console.error("Error logging in:", error.message);
                alert("Invalid email or password!");
            });
    });
}

import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
const db = getFirestore(app);

// Handle Adding a Book from main.html
const bookForm = document.querySelector(".input_book");

if (bookForm) {
    bookForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to add a book!");
            window.location.href = "log_in.html";
            return;
        }

        const bookName = document.getElementById("book_name").value;
        const authorName = document.getElementById("author").value;

        // Determine status based on checked checkboxes
        let status = "marked"; // default
        if (document.getElementById("read").checked) status = "reading";
        if (document.getElementById("finished").checked) status = "finished";

        try {
            await addDoc(collection(db, "books"), {
                userId: user.uid,
                title: bookName,
                author: authorName,
                status: status,
                createdAt: new Date()
            });

            alert("Book added successfully!");
            bookForm.reset(); // Clear the form fields
        } catch (error) {
            console.error("Error adding book: ", error);
            alert("Failed to add book.");
        }
    });
}
// ==========================================
// 1. IMPORTS & FIREBASE INITIALIZATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD6QxcNAaVikp2Coq1NceO0cryBZp_mvks",
    authDomain: "booktracker-b92f3.firebaseapp.com",
    projectId: "booktracker-b92f3",
    storageBucket: "booktracker-b92f3.firebasestorage.app",
    messagingSenderId: "995531307770",
    appId: "1:995531307770:web:4d29e235893074eec8a743",
    measurementId: "G-RQMJ6VECKX"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);


// ==========================================
// 2. GLOBAL UI FUNCTIONS (Tabs & Dropdown)
// ==========================================

window.switchTab = function(evt, sectionId) {
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
};

// Toggle the drop-down menu open/closed
window.toggleDropdown = function() {
    const dropdownMenu = document.getElementById("dropdown-menu");
    dropdownMenu.classList.toggle("show");
};

// Close the dropdown if the user clicks outside of the menu
window.onclick = function(event) {
    if (!event.target.matches('.menu-btn') && !event.target.closest('.menu-btn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
};


// ==========================================
// 3. AUTHENTICATION (Sign Up & Log In)
// ==========================================

// Handle Sign Up
const signUpForm = document.getElementById("signup-form");
if (signUpForm) {
    signUpForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Account created successfully!");
                window.location.href = "main.html";
            })
            .catch((error) => {
                console.error("Error signing up:", error.message);
                alert(error.message);
            });
    });
}

// Handle Log In
const logInForm = document.getElementById("login-form");
if (logInForm) {
    logInForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Logged in successfully!");
                window.location.href = "main.html";
            })
            .catch((error) => {
                console.error("Error logging in:", error.message);
                alert("Invalid email or password!");
            });
    });
}


// ==========================================
// 4. FIRESTORE BOOK MANAGEMENT & RENDERING
// ==========================================

// Function to fetch and display books under tabs
async function loadUserBooks() {
    const user = auth.currentUser;
    if (!user) return;

    const markedContainer = document.getElementById("marked-section");
    const readingContainer = document.getElementById("reading-section");
    const finishedContainer = document.getElementById("finished-section");

    if (!markedContainer || !readingContainer || !finishedContainer) return;

    markedContainer.innerHTML = "";
    readingContainer.innerHTML = "";
    finishedContainer.innerHTML = "";

    try {
        const booksRef = collection(db, "books");
        const q = query(booksRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            markedContainer.innerHTML = "<p>Your marked books will appear here...</p>";
            readingContainer.innerHTML = "<p>Books you are currently reading will appear here...</p>";
            finishedContainer.innerHTML = "<p>Your finished books will appear here...</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const book = doc.data();
            const bookCard = `
                <div class="book-card" style="background: #1e293b; padding: 1rem; margin-bottom: 1rem; border-radius: 6px; border: 1px solid #334155;">
                    <h3 style="color: #f8fafc; margin-bottom: 0.3rem;">${book.title}</h3>
                    <p style="color: #cbd5e1; font-size: 0.9rem; margin: 0.2rem 0;"><strong>Author:</strong> ${book.author}</p>
                    <p style="color: #cbd5e1; font-size: 0.9rem; margin: 0.2rem 0;"><strong>Genre:</strong> ${book.genre || "N/A"}</p>
                </div>
            `;

            if (book.status === "marked") markedContainer.innerHTML += bookCard;
            else if (book.status === "reading") readingContainer.innerHTML += bookCard;
            else if (book.status === "finished") finishedContainer.innerHTML += bookCard;
        });
    } catch (error) {
        console.error("Error fetching books:", error);
    }
}

// Automatically trigger book loading when auth state is confirmed
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserBooks();
    }
});

// Handle Adding a Book from main.html form
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
        const genreName = document.getElementById("genre").value;

        // Determine status based on checked checkboxes
        let status = "marked"; // default
        if (document.getElementById("read").checked) status = "reading";
        if (document.getElementById("finished").checked) status = "finished";

        try {
            await addDoc(collection(db, "books"), {
                userId: user.uid,
                title: bookName,
                author: authorName,
                genre: genreName,         
                status: status,
                createdAt: new Date()
            });

            alert("Book added successfully!");
            bookForm.reset();
            loadUserBooks(); // Refresh book list immediately
        } catch (error) {
            console.error("Error adding book: ", error);
            alert("Failed to add book.");
        }
    });
}
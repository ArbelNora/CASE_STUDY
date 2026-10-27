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
    where, 
    deleteDoc, 
    doc 
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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);


// ==========================================
// 2. GLOBAL UI FUNCTIONS (Tabs & Dropdown)
// ==========================================

window.switchTab = function(evt, sectionId) {
    const contents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < contents.length; i++) {
        contents[i].classList.remove("active-content");
    }

    const links = document.getElementsByClassName("tab-link");
    for (let i = 0; i < links.length; i++) {
        links[i].classList.remove("active");
    }

    document.getElementById(sectionId).classList.add("active-content");
    evt.currentTarget.classList.add("active");
};

window.toggleDropdown = function() {
    const dropdownMenu = document.getElementById("dropdown-menu");
    dropdownMenu.classList.toggle("show");
};

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

const signUpForm = document.getElementById("signup-form");
if (signUpForm) {
    signUpForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("signup-email").value;
        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await addDoc(collection(db, "users"), {
                userId: user.uid,
                username: username,
                email: email,
                createdAt: new Date()
            });

            alert("Account created successfully!");
            window.location.href = "main.html";
        } catch (error) {
            console.error("Error signing up:", error.message);
            alert(error.message);
        }
    });
}

const logInForm = document.getElementById("login-form");
if (logInForm) {
    logInForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
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
// 4. FIRESTORE BOOK MANAGEMENT & RENDER
// ==========================================

async function loadUserBooks(user) {
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

        querySnapshot.forEach((docSnap) => {
            const book = docSnap.data();
            const docId = docSnap.id;

            let timeString = "Recently added";
            if (book.createdAt) {
                const date = book.createdAt.toDate ? book.createdAt.toDate() : new Date(book.createdAt);
                timeString = date.toLocaleString();
            }

            const bookCard = `
                <div class="book-card" style="background: #1e293b; padding: 1rem; margin-bottom: 1rem; border-radius: 6px; border: 1px solid #334155; position: relative;">
                    <h3 style="color: #f8fafc; margin-bottom: 0.3rem;">${book.title}</h3>
                    <p style="color: #cbd5e1; font-size: 0.9rem; margin: 0.2rem 0;"><strong>Author:</strong> ${book.author}</p>
                    <p style="color: #cbd5e1; font-size: 0.9rem; margin: 0.2rem 0;"><strong>Genre:</strong> ${book.genre || "N/A"}</p>
                    <p style="color: #94a3b8; font-size: 0.8rem; margin-top: 0.5rem;">Submitted: ${timeString}</p>
                    <button onclick="window.deleteBook('${docId}')" style="background-color: #ef4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-top: 0.5rem;">Delete</button>
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

window.deleteBook = async function(docId) {
    if (confirm("Are you sure you want to delete this book?")) {
        try {
            await deleteDoc(doc(db, "books", docId));
            alert("Book deleted successfully!");
            loadUserBooks(auth.currentUser);
        } catch (error) {
            console.error("Error deleting book:", error);
            alert("Failed to delete book.");
        }
    }
};


// ==========================================
// 5. UNIFIED AUTH STATE & PROFILE LOADER
// ==========================================

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // 1. Populate email on settings page if input exists
        const emailInput = document.getElementById("settings-email");
        if (emailInput) {
            emailInput.value = user.email;
        }

        // 2. Fetch and display username for header and settings
        const welcomeEl = document.getElementById("username-display");
        const settingsUsernameInput = document.getElementById("settings-username");

        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((docSnap) => {
                    const userData = docSnap.data();
                    const username = userData.username || "User";

                    if (welcomeEl) {
                        welcomeEl.textContent = `Welcome, ${username}!`;
                    }
                    if (settingsUsernameInput) {
                        settingsUsernameInput.value = username;
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching username:", error);
        }

        // 3. Load books if user is on main page
        loadUserBooks(user);
    } else {
        if (!window.location.href.includes("log_in.html") && !window.location.href.includes("sign_up.html") && !window.location.href.includes("index.html")) {
            window.location.href = "log_in.html";
        }
    }
});


// ==========================================
// 6. FORM HANDLERS (Add Book & Logout)
// ==========================================

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

        let status = "marked";
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
            loadUserBooks(user);
        } catch (error) {
            console.error("Error adding book: ", error);
            alert("Failed to add book.");
        }
    });
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        auth.signOut().then(() => {
            alert("Logged out successfully!");
            window.location.href = "log_in.html";
        }).catch((error) => {
            console.error("Error signing out:", error);
        });
    });
}
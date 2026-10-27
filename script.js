
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
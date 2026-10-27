
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
// Sample match information
const matches = [
    {
        id: "M1",
        teams: "CSK vs MI",
        codes: ["CSK", "MI"],
        date: "March 1, 2026",
        time: "7:30 PM",
        venue: "M. A. Chidambaram Stadium, Chennai",
        prices: { General: 800, Premium: 1500, VIP: 3000 }
    },

    {
        id: "M2",
        teams: "RCB vs DC",
        codes: ["RCB", "DC"],
        date: "March 5, 2026",
        time: "7:30 PM",
        venue: "M. Chinnaswamy Stadium, Bengaluru",
        prices: { General: 900, Premium: 1700, VIP: 3500 }
    },

    {
        id: "M3",
        teams: "MI vs KKR",
        codes: ["MI", "KKR"],
        date: "March 10, 2026",
        time: "7:30 PM",
        venue: "Wankhede Stadium, Mumbai",
        prices: { General: 850, Premium: 1600, VIP: 3200 }
    },

    {
        id: "M4",
        teams: "SRH vs RR",
        codes: ["SRH", "RR"],
        date: "March 14, 2026",
        time: "7:30 PM",
        venue: "Rajiv Gandhi Stadium, Hyderabad",
        prices: { General: 800, Premium: 1500, VIP: 3000 }
    },

    {
        id: "M5",
        teams: "PBKS vs CSK",
        codes: ["PBKS", "CSK"],
        date: "March 18, 2026",
        time: "7:30 PM",
        venue: "PCA Stadium, Mohali",
        prices: { General: 850, Premium: 1600, VIP: 3200 }
    }
];


// Local storage key
const STORAGE_KEY = "iplPracticeBookings";


// Format ticket price
function formatRupees(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
}


// Get previously saved bookings
function getSavedBookings() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        return [];
    }
}


// Save bookings
function saveBookings(bookings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}


// Display match schedule
function renderMatchSchedule() {

    const tableBody = document.getElementById("match-table-body");

    if (!tableBody) return;

    const filter = document.getElementById("team-filter");
    const selectedTeam = filter ? filter.value : "all";

    const visibleMatches = matches.filter(function(match) {
        return selectedTeam === "all" ||
               match.codes.includes(selectedTeam);
    });

    tableBody.innerHTML = "";

    if (visibleMatches.length === 0) {
        tableBody.innerHTML =
            '<tr><td colspan="8">No matches found.</td></tr>';
        return;
    }

    visibleMatches.forEach(function(match, index) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${match.teams}</td>
            <td>${match.date}<br>${match.time}</td>
            <td>${match.venue}</td>
            <td>${formatRupees(match.prices.General)}</td>
            <td>${formatRupees(match.prices.Premium)}</td>
            <td>${formatRupees(match.prices.VIP)}</td>
            <td>
                <a class="table-book-link"
                   href="booking.html?match=${encodeURIComponent(match.id)}">
                   Book
                </a>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// Populate match dropdown
function populateMatchOptions() {

    const matchSelect = document.getElementById("match-select");

    if (!matchSelect) return;

    matches.forEach(function(match) {

        const option = document.createElement("option");

        option.value = match.id;
        option.textContent = match.teams + " — " + match.date;

        matchSelect.appendChild(option);
    });

    // Read match ID from URL
    const requestedMatch =
        new URLSearchParams(window.location.search).get("match");

    if (requestedMatch &&
        matches.some(match => match.id === requestedMatch)) {

        matchSelect.value = requestedMatch;
    }
}


// Update booking summary
function updateBookingSummary() {

    const form = document.getElementById("ticket-form");

    if (!form) return;

    const matchSelect = document.getElementById("match-select");

    const selectedMatch = matches.find(
        match => match.id === matchSelect.value
    );

    const selectedStand =
        form.querySelector('input[name="stand"]:checked');

    const quantityInput = document.getElementById("quantity");

    const quantity = Number(quantityInput.value) || 0;

    const stand = selectedStand ? selectedStand.value : "";

    const price =
        selectedMatch && stand
        ? selectedMatch.prices[stand]
        : 0;

    const total = price * quantity;

    document.getElementById("summary-match").textContent =
        selectedMatch ? selectedMatch.teams : "Not selected";

    document.getElementById("summary-venue").textContent =
        selectedMatch ? selectedMatch.venue : "—";

    document.getElementById("summary-stand").textContent =
        stand || "Not selected";

    document.getElementById("summary-price").textContent =
        formatRupees(price);

    document.getElementById("summary-quantity").textContent =
        quantity;

    document.getElementById("summary-total").textContent =
        formatRupees(total);
}


// Display saved bookings
function renderMyBookings() {

    const tableBody = document.getElementById("my-bookings-body");

    if (!tableBody) return;

    const bookings = getSavedBookings();

    tableBody.innerHTML = "";

    if (bookings.length === 0) {

        tableBody.innerHTML =
            '<tr><td colspan="6">No bookings yet.</td></tr>';

        return;
    }

    bookings.forEach(function(booking) {

        const row = document.createElement("tr");

        const values = [
            booking.id,
            booking.name,
            booking.match,
            booking.stand,
            booking.quantity,
            formatRupees(booking.total)
        ];

        values.forEach(function(value) {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}


// Handle booking form
function setupBookingForm() {

    const form = document.getElementById("ticket-form");

    if (!form) return;

    const message = document.getElementById("form-message");

    // Update summary whenever form values change
    form.addEventListener("input", updateBookingSummary);
    form.addEventListener("change", updateBookingSummary);


    // Handle reset button
    form.addEventListener("reset", function() {

        message.textContent = "";
        message.className = "form-message";

        setTimeout(updateBookingSummary, 0);
    });


    // Handle form submission
    form.addEventListener("submit", function(event) {

        event.preventDefault();

        // Check form validity
        if (!form.checkValidity()) {

            form.reportValidity();

            return;
        }

        const selectedMatch = matches.find(
            match => match.id ===
            document.getElementById("match-select").value
        );

        const selectedStand =
            form.querySelector('input[name="stand"]:checked');

        const quantity =
            Number(document.getElementById("quantity").value);


        if (!selectedMatch || !selectedStand) {

            message.textContent =
                "Please select a match and stand category.";

            message.className = "form-message error";

            return;
        }


        // Calculate ticket price
        const price = selectedMatch.prices[selectedStand.value];


        // Create booking object
        const booking = {

            id: "IPL" + Date.now().toString().slice(-7),

            name: document.getElementById("name").value.trim(),

            email: document.getElementById("email").value.trim(),

            phone: document.getElementById("phone").value.trim(),

            match: selectedMatch.teams,

            venue: selectedMatch.venue,

            stand: selectedStand.value,

            quantity: quantity,

            price: price,

            total: price * quantity,

            createdAt: new Date().toLocaleString()
        };


        // Save booking in local storage
        const bookings = getSavedBookings();

        bookings.push(booking);

        saveBookings(bookings);


        // Reset the form first
        form.reset();

        updateBookingSummary();

        // Display success message after resetting
        message.textContent =
            `Booking saved! Your demo booking ID is ${booking.id}. Total: ${formatRupees(booking.total)}.`;

        message.className = "form-message success";
        message.className = "form-message success";

    }); // End submit event listener

    updateBookingSummary();

}   // End setupBookingForm function

    // Run code after HTML has loaded
    document.addEventListener("DOMContentLoaded", function() {

    const teamFilter = document.getElementById("team-filter");

    if (teamFilter) {
        teamFilter.addEventListener("change", renderMatchSchedule);
    }

    renderMatchSchedule();

    populateMatchOptions();

    setupBookingForm();

    renderMyBookings();

});
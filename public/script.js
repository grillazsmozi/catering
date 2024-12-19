document.addEventListener("DOMContentLoaded", () => {
    const scanInput = document.getElementById("scanInput");
    const messageDiv = document.getElementById("message");
    const crateList = document.getElementById("crateList");

    scanInput.addEventListener("keypress", async (event) => {
        if (event.key !== "Enter") return; // Wait for Enter key to process the scan

        const scanCode = scanInput.value.trim();
        scanInput.value = ""; // Clear input immediately for the next scan

        if (!scanCode) return; // Ignore empty input

        try {
            // Send the scanned code to the server
            const response = await fetch('/api/add-crate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scanCode }),
            });

            const data = await response.json();
            messageDiv.textContent = data.message;
            messageDiv.className = data.success ? "success" : "error";

            // Refresh crate list if a crate is successfully created
            if (data.success && data.message.includes("created successfully")) {
                const crateResponse = await fetch('/add-crate');
                const newHtml = await crateResponse.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(newHtml, "text/html");
                const newCrateList = doc.getElementById("crateList");
                crateList.innerHTML = newCrateList.innerHTML;
            }
        } catch (error) {
            console.error("Error processing scan:", error);
            messageDiv.textContent = "An error occurred.";
            messageDiv.className = "error";
        }
    });
});

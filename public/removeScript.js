document.addEventListener("DOMContentLoaded", () => {
    const scanInput = document.getElementById("scanInput");
    const messageDiv = document.getElementById("message");

    let isProcessing = false; // Prevent multiple submissions during scan

    scanInput.addEventListener("keypress", async (event) => {
        if (isProcessing || event.key !== "Enter") return; // Skip if processing or key is not Enter
        isProcessing = true;

        const scanCode = scanInput.value.trim();
        scanInput.value = ""; // Clear input field immediately

        if (!scanCode) {
            isProcessing = false;
            return;
        }

        try {
            // Send the scanned code to the server
            const response = await fetch('/api/remove-crate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scanCode }),
            });

            const data = await response.json();
            messageDiv.textContent = data.message;
            messageDiv.className = data.success ? "success" : "error";

            // Refresh the page if the crate is removed successfully
            if (data.success && data.message.includes("removed successfully")) {
                setTimeout(() => {
                    window.location.reload(); // Refresh the page to reflect changes
                }, 500); // Add slight delay for the user to read the message
            }
        } catch (error) {
            console.error("Error processing scan:", error);
            messageDiv.textContent = "An error occurred.";
            messageDiv.className = "error";
        }

        isProcessing = false; // Allow the next scan to be processed
    });
});

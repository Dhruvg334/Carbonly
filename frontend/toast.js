/**
 * Toast Alert & Custom Notification System
 */

function showToast(message, type = "success", duration = 3500) {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast-neo toast-neo-${type}`;

    const icon = type === "error" ? "⚠️" : "✅";
    toast.innerHTML = `
        <span>${icon} ${message}</span>
        <span style="cursor:pointer; margin-left: 12px; font-weight:800;" onclick="this.parentElement.remove()">✖</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, duration);
}

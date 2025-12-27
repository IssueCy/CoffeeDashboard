function getOrders() {
    return JSON.parse(localStorage.getItem("orders")) || [];
}

function saveOrders(orders) {
    localStorage.setItem("orders", JSON.stringify(orders));
}

function createOrder(data, save = true) {

    if (save) {
        const orders = getOrders();
        orders.push(data);
        saveOrders(orders);
    }

    const container = document.getElementById("workingContainer");

    if (!container) return;

    const order = document.createElement("div");
    order.classList.add("order");

    order.innerHTML = `
        <strong>${data.amount}x ${data.decaf ? "Decaf" : ""} ${data.drink}</strong>
        <ul>
            <li>${data.milk}</li>
            <li>${data.toGo ? "Out" : "In"}</li>
            ${data.extras ? `<li>${data.extras}</li>` : ""}
        </ul>
    `;

    container.appendChild(order);
    enableSwipeToDelete(order, data);
}

function confirmationForm(drinkName) {
    Swal.fire({
        title: "Bestellung konfigurieren",
        html: `
            <label>Milch</label>
            <select id="milkSelect" class="swal2-input">
                <option value="Vollmilch">Vollmilch</option>
                <option value="Laktosefrei">Laktosefrei</option>
                <option value="Hafermilch">Hafermilch</option>
            </select>

            <label style="margin-top:10px; display:block;">
                <input type="checkbox" id="decaf"> Decaf
            </label>

            <label style="margin-top:10px; display:block;">
                <input type="checkbox" id="inOrOut"> To Go
            </label>

            <label>Extras</label>
            <textarea id="extra" style="height:64px;"></textarea>

            <label style="margin-top:10px;">Anzahl</label>
            <div style="display:flex; justify-content:center; gap:10px;">
                <button type="button" id="minusBtn">−</button>
                <span id="amount">1</span>
                <button type="button" id="plusBtn">+</button>
            </div>
        `,
        confirmButtonText: "Fertig",
        didOpen: () => {
            let amount = 1;
            const amountSpan = document.getElementById("amount");

            document.getElementById("plusBtn").onclick = () => {
                amount++;
                amountSpan.textContent = amount;
            };

            document.getElementById("minusBtn").onclick = () => {
                if (amount > 1) {
                    amount--;
                    amountSpan.textContent = amount;
                }
            };
        },
        preConfirm: () => ({
            drink: drinkName,
            milk: document.getElementById("milkSelect").value,
            decaf: document.getElementById("decaf").checked,
            toGo: document.getElementById("inOrOut").checked,
            extras: document.getElementById("extra").value,
            amount: document.getElementById("amount").textContent
        })
    }).then(result => {
        if (result.isConfirmed) {
            createOrder(result.value);
        }
    });
}

function enableSwipeToDelete(order, orderData) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    order.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    order.addEventListener("touchmove", e => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        order.style.transform = `translateX(${currentX - startX}px)`;
    });

    order.addEventListener("touchend", () => {
        isDragging = false;

        if (currentX - startX > 120) {
            order.style.transform = "translateX(100%)";
            order.style.opacity = "0";

            setTimeout(() => {
                order.remove();

                // 🔥 remove from storage
                let orders = getOrders();
                orders = orders.filter(o =>
                    !(
                        o.drink === orderData.drink &&
                        o.amount === orderData.amount &&
                        o.milk === orderData.milk
                    )
                );
                saveOrders(orders);
            }, 300);
        } else {
            order.style.transform = "translateX(0)";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const orders = getOrders();
    orders.forEach(order => createOrder(order, false));
});

document.querySelectorAll(".select-button").forEach(button => {
    button.addEventListener("click", () => {
        confirmationForm(button.dataset.drink);
    });
});

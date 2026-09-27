document.addEventListener("DOMContentLoaded", () => {

    // ================================
    // DOM Elements
    // ================================

    const expenseForm = document.getElementById("expense-form");

    const expenseList = document.getElementById("expense-list");

    const emptyState = document.getElementById("empty-state");

    const expenseName = document.getElementById("expense-name");

    const expenseAmount = document.getElementById("expense-amount");

    const expenseCategory = document.getElementById("expense-category");

    const expenseDate = document.getElementById("expense-date");

    const filterCategory = document.getElementById("filter-category");

    const searchExpense = document.getElementById("search-expense");

    const totalAmount = document.getElementById("total-amount");

    const expenseCount = document.getElementById("expense-count");

    const averageExpense = document.getElementById("average-expense");

    const formTitle = document.getElementById("form-title");

    const submitBtn = document.getElementById("submit-btn");

    const cancelEditBtn = document.getElementById("cancel-edit-btn");

    const budgetInput = document.getElementById("budget-input");

    const setBudgetBtn = document.getElementById("set-budget-btn");

    const budgetSpent = document.getElementById("budget-spent");

    const budgetTotal = document.getElementById("budget-total");

    const budgetProgress = document.getElementById("budget-progress");

    const budgetMessage = document.getElementById("budget-message");


    // ================================
    // Data
    // ================================

    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    let budget = parseFloat(localStorage.getItem("budget")) || 0;

    let editingId = null;


    // ================================
    // Initial Setup
    // ================================

    const today = new Date().toISOString().split("T")[0];

    expenseDate.value = today;

    if (budget > 0) {
        budgetInput.value = budget;
    }

    displayExpenses();

    updateDashboard();

    updateBudget();


    // ================================
    // Add / Update Expense
    // ================================

    expenseForm.addEventListener("submit", (e) => {

        e.preventDefault();

        const name = expenseName.value.trim();

        const amount = parseFloat(expenseAmount.value);

        const category = expenseCategory.value;

        const date = expenseDate.value;


        if (!name || isNaN(amount) || amount <= 0 || !category || !date) {
            alert("Please enter valid expense details.");
            return;
        }


        // Update existing expense
        if (editingId !== null) {

            const expense = expenses.find(
                expense => expense.id === editingId
            );

            if (expense) {
                expense.name = name;
                expense.amount = amount;
                expense.category = category;
                expense.date = date;
            }

            editingId = null;

            formTitle.textContent = "Add New Expense";

            submitBtn.innerHTML = "<span>＋</span> Add Expense";

            cancelEditBtn.classList.add("hidden");

        }

        // Add new expense
        else {

            const expense = {
                id: Date.now(),
                name: name,
                amount: amount,
                category: category,
                date: date
            };

            expenses.push(expense);
        }


        saveExpenses();

        displayExpenses();

        updateDashboard();

        updateBudget();

        expenseForm.reset();

        expenseDate.value = today;

    });


    // ================================
    // Edit / Delete
    // ================================

    expenseList.addEventListener("click", (e) => {

        const button = e.target.closest("button");

        if (!button) return;


        const id = Number(button.dataset.id);


        // Delete
        if (button.classList.contains("delete-btn")) {

            const confirmDelete = confirm;

            if (!confirmDelete) return;

            expenses = expenses.filter(
                expense => expense.id !== id
            );

            saveExpenses();

            displayExpenses();

            updateDashboard();

            updateBudget();

        }


        // Edit
        if (button.classList.contains("edit-btn")) {

            const expense = expenses.find(
                expense => expense.id === id
            );

            if (!expense) return;


            expenseName.value = expense.name;

            expenseAmount.value = expense.amount;

            expenseCategory.value = expense.category;

            expenseDate.value = expense.date;


            editingId = id;


            formTitle.textContent = "Edit Expense";

            submitBtn.innerHTML = "✓ Update Expense";

            cancelEditBtn.classList.remove("hidden");


            document.querySelector(".form-card").scrollIntoView({
                behavior: "smooth"
            });

            expenseName.focus();

        }

    });


    // ================================
    // Cancel Edit
    // ================================

    cancelEditBtn.addEventListener("click", () => {

        editingId = null;

        expenseForm.reset();

        expenseDate.value = today;

        formTitle.textContent = "Add New Expense";

        submitBtn.innerHTML = "<span>＋</span> Add Expense";

        cancelEditBtn.classList.add("hidden");

    });


    // ================================
    // Search
    // ================================

    searchExpense.addEventListener("input", () => {
        displayExpenses();
    });


    // ================================
    // Category Filter
    // ================================

    filterCategory.addEventListener("change", () => {
        displayExpenses();
    });


    // ================================
    // Set Budget
    // ================================

    setBudgetBtn.addEventListener("click", () => {

        const newBudget = parseFloat(budgetInput.value);


        if (isNaN(newBudget) || newBudget <= 0) {
            alert("Please enter a valid budget greater than 0.");
            return;
        }


        budget = newBudget;

        localStorage.setItem("budget", budget);

        updateBudget();

    });


    // ================================
    // Display Expenses
    // ================================

    function displayExpenses() {

        expenseList.innerHTML = "";


        const searchText = searchExpense.value
            .toLowerCase()
            .trim();

        const selectedCategory = filterCategory.value;


        const filteredExpenses = expenses.filter(expense => {

            const matchesSearch =
                expense.name
                    .toLowerCase()
                    .includes(searchText);


            const matchesCategory =
                selectedCategory === "All" ||
                expense.category === selectedCategory;


            return matchesSearch && matchesCategory;

        });


        // Show newest expenses first
        filteredExpenses.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );


        if (filteredExpenses.length === 0) {

            emptyState.style.display = "block";

            return;

        }


        emptyState.style.display = "none";


        filteredExpenses.forEach(expense => {

            const row = document.createElement("tr");


            row.innerHTML = `
                <td>
                    <strong>${escapeHTML(expense.name)}</strong>
                </td>

                <td>
                    <strong>$${expense.amount.toFixed(2)}</strong>
                </td>

                <td>
                    <span class="category-badge">
                        ${getCategoryIcon(expense.category)}
                        ${escapeHTML(expense.category)}
                    </span>
                </td>

                <td>
                    ${formatDate(expense.date)}
                </td>

                <td>
                    <div class="action-buttons">

                        <button
                            class="edit-btn"
                            data-id="${expense.id}"
                        >
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-btn"
                            data-id="${expense.id}"
                        >
                            🗑️ Delete
                        </button>

                    </div>
                </td>
            `;


            expenseList.appendChild(row);

        });

    }


    // ================================
    // Dashboard
    // ================================

    function updateDashboard() {

        const total = expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );


        const count = expenses.length;


        const average = count > 0
            ? total / count
            : 0;


        totalAmount.textContent = total.toFixed(2);

        expenseCount.textContent = count;

        averageExpense.textContent = average.toFixed(2);

    }


    // ================================
    // Budget
    // ================================

    function updateBudget() {

        const total = expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );


        budgetSpent.textContent = total.toFixed(2);

        budgetTotal.textContent = budget.toFixed(2);


        if (budget <= 0) {

            budgetProgress.style.width = "0%";

            budgetProgress.className = "progress-bar";

            budgetMessage.textContent =
                "Set a budget to start tracking your spending.";

            budgetMessage.style.color = "#6b7280";

            return;

        }


        const percentage = (total / budget) * 100;

        const displayedPercentage = Math.min(percentage, 100);


        budgetProgress.style.width =
            displayedPercentage + "%";


        budgetProgress.className = "progress-bar";


        if (percentage >= 100) {

            budgetProgress.classList.add("danger");

            budgetMessage.textContent =
                `⚠️ You have exceeded your budget by $${(total - budget).toFixed(2)}.`;

            budgetMessage.style.color = "#dc2626";

        }

        else if (percentage >= 80) {

            budgetProgress.classList.add("warning");

            budgetMessage.textContent =
                `⚠️ You have used ${percentage.toFixed(0)}% of your budget.`;

            budgetMessage.style.color = "#d97706";

        }

        else {

            budgetMessage.textContent =
                `✓ You have $${(budget - total).toFixed(2)} remaining.`;

            budgetMessage.style.color = "#059669";

        }

    }


    // ================================
    // Local Storage
    // ================================

    function saveExpenses() {

        localStorage.setItem(
            "expenses",
            JSON.stringify(expenses)
        );

    }


    // ================================
    // Date Formatting
    // ================================

    function formatDate(date) {

        const dateObject = new Date(date + "T00:00:00");

        return dateObject.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

    }


    // ================================
    // Category Icons
    // ================================

    function getCategoryIcon(category) {

        const icons = {
            Food: "🍔",
            Transport: "🚗",
            Entertainment: "🎬",
            Shopping: "🛍️",
            Bills: "💡",
            Other: "📦"
        };

        return icons[category] || "📦";

    }


    // ================================
    // Security Helper
    // ================================

    function escapeHTML(value) {

        const div = document.createElement("div");

        div.textContent = value;

        return div.innerHTML;

    }

});

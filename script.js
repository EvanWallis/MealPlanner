document.addEventListener("DOMContentLoaded", function () {
    let totalCarbs = 3; // Default carb servings (one per meal)
    let sweetTreatUsed = false;

    // Toggle 4th meal visibility
    document.getElementById("toggleFourthMeal").addEventListener("change", function () {
        document.getElementById("meal4").classList.toggle("hidden", !this.checked);
    });

    // Pre-Workout Carb Toggle (+3 Carbs)
    document.getElementById("toggleWorkoutCarbs").addEventListener("change", function () {
        totalCarbs += this.checked ? 3 : -3;
        updateCarbDisplay();
    });

    // Adjust Carbs (Ensuring a meal can’t go negative)
    function adjustCarbs(mealNumber, amount) {
        let mealCarbs = document.querySelector(`#meal${mealNumber} .carbs`);
        let currentCarbs = parseInt(mealCarbs.textContent);

        if (amount > 0 && totalCarbs > 0) {
            mealCarbs.textContent = currentCarbs + 1;
            totalCarbs--;
        } else if (amount < 0 && currentCarbs > 0) {
            mealCarbs.textContent = currentCarbs - 1;
            totalCarbs++;
        }
        updateCarbDisplay();
    }

    // Sweet Treat (-3 Carbs, Once per Day)
    document.getElementById("sweetTreatBtn").addEventListener("click", function () {
        if (!sweetTreatUsed && totalCarbs >= 3) {
            totalCarbs -= 3;
            sweetTreatUsed = true;
            alert("Enjoy your treat! 🍫 (-3 Carbs)");
            updateCarbDisplay();
        } else {
            alert("Not enough carbs left for a sweet treat!");
        }
    });

    // Reset for Next Day (Restores Default Values)
    document.getElementById("resetBtn").addEventListener("click", function () {
        document.querySelectorAll(".protein").forEach(el => el.textContent = "1");
        document.querySelectorAll(".carbs").forEach(el => el.textContent = "1");
        totalCarbs = 3;
        sweetTreatUsed = false;
        document.getElementById("toggleWorkoutCarbs").checked = false;
        document.getElementById("toggleFourthMeal").checked = false;
        document.getElementById("meal4").classList.add("hidden");
        alert("New day, fresh start! ✅");
        updateCarbDisplay();
    });

    function updateCarbDisplay() {
        console.log("Remaining Carbs:", totalCarbs);
    }
});
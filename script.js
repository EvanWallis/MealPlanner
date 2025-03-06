document.addEventListener("DOMContentLoaded", function () {
    const meals = document.querySelectorAll(".meal");
    const sweetTreatBtn = document.getElementById("sweetTreatBtn");
    const resetBtn = document.getElementById("resetBtn");
    const preWorkoutCheckbox = document.getElementById("preWorkoutToggle");
    const fourthMealToggle = document.getElementById("fourthMealToggle");
    const fourthMeal = document.getElementById("meal4");

    let totalCarbs = 0;

    meals.forEach((meal) => {
        const carbsDisplay = meal.querySelector(".carbs-count");
        let carbs = 1; // Default carbs per meal

        // Get buttons
        const addCarbsBtn = meal.querySelector(".add-carbs");
        const subtractCarbsBtn = meal.querySelector(".subtract-carbs");
        const mealCheckbox = meal.querySelector(".meal-checkbox");

        // Add Carbs
        addCarbsBtn.addEventListener("click", function () {
            if (totalCarbs < 10) { // Ensure carbs do not exceed 10
                carbs++;
                totalCarbs++;
                carbsDisplay.textContent = carbs;
            }
        });

        // Subtract Carbs
        subtractCarbsBtn.addEventListener("click", function () {
            if (carbs > 0) {
                carbs--;
                totalCarbs--;
                carbsDisplay.textContent = carbs;
            }
        });

        // Mark meal as completed
        mealCheckbox.addEventListener("change", function () {
            if (this.checked) {
                meal.style.opacity = "0.5"; // Dim the meal when checked
            } else {
                meal.style.opacity = "1";
            }
        });
    });

    // Sweet Treat Button (-3 Carbs)
    sweetTreatBtn.addEventListener("click", function () {
        if (totalCarbs >= 3) {
            totalCarbs -= 3;
            alert("Sweet treat consumed! 3 carbs deducted.");
        } else {
            alert("Not enough carbs available for a sweet treat.");
        }
    });

    // Reset Button
    resetBtn.addEventListener("click", function () {
        meals.forEach((meal) => {
            meal.querySelector(".carbs-count").textContent = "1"; // Reset carbs
            meal.querySelector(".meal-checkbox").checked = false;
            meal.style.opacity = "1";
        });
        totalCarbs = 0;
        preWorkoutCheckbox.checked = false;
        fourthMealToggle.checked = false;
        fourthMeal.style.display = "none";
    });

    // Toggle Fourth Meal
    fourthMealToggle.addEventListener("change", function () {
        if (this.checked) {
            fourthMeal.style.display = "block";
        } else {
            fourthMeal.style.display = "none";
        }
    });
});
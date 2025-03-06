// script.js

// Helper: Get all visible (active) meals
function getActiveMeals() {
    return Array.from(document.querySelectorAll('.meal')).filter(
      meal => !meal.classList.contains('hidden')
    );
  }
  
  // Helper: Get and set carb counts
  function getCarbs(mealElem) {
    return parseInt(mealElem.querySelector('.carbs').textContent, 10);
  }
  function setCarbs(mealElem, value) {
    mealElem.querySelector('.carbs').textContent = value;
  }
  
  /**
   * Adjust a meal's carbs by redistributing from/to other meals.
   * For a positive change (d > 0), 1 carb is removed at a time from other active meals.
   * For a negative change (d < 0), carbs are donated from the target meal to others.
   */
  function adjustMeal(mealNumber, d) {
    const activeMeals = getActiveMeals();
    const targetMeal = document.getElementById(`meal${mealNumber}`);
    if (!targetMeal || targetMeal.classList.contains('hidden')) return;
  
    if (d > 0) {
      let remaining = d;
      let donors = activeMeals.filter(meal => meal !== targetMeal);
      let idx = 0;
      while (remaining > 0 && donors.length) {
        const donor = donors[idx % donors.length];
        const donorCarbs = getCarbs(donor);
        if (donorCarbs > 0) {
          setCarbs(donor, donorCarbs - 1);
          setCarbs(targetMeal, getCarbs(targetMeal) + 1);
          remaining--;
        }
        idx++;
        if (idx > 1000) break;
      }
    } else if (d < 0) {
      let remaining = -d;
      let receivers = activeMeals.filter(meal => meal !== targetMeal);
      let idx = 0;
      while (remaining > 0 && getCarbs(targetMeal) > 0 && receivers.length) {
        const receiver = receivers[idx % receivers.length];
        setCarbs(receiver, getCarbs(receiver) + 1);
        setCarbs(targetMeal, getCarbs(targetMeal) - 1);
        remaining--;
        idx++;
        if (idx > 1000) break;
      }
    }
  }
  
  /**
   * Sweet Treat: Subtract 3 carbs from the overall pool in a round-robin manner.
   */
  function applySweetTreat() {
    const activeMeals = getActiveMeals();
    let totalToSubtract = 3;
    let idx = 0;
    while (totalToSubtract > 0 && activeMeals.length) {
      const meal = activeMeals[idx % activeMeals.length];
      const carbValue = getCarbs(meal);
      if (carbValue > 0) {
        setCarbs(meal, carbValue - 1);
        totalToSubtract--;
      }
      idx++;
      if (idx > 1000) break;
    }
  }
  
  /**
   * Reset all meals to the initial carb value (1) and clear toggles & check-offs.
   */
  function resetMeals() {
    document.querySelectorAll('.meal').forEach(meal => {
      setCarbs(meal, 1);
      meal.classList.remove('completed');
    });
    document.getElementById('toggleFourthMeal').checked = false;
    document.getElementById('toggleWorkoutCarbs').checked = false;
    document.getElementById('meal4').classList.add('hidden');
  }
  
  /**
   * Toggle the "completed" state on a meal to mark it as eaten.
   */
  function checkOffMeal(mealId) {
    const mealElem = document.getElementById(mealId);
    mealElem.classList.toggle('completed');
  }
  
  // Event Listeners
  
  // Toggle Snack (Meal 4) visibility
  document.getElementById('toggleFourthMeal').addEventListener('change', function () {
    const meal4 = document.getElementById('meal4');
    if (this.checked) {
      meal4.classList.remove('hidden');
    } else {
      meal4.classList.add('hidden');
    }
  });
  
  // Pre-Workout Extra Carbs toggle for Meal 1: Simply add or subtract 3 carbs directly.
  document.getElementById('toggleWorkoutCarbs').addEventListener('change', function () {
    const meal1 = document.getElementById('meal1');
    const current = getCarbs(meal1);
    if (this.checked) {
      setCarbs(meal1, current + 3);
    } else {
      setCarbs(meal1, Math.max(0, current - 3));
    }
  });
  
  // Sweet Treat button subtracts 3 carbs overall.
  document.getElementById('sweetTreatBtn').addEventListener('click', function () {
    applySweetTreat();
  });
  
  // Reset button
  document.getElementById('resetBtn').addEventListener('click', function () {
    resetMeals();
  });
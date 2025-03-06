// script.js

// Helper: Get all visible (active) meals that are not completed
function getActiveMeals() {
    return Array.from(document.querySelectorAll('.meal')).filter(
      meal => !meal.classList.contains('hidden') && !meal.classList.contains('completed')
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
    const targetMeal = document.getElementById(`meal${mealNumber}`);
    // If target meal is hidden or completed, do nothing
    if (!targetMeal || targetMeal.classList.contains('hidden') || targetMeal.classList.contains('completed')) return;
  
    // Only consider active (visible and not completed) meals for redistribution
    const activeMeals = Array.from(document.querySelectorAll('.meal')).filter(
      meal => !meal.classList.contains('hidden') && !meal.classList.contains('completed')
    );
    
    if (d > 0) {
      let remaining = d;
      // Donors: any active meal except the target
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
      // Receivers: any active meal except the target
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
   * If the total available carbs (among active meals) is less than 3, deny the sweet treat.
   */
  function applySweetTreat() {
    const activeMeals = getActiveMeals();
    // Calculate total available carbs across all active meals
    const totalActiveCarbs = activeMeals.reduce((sum, meal) => sum + getCarbs(meal), 0);
    if (totalActiveCarbs < 3) {
      alert("Not enough carbs available for a sweet treat!");
      return;
    }
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
      // Re-enable all buttons in the meal if they were disabled
      const buttons = meal.querySelectorAll('button');
      buttons.forEach(btn => {
        btn.disabled = false;
      });
    });
    document.getElementById('toggleFourthMeal').checked = false;
    document.getElementById('toggleWorkoutCarbs').checked = false;
    document.getElementById('meal4').classList.add('hidden');
  }
  
  /**
   * Toggle the "completed" state on a meal to mark it as eaten,
   * and disable/enable its buttons accordingly.
   */
  function checkOffMeal(mealId) {
    const mealElem = document.getElementById(mealId);
    const isCompleted = mealElem.classList.toggle('completed');
    // Disable or re-enable all buttons in this meal based on its state
    const buttons = mealElem.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.disabled = isCompleted;
    });
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
  
  // Pre-Workout Extra Carbs toggle for Meal 1:
  // This toggle simply adds (or subtracts) 3 carbs directly to Meal 1 without redistributing.
  document.getElementById('toggleWorkoutCarbs').addEventListener('change', function () {
    const meal1 = document.getElementById('meal1');
    // If the meal is completed, do nothing
    if (meal1.classList.contains('completed')) return;
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
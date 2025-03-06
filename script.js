// script.js

// --------- State Persistence Helpers ---------

function saveState() {
  const state = {
    meals: {},
    toggles: {}
  };

  // Save state for each meal
  document.querySelectorAll('.meal').forEach(meal => {
    state.meals[meal.id] = {
      carbs: getCarbs(meal),
      completed: meal.classList.contains('completed')
    };
  });

  // Save toggle states
  state.toggles.toggleWorkoutCarbs = document.getElementById('toggleWorkoutCarbs').checked;
  state.toggles.toggleFourthMeal = document.getElementById('toggleFourthMeal').checked;

  localStorage.setItem('mealPlannerState', JSON.stringify(state));
}

function loadState() {
  const stateString = localStorage.getItem('mealPlannerState');
  if (stateString) {
    try {
      const state = JSON.parse(stateString);
      // Restore meal states
      for (const mealId in state.meals) {
        const meal = document.getElementById(mealId);
        if (meal) {
          setCarbs(meal, state.meals[mealId].carbs);
          if (state.meals[mealId].completed) {
            meal.classList.add('completed');
            meal.querySelectorAll('button').forEach(btn => btn.disabled = true);
          } else {
            meal.classList.remove('completed');
            meal.querySelectorAll('button').forEach(btn => btn.disabled = false);
          }
        }
      }
      // Restore toggle states
      const toggleWorkout = document.getElementById('toggleWorkoutCarbs');
      const toggleFourth = document.getElementById('toggleFourthMeal');
      if (state.toggles.toggleWorkoutCarbs !== undefined) {
        toggleWorkout.checked = state.toggles.toggleWorkoutCarbs;
      }
      if (state.toggles.toggleFourthMeal !== undefined) {
        toggleFourth.checked = state.toggles.toggleFourthMeal;
        const meal4 = document.getElementById('meal4');
        if (toggleFourth.checked) {
          meal4.classList.remove('hidden');
        } else {
          meal4.classList.add('hidden');
        }
      }
    } catch (err) {
      console.error('Error loading state:', err);
    }
  }
}

// --------- DOM Helpers ---------

// Returns an array of meals that are visible and not completed
function getActiveMeals() {
  return Array.from(document.querySelectorAll('.meal')).filter(
    meal => !meal.classList.contains('hidden') && !meal.classList.contains('completed')
  );
}

// Get and set carb counts from a meal element
function getCarbs(mealElem) {
  return parseInt(mealElem.querySelector('.carbs').textContent, 10);
}
function setCarbs(mealElem, value) {
  mealElem.querySelector('.carbs').textContent = value;
}

// --------- Meal Functions ---------

/**
 * Adjust a meal's carbs by redistributing from/to other active meals.
 * For a positive change (d > 0), remove carbs from donor meals.
 * For a negative change (d < 0), donate carbs to receiver meals.
 */
function adjustMeal(mealNumber, d) {
  const targetMeal = document.getElementById(`meal${mealNumber}`);
  if (!targetMeal || targetMeal.classList.contains('hidden') || targetMeal.classList.contains('completed')) return;

  const activeMeals = Array.from(document.querySelectorAll('.meal')).filter(
    meal => !meal.classList.contains('hidden') && !meal.classList.contains('completed')
  );

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
  saveState();
}

/**
 * Sweet Treat: Subtract 3 carbs from the overall pool.
 * If total active carbs are less than 3, deny the sweet treat.
 */
function applySweetTreat() {
  const activeMeals = getActiveMeals();
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
  saveState();
}

/**
 * Reset all meals to 1 carb and clear toggles & check-offs.
 */
function resetMeals() {
  document.querySelectorAll('.meal').forEach(meal => {
    setCarbs(meal, 1);
    meal.classList.remove('completed');
    meal.querySelectorAll('button').forEach(btn => btn.disabled = false);
  });
  document.getElementById('toggleFourthMeal').checked = false;
  document.getElementById('toggleWorkoutCarbs').checked = false;
  document.getElementById('meal4').classList.add('hidden');
  saveState();
}

/**
 * Toggle the "completed" state of a meal and disable/enable its buttons.
 */
function checkOffMeal(mealId) {
  const mealElem = document.getElementById(mealId);
  const isCompleted = mealElem.classList.toggle('completed');
  mealElem.querySelectorAll('button').forEach(btn => {
    btn.disabled = isCompleted;
  });
  saveState();
}

// --------- Event Listeners ---------

document.addEventListener('DOMContentLoaded', () => {
  loadState();

  document.getElementById('toggleFourthMeal').addEventListener('change', function () {
    const meal4 = document.getElementById('meal4');
    if (this.checked) {
      meal4.classList.remove('hidden');
    } else {
      meal4.classList.add('hidden');
    }
    saveState();
  });

  document.getElementById('toggleWorkoutCarbs').addEventListener('change', function () {
    const meal1 = document.getElementById('meal1');
    if (meal1.classList.contains('completed')) return;
    const current = getCarbs(meal1);
    if (this.checked) {
      setCarbs(meal1, current + 3);
    } else {
      setCarbs(meal1, Math.max(0, current - 3));
    }
    saveState();
  });

  document.getElementById('sweetTreatBtn').addEventListener('click', function () {
    applySweetTreat();
  });

  document.getElementById('resetBtn').addEventListener('click', function () {
    resetMeals();
  });
});

// --------- Service Worker Registration ---------

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/MealPlanner/service-worker.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
      })
      .catch(function(err) {
        console.log('ServiceWorker registration failed:', err);
      });
  });
}
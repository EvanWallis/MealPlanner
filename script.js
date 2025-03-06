// script.js

// --------- State Persistence Helpers ---------

function saveState() {
  const state = { meals: {} };
  document.querySelectorAll('.meal').forEach(meal => {
    state.meals[meal.id] = {
      carbs: getCarbs(meal),
      protein: getProtein(meal),
      completed: meal.classList.contains('completed')
    };
  });
  localStorage.setItem('mealPlannerState', JSON.stringify(state));
}

function loadState() {
  const stateString = localStorage.getItem('mealPlannerState');
  if (stateString) {
    try {
      const state = JSON.parse(stateString);
      for (const mealId in state.meals) {
        const meal = document.getElementById(mealId);
        if (meal) {
          setCarbs(meal, state.meals[mealId].carbs);
          setProtein(meal, state.meals[mealId].protein);
          if (state.meals[mealId].completed) {
            meal.classList.add('completed');
            meal.querySelectorAll('button').forEach(btn => btn.disabled = true);
          } else {
            meal.classList.remove('completed');
            meal.querySelectorAll('button').forEach(btn => btn.disabled = false);
          }
        }
      }
    } catch (err) {
      console.error('Error loading state:', err);
    }
  }
}

// --------- DOM Helpers ---------

function getCarbs(mealElem) {
  return parseInt(mealElem.querySelector('.carbs').textContent, 10);
}

function setCarbs(mealElem, value) {
  mealElem.querySelector('.carbs').textContent = value;
}

function getProtein(mealElem) {
  return parseInt(mealElem.querySelector('.protein').textContent, 10);
}

function setProtein(mealElem, value) {
  mealElem.querySelector('.protein').textContent = value;
}

// --------- Meal Functions ---------

/**
 * Adjust the carb count for a specific meal while keeping the total constant.
 * For delta > 0, add a carb to the target meal by subtracting 1 from a donor meal.
 * For delta < 0, remove a carb from the target meal by adding 1 to a receiver meal.
 */
function adjustMeal(mealNumber, delta) {
  const targetMeal = document.getElementById(`meal${mealNumber}`);
  if (!targetMeal || targetMeal.classList.contains('completed')) return;
  
  const activeMeals = Array.from(document.querySelectorAll('.meal')).filter(
    meal => !meal.classList.contains('completed')
  );
  
  if (delta > 0) {
    let remaining = delta;
    let donors = activeMeals.filter(meal => meal !== targetMeal && getCarbs(meal) > 0);
    let idx = 0;
    while (remaining > 0 && donors.length > 0) {
      const donor = donors[idx % donors.length];
      const donorCarbs = getCarbs(donor);
      if (donorCarbs > 0) {
        setCarbs(donor, donorCarbs - 1);
        setCarbs(targetMeal, getCarbs(targetMeal) + 1);
        remaining--;
      }
      idx++;
      donors = activeMeals.filter(meal => meal !== targetMeal && getCarbs(meal) > 0);
      if (idx > 1000) break;
    }
  } else if (delta < 0) {
    let remaining = -delta;
    let receivers = activeMeals.filter(meal => meal !== targetMeal);
    let idx = 0;
    while (remaining > 0 && getCarbs(targetMeal) > 0 && receivers.length > 0) {
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
 * Adjust the protein count for a specific meal while keeping the total constant.
 * For delta > 0, add 1 protein to the target meal by subtracting 1 from a donor meal.
 * For delta < 0, remove 1 protein from the target meal by adding 1 to a receiver meal.
 */
function adjustProtein(mealNumber, delta) {
  const targetMeal = document.getElementById(`meal${mealNumber}`);
  if (!targetMeal || targetMeal.classList.contains('completed')) return;
  
  const activeMeals = Array.from(document.querySelectorAll('.meal')).filter(
    meal => !meal.classList.contains('completed')
  );
  
  if (delta > 0) {
    let remaining = delta;
    let donors = activeMeals.filter(meal => meal !== targetMeal && getProtein(meal) > 0);
    let idx = 0;
    while (remaining > 0 && donors.length > 0) {
      const donor = donors[idx % donors.length];
      const donorProtein = getProtein(donor);
      if (donorProtein > 0) {
        setProtein(donor, donorProtein - 1);
        setProtein(targetMeal, getProtein(targetMeal) + 1);
        remaining--;
      }
      idx++;
      donors = activeMeals.filter(meal => meal !== targetMeal && getProtein(meal) > 0);
      if (idx > 1000) break;
    }
  } else if (delta < 0) {
    let remaining = -delta;
    let receivers = activeMeals.filter(meal => meal !== targetMeal);
    let idx = 0;
    while (remaining > 0 && getProtein(targetMeal) > 0 && receivers.length > 0) {
      const receiver = receivers[idx % receivers.length];
      setProtein(receiver, getProtein(receiver) + 1);
      setProtein(targetMeal, getProtein(targetMeal) - 1);
      remaining--;
      idx++;
      if (idx > 1000) break;
    }
  }
  saveState();
}

/**
 * Sweet Treat: Subtract 3 carbs from the overall pool.
 * If total active carbs are less than 3, deny the action.
 */
function applySweetTreat() {
  const activeMeals = Array.from(document.querySelectorAll('.meal')).filter(
    meal => !meal.classList.contains('completed')
  );
  const totalActiveCarbs = activeMeals.reduce((sum, meal) => sum + getCarbs(meal), 0);
  
  if (totalActiveCarbs < 3) {
    alert("Not enough carbs available for a sweet treat!");
    return;
  }
  
  let carbsToSubtract = 3;
  let idx = 0;
  while (carbsToSubtract > 0 && activeMeals.length > 0) {
    const meal = activeMeals[idx % activeMeals.length];
    const carbVal = getCarbs(meal);
    if (carbVal > 0) {
      setCarbs(meal, carbVal - 1);
      carbsToSubtract--;
    }
    idx++;
    if (idx > 1000) break;
  }
  saveState();
}

/**
 * Reset all meals: set each meal to 1 carb and 1 protein and clear any completion.
 */
function resetMeals() {
  document.querySelectorAll('.meal').forEach(meal => {
    setCarbs(meal, 1);
    setProtein(meal, 1);
    meal.classList.remove('completed');
    meal.querySelectorAll('button').forEach(btn => btn.disabled = false);
  });
  saveState();
}

/**
 * Toggle the "completed" state of a meal.
 * If completed, disable its buttons.
 */
function checkOffMeal(mealId) {
  const meal = document.getElementById(mealId);
  if (!meal) return;
  const isCompleted = meal.classList.toggle('completed');
  meal.querySelectorAll('button').forEach(btn => {
    btn.disabled = isCompleted;
  });
  saveState();
}

// --------- Event Listeners ---------

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  
  // Attach event listeners for carb adjustment buttons.
  ['1', '2', '3', '4'].forEach(num => {
    const meal = document.getElementById(`meal${num}`);
    if (meal) {
      const addCarbBtn = meal.querySelector('.add-carbs');
      const subtractCarbBtn = meal.querySelector('.subtract-carbs');
      if (addCarbBtn) {
        addCarbBtn.addEventListener('click', () => adjustMeal(num, 1));
      }
      if (subtractCarbBtn) {
        subtractCarbBtn.addEventListener('click', () => adjustMeal(num, -1));
      }
    }
  });
  
  // Attach event listeners for protein adjustment buttons.
  ['1', '2', '3', '4'].forEach(num => {
    const meal = document.getElementById(`meal${num}`);
    if (meal) {
      const addProteinBtn = meal.querySelector('.add-protein');
      const subtractProteinBtn = meal.querySelector('.subtract-protein');
      if (addProteinBtn) {
        addProteinBtn.addEventListener('click', () => adjustProtein(num, 1));
      }
      if (subtractProteinBtn) {
        subtractProteinBtn.addEventListener('click', () => adjustProtein(num, -1));
      }
    }
  });
  
  // Sweet Treat button event (affects carbs only)
  const sweetTreatBtn = document.getElementById('sweetTreatBtn');
  if (sweetTreatBtn) {
    sweetTreatBtn.addEventListener('click', applySweetTreat);
  }
  
  // Reset button event
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetMeals);
  }
});

// --------- Service Worker Registration ---------

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/MealPlanner/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed:', err);
      });
  });
}
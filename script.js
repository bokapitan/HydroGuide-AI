document.addEventListener('DOMContentLoaded', () => {
    // Get references to the form and display sections
    const form = document.getElementById('hydrationInputForm');
    const dataCollected = document.getElementById('dataCollected');
    const resultDisplay = document.getElementById('resultDisplay');
    const startOverBtn = document.getElementById('startOverBtn'); // New button reference

    // Function to calculate the water goal based on the flowchart logic
    function calculateGoal(weight, age, gender, climate, activity) {
        let goalInOz = 0;

        // A. Base Calculation (For Age >= 14, as per flowchart logic)
        if (age >= 14) {
            if (gender === 'male') {
                goalInOz = weight * 0.67; // Weight * 0.67 for Male
            } else { 
                goalInOz = weight * 0.5;  // Weight * 0.5 for Female
            }
        } else {
            // Simplified baseline for non-adults (outside of target persona)
            goalInOz = 32; 
        }

        // B. Activity Adjustment (Added to Base Result)
        switch (activity) {
            case 'sedentary':
                goalInOz += 6; // Light Activity
                break;
            case 'moderate':
                goalInOz += 12; // Moderate Activity
                break;
            case 'active':
                goalInOz += 24; // High Activity
                break;
        }

        // C. Climate Adjustment (Added to Base Result)
        if (climate === 'hot') {
            goalInOz += 12; // Tropical
        }
        
        return Math.round(goalInOz);
    }


    // --- 1. Form Submission Handler (Calculate) ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Collect the data (F1)
        const weight = parseFloat(document.getElementById('weight').value); 
        const age = parseInt(document.getElementById('age').value); 
        const gender = document.getElementById('gender').value;
        const climate = document.getElementById('climate').value;
        const activity = document.getElementById('activity').value;
        
        // Calculate the Goal (F2)
        const finalGoal = calculateGoal(weight, age, gender, climate, activity);

        // Display Data (F1)
        document.getElementById('outWeight').textContent = weight;
        document.getElementById('outAge').textContent = age;
        document.getElementById('outGender').textContent = gender.charAt(0).toUpperCase() + gender.slice(1);
        document.getElementById('outClimate').textContent = climate.charAt(0).toUpperCase() + climate.slice(1);
        document.getElementById('outActivity').textContent = activity.charAt(0).toUpperCase() + activity.slice(1);

        // Display Goal (F2)
        document.getElementById('outGoal').textContent = finalGoal;

        // Update the UI: Hide the form and show the result sections
        form.classList.add('hidden');
        dataCollected.classList.remove('hidden');
        resultDisplay.classList.remove('hidden');

        console.log("Calculated Daily Goal:", finalGoal, "oz");
    });


    // --- 2. Start Over Button Handler (Reset) ---
    startOverBtn.addEventListener('click', function() {
        // 1. Reset the form fields
        form.reset();
        
        // 2. Update the UI: Show the form and hide the result sections
        form.classList.remove('hidden');
        dataCollected.classList.add('hidden');
        resultDisplay.classList.add('hidden');
    });
});
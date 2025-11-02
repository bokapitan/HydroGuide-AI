# 💧 HydroGuide AI: Product Requirements Document (PRD)

## 1. Executive Summary

| Requirement | Details |
| :--- | :--- |
| **Elevator Pitch** | HydroGuide AI is a **personalized digital tool** that calculates an individual's optimal daily water intake based on their specific physical data and activity level, moving beyond the generic "8 glasses a day" rule. It then recommends the perfect water bottle to meet that calculated need, making proper hydration effortless and highly personalized. |
| **Core Problem Solved** | The core problem is that people aren't drinking enough water because they lack **accurate, personalized guidance** on how much they actually need, leading to suboptimal health and fitness outcomes. |

---

## 2. Problem Statement & Opportunity

### The Problem: The '8 Glasses' Myth and Dehydration
The prevailing, one-size-fits-all advice to drink "eight 8-ounce glasses of water" is **fundamentally flawed** because hydration needs are highly variable. Factors like **body weight, climate, age, and physical activity** all drastically influence required water intake. This generic advice leaves many people **chronically under-hydrated** (or, less commonly, over-hydrated) because they don't know their personal target.

### Why This Matters (Impact)
Chronic, mild dehydration negatively impacts **concentration, energy levels, physical performance, and overall health** (e.g., increased risk of kidney stones). This problem affects nearly everyone, especially those who are **health and fitness-oriented** but struggle to meet their specific hydration goals. The impact is a constant, low-grade drag on daily life and an obstacle to achieving fitness milestones.

### Current Alternatives and Their Shortcomings
* **Generic Health Advice (e.g., "8 glasses"):** Inaccurate and leads to guesswork.
* **Basic Hydration Apps:** Often rely on generic formulas or require constant, manual tracking, leading to high user fatigue and abandonment.
* **Fitness Trackers (Wearables):** They can track water *consumed* if manually logged, but **do not provide the personalized target calculation** that defines the goal in the first place.

### The Opportunity
There is a clear market need for an **AI-assisted product** that uses a robust, multifactorial model to provide a **highly accurate, personalized daily water goal** and removes the friction of meeting that goal by proactively suggesting the right tools (water bottles).

---

## 3. Target Users & User Personas

The initial target segment is **health and fitness-oriented adults (age 25-45)** who are already tracking some aspect of their health (e.g., workouts, diet) and are actively looking for ways to **optimize their physical performance and energy**.

### User Persona 1: "Marcia the Marathoner"
* **Who:** Marcia, a 32-year-old marketing manager who trains for half-marathons.
* **Needs & Context:** She tracks her runs, uses a fitness app, and is meticulous about her diet. She knows **hydration is key** but struggles to calculate her needs, especially on long-run days or during hot weather training. She worries about cramping and hitting "the wall."
* **Why HydroGuide AI:** She needs a tool that accounts for her **intense activity level and environmental factors** (e.g., heat/humidity) to give her an **exact, reliable fluid goal** for that specific day, ensuring peak performance and recovery.

### User Persona 2: "Ben the Biohacker"
* **Who:** Ben, a 40-year-old software developer interested in cognitive enhancement and productivity.
* **Needs & Context:** Ben uses smart devices and apps to optimize sleep and focus. He realizes that even mild dehydration causes a drop in his **work focus and energy**. He wants an accurate, set-it-and-forget-it goal he can reliably hit every day to maintain peak cognitive function.
* **Why HydroGuide AI:** He needs the **science-backed calculator** to move beyond generic advice and establish a data-driven hydration baseline that supports his cognitive performance goals.

---

## 4. MVP Feature Specifications

| # | Feature Name | User Story | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **F1** | **Personalized Calculation Input** | As a **new user**, I want to **input my weight, age, climate, and activity level** so that the system has the **initial data** to calculate my hydration goal. | The system accepts and stores the user's **Body Weight ($\text{kg}/\text{lb}$), Age (yrs), Climate (Hot/Moderate/Cold), and Activity Level (Sedentary/Moderate/Active)** in a profile. |
| **F2** | **Dynamic Water Goal Calculator** | As a **health-focused user**, I want a **daily optimal water goal** outputted based on my input criteria so that I know exactly **how much I need to drink** to be optimally hydrated. | The system outputs a **personalized water intake goal** ($\text{in } \text{mL}/\text{oz}$) using a **multi-factor formula** (e.g., weight-based baseline + activity multiplier + climate modifier) and displays it prominently on the main screen. |
| **F3** | **Water Bottle Capacity Recommendation** | As a **user with a defined water goal**, I want to receive a **suggested water bottle capacity** so that I can buy a bottle that **matches my calculated daily need**. | The system suggests an **ideal bottle capacity** (e.g., 24 oz, 32 oz, 64 oz) that divides into the daily goal a **manageable number of times** (e.g., 2-4 refills/day). |
| **F4** | **Basic Hydration Tracking** | As a **motivated user**, I want to be able to **manually input my daily water consumption** so that I can visually track my progress toward my personalized goal. | The user can tap a button to log a pre-set amount (e.g., the suggested bottle capacity) and see a **simple visual indicator** (e.g., a percentage bar) update in real-time. |

---

## 5. Future Roadmap

### Weeks 2-3 Features: Deeper Personalization & Recommendations
* **Advanced Activity Input:** Allow users to connect a fitness tracker (e.g., Google Fit, Apple Health) or manually input **workout duration/intensity** to dynamically adjust the daily water goal.
* **External Product Integration:** Implement the "Recommendations for specific water bottles" feature by setting up **affiliate links** and detailed product pages for 3-5 specific, vetted bottle models that match the user's recommended capacity.
* **Urine Color Feedback:** Add an optional manual input where a user logs their **urine color** (using a simple visual scale) to give the AI an additional data point for fine-tuning the goal.

### Weeks 4-6 Features: Engagement & Retention
* **Smart Reminders:** Allow users to set **AI-optimized, personalized push notifications** (e.g., "Time to refill your 32 oz bottle!") based on their daily goal, typical wake/sleep times, and past logging habits.
* **Habit Gamification:** Implement **streaks and small badges** (e.g., "7-Day Hydration Hero") to reward consistent logging and goal achievement and increase retention.
* **Dietary Hydration Accounting:** Allow users to input consumption of common hydrating foods/beverages (e.g., coffee, tea, soup) to adjust the total required water intake for a more accurate net goal.

---

## 6. Success Metrics (Key Performance Indicators)

| # | Success Metric | Rationale |
| :--- | :--- | :--- |
| **SM1** | **Goal Achievement Rate** | Measures the product's effectiveness: **Percentage of active users** who hit their personalized daily water goal **4 or more days per week**. |
| **SM2** | **Weekly Active Users (WAU)** | Measures core engagement and utility: The **total count of unique users** who open the app and log water at least once during a 7-day period. |
| **SM3** | **Feature Conversion Rate (Bottle Recs)** | Measures the commercial viability and usefulness of the recommendation feature: **Percentage of users** who click on a recommended water bottle product link. |
| **SM4** | **Retention Rate (D7)** | Measures user stickiness: **Percentage of first-time users** who are still active seven days after their first log. |

---

## 7. Open Questions

1.  **Water Goal Calculation Model:** **How will we calculate the initial personalized water goal?** Which scientific model (e.g., factors, coefficients, minimums) will form the core of our algorithm, and how will it be dynamically weighted by the AI (e.g., weight vs. activity level)?
2.  **Water Bottle Recommendation Strategy:** **How will we decide which specific water bottles to recommend (and why)?** Should we prioritize capacity, material, price, lifestyle (e.g., gym vs. office), or highest affiliate commission?
3.  **Onboarding Experience:** **What is the minimum amount of data we *must* collect from the user** during the first 30 seconds of onboarding to deliver the first goal, and what data can we defer?
4.  **Monetization Strategy:** **Will we monetize with affiliate commissions** on the water bottle recommendations, or will we introduce a **premium subscription** for advanced features (e.g., smart reminders, advanced tracking)?
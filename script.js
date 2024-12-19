// ======================
// Typing Test Application
// ======================

// ----------------------
// 1. Data and Configuration
// ----------------------

// Array of paragraphs for the typing test
const paragraphs = [
    "The sun was setting behind the mountains, casting long shadows across the valley below. In the distance, a flock of birds soared gracefully through the orange-tinted sky, their silhouettes dancing against the backdrop of twilight. The gentle breeze carried the sweet scent of wildflowers, while crickets began their evening symphony.",
    "Technology continues to evolve at an unprecedented pace, transforming the way we live, work, and interact with one another. From artificial intelligence and machine learning to quantum computing and biotechnology, these innovations are reshaping our understanding of what's possible. As we stand on the brink of new discoveries, it's crucial to consider both the benefits and challenges that come with such rapid advancement.",
    "In the heart of the ancient forest stood a magnificent oak tree, its branches reaching toward the heavens like ancient fingers seeking the stars. Generations of creatures had called this tree home, from the smallest insects to families of owls that nested in its hollow spaces. The tree had witnessed centuries of changes, standing strong through storms and seasons.",
    "The art of cooking is a beautiful blend of science and creativity, where precise measurements meet intuitive flavoring. Master chefs spend years perfecting their techniques, understanding how different ingredients interact, and learning to balance tastes and textures. The kitchen becomes a laboratory where experiments lead to culinary masterpieces that delight both the palate and the soul.",
    "Deep beneath the ocean's surface lies a world of wonder that few humans have ever witnessed. Bioluminescent creatures create their own light in the darkness, while intricate coral reefs form underwater cities teeming with life. Marine biologists continue to discover new species in these unexplored depths, reminding us how much we still have to learn about our planet.",
    "The history of human civilization is a tapestry woven with countless stories of triumph and tragedy, innovation and tradition, war and peace. Each generation builds upon the knowledge of those who came before, contributing their own chapter to the ongoing narrative of human progress. Through studying our past, we gain insights that help shape our future.",
    "Mathematics is the universal language that describes the fundamental patterns of the universe. From the spiral of a galaxy to the structure of a seashell, mathematical principles underlie the very fabric of reality. Scientists and mathematicians continue to uncover new relationships and patterns, expanding our understanding of this elegant language.",
    "The process of writing is both an art and a discipline, requiring creativity, technical skill, and persistent dedication. Authors must carefully craft each sentence, considering rhythm, tone, and impact while maintaining clarity and coherence. Through revision and refinement, rough ideas are transformed into polished prose that can move, inform, or inspire readers."
];

// ----------------------
// 2. DOM Elements Selection
// ----------------------

// Selecting HTML elements to interact with
const typingText = document.querySelector(".typing-text p");
const inputField = document.querySelector("#input-field");
const timerElement = document.querySelector("#timer");
const wpmElement = document.querySelector("#wpm");
const cpmElement = document.querySelector("#cpm");
const accuracyElement = document.querySelector("#accuracy");
const tryAgainButton = document.querySelector("#try-again");
const timeButtons = document.querySelectorAll(".time-btn");
const progressBar = document.getElementById('progress');
const personalBestElement = document.querySelector("#personal-best");
const correctionLockToggle = document.querySelector("#correction-lock");

// ----------------------
// 3. Game Variables
// ----------------------

// Variables to track game state
let maxTime = 60; // Maximum time for the typing test (in seconds)
let timeLeft = maxTime; // Time left in the current session
let charIndex = 0; // Current character index in the paragraph
let mistakes = 0; // Count of mistakes made during typing
let isTyping = false; // Flag to check if typing has started
let timer = null; // Timer reference for countdown
let personalBest = localStorage.getItem('personalBest') || 0; // Retrieve personal best from local storage

// ----------------------
// 4. Core Functions
// ----------------------

/**
 * Loads a random paragraph from the paragraphs array and displays it.
 */
function loadParagraph() {
    const ranIndex = Math.floor(Math.random() * paragraphs.length); // Select a random paragraph
    typingText.innerHTML = ""; // Clear any existing text

    // Split the selected paragraph into characters and wrap each in a <span>
    paragraphs[ranIndex].split("").forEach(char => {
        typingText.innerHTML += `<span>${char}</span>`;
    });

    typingText.querySelectorAll("span")[0].classList.add("active"); // Highlight the first character

    // Focus the input field when the user starts typing or clicks on the text
    document.addEventListener("keydown", () => inputField.focus());
    typingText.addEventListener("click", () => inputField.focus());
}

/**
 * Updates the personal best WPM if the current WPM exceeds it.
 * @param {number} wpm - The current words per minute.
 */
function updatePersonalBest(wpm) {
    if (wpm > personalBest) {
        personalBest = wpm;
        localStorage.setItem('personalBest', wpm);
        personalBestElement.textContent = wpm;
    }
}

/**
 * Handles the typing logic, updating character classes, tracking progress, and calculating stats.
 */
function initTyping() {
    const characters = typingText.querySelectorAll("span"); // All character spans
    const typedValue = inputField.value; // Current value in the input field
    const currentLength = typedValue.length; // Number of characters typed so far

    // Continue only if there are characters left and time is remaining
    if (currentLength <= characters.length && timeLeft > 0) {
        // Start the timer on the first keystroke
        if (!isTyping) {
            timer = setInterval(initTimer, 1000);
            isTyping = true;

            // Disable the correction lock toggle once typing starts
            correctionLockToggle.disabled = true;
            correctionLockToggle.parentElement.style.opacity = "0.5";
            correctionLockToggle.parentElement.style.pointerEvents = "none";

            // Add 'correction-locked' class if the toggle is enabled
            if (correctionLockToggle.checked) {
                inputField.classList.add('correction-locked');
            }
        }

        // Prevent user from deleting characters if correction lock is enabled
        if (correctionLockToggle.checked && currentLength < charIndex) {
            inputField.value = typedValue.slice(0, charIndex); // Restore the previous valid input
            return; // Exit the function to prevent further processing
        }

        requestAnimationFrame(() => {
            // Update character classes based on user input
            for (let i = 0; i < characters.length; i++) {
                if (i < currentLength) {
                    const typedChar = typedValue[i];
                    if (characters[i].innerText === typedChar) {
                        characters[i].classList.add("correct");
                        characters[i].classList.remove("incorrect", "active");
                    } else {
                        characters[i].classList.add("incorrect");
                        characters[i].classList.remove("correct", "active");
                    }
                } else {
                    characters[i].classList.remove("correct", "incorrect", "active");
                }
            }

            // Highlight the current character
            if (currentLength < characters.length) {
                characters[currentLength].classList.add("active");
                autoScroll(); // Ensure the active character is visible
            }

            // Calculate the number of mistakes made so far
            mistakes = 0;
            for (let i = 0; i < currentLength; i++) {
                if (characters[i].classList.contains("incorrect")) {
                    mistakes++;
                }
            }

            charIndex = currentLength; // Update the character index

            // Calculate statistics
            let wpm = Math.round((((charIndex - mistakes) / 5) / (maxTime - timeLeft)) * 60);
            wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;

            const cpm = Math.max(0, charIndex - mistakes); // Characters per minute
            const accuracy = charIndex > 0 ? Math.round(((charIndex - mistakes) / charIndex) * 100) : 0; // Accuracy percentage

            // Update the UI with the calculated stats
            wpmElement.innerText = wpm;
            cpmElement.innerText = cpm;
            accuracyElement.innerText = `${accuracy}%`;

            // Update the progress bar
            const progress = (charIndex / characters.length) * 100;
            progressBar.style.width = `${progress}%`;

            // Check if the typing test is complete
            if (charIndex >= characters.length) {
                clearInterval(timer); // Stop the timer
                inputField.disabled = true; // Disable the input field
                updatePersonalBest(wpm); // Update personal best if applicable
            }
        });
    }
}

/**
 * Handles the countdown timer for the typing test.
 */
function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timerElement.innerText = `${timeLeft}s`;
        if (timeLeft === 0) {
            clearInterval(timer); // Stop the timer when time is up
            inputField.disabled = true; // Disable the input field
            const finalWpm = parseInt(wpmElement.textContent);
            updatePersonalBest(finalWpm); // Update personal best if applicable

            // Remove the active class from all characters
            const characters = typingText.querySelectorAll("span");
            characters.forEach(span => span.classList.remove("active"));
        }
    }
}

/**
 * Resets the game to its initial state, allowing the user to try again.
 */
function resetGame() {
    loadParagraph(); // Load a new paragraph
    clearInterval(timer); // Clear any existing timer
    timeLeft = maxTime; // Reset the time left
    charIndex = 0; // Reset the character index
    mistakes = 0; // Reset the mistake count
    isTyping = false; // Reset the typing flag
    inputField.value = ""; // Clear the input field
    inputField.disabled = false; // Enable the input field
    timerElement.innerText = `${timeLeft}s`; // Reset the timer display
    wpmElement.innerText = 0; // Reset WPM display
    cpmElement.innerText = 0; // Reset CPM display
    accuracyElement.innerText = "0%"; // Reset accuracy display
    progressBar.style.width = '0%'; // Reset progress bar
    personalBestElement.textContent = personalBest; // Update personal best display
    correctionLockToggle.disabled = false; // Enable the correction lock toggle
    correctionLockToggle.parentElement.style.opacity = "1"; // Reset toggle opacity
    correctionLockToggle.parentElement.style.pointerEvents = "auto"; // Enable toggle interaction
    inputField.classList.remove('correction-locked'); // Remove correction-locked class
}

/**
 * Sets the time for the typing test based on user selection.
 * @param {number} seconds - The time in seconds for the typing test.
 */
function setTime(seconds) {
    if (!isTyping) {
        maxTime = seconds; // Update the maximum time
        timeLeft = seconds; // Reset the time left
        timerElement.innerText = `${timeLeft}s`; // Update the timer display

        // Highlight the selected time button
        timeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.time) === seconds) {
                btn.classList.add('active');
            }
        });
    }
}

// ----------------------
// 5. Event Listeners
// ----------------------

/**
 * Initializes all event listeners for user interactions.
 */
function initEventListeners() {
    let lastValidValue = ''; // Variable to store the last valid input value

    // Handle input events in the textarea
    inputField.addEventListener("input", (e) => {
        if (correctionLockToggle.checked && isTyping) {
            // Prevent the text from being shorter than expected (disallow deletions)
            if (e.target.value.length < charIndex) {
                inputField.value = lastValidValue; // Restore the last valid input
                // Force cursor to the end
                requestAnimationFrame(() => {
                    inputField.setSelectionRange(lastValidValue.length, lastValidValue.length);
                });
                return; // Exit the function to prevent further processing
            }
            lastValidValue = e.target.value; // Update the last valid input
        }
        initTyping(); // Call the typing function
    });

    // Keep the cursor at the end of the text
    inputField.addEventListener("selectionchange", () => {
        if (correctionLockToggle.checked && isTyping) {
            const len = inputField.value.length;
            inputField.setSelectionRange(len, len); // Move cursor to the end
        }
    });

    // Prevent Backspace and Delete keys if correction lock is enabled
    inputField.addEventListener("keydown", (e) => {
        if (correctionLockToggle.checked && isTyping) {
            if (e.key === "Backspace" || e.key === "Delete") {
                e.preventDefault(); // Prevent the default action
                const len = inputField.value.length;
                inputField.setSelectionRange(len, len); // Move cursor to the end
            }
        }
    });

    // Handle mobile-specific input (e.g., virtual keyboards)
    inputField.addEventListener("beforeinput", (e) => {
        if (correctionLockToggle.checked && isTyping) {
            if (e.inputType.includes('delete') || e.inputType.includes('backward')) {
                e.preventDefault(); // Prevent deletion actions
                const len = inputField.value.length;
                inputField.setSelectionRange(len, len); // Move cursor to the end
            }
        }
    });

    // Prevent pasting text into the textarea
    inputField.addEventListener("paste", (e) => {
        e.preventDefault(); // Disallow pasting
    });

    // Disable text selection and manipulation on mobile devices
    inputField.addEventListener("touchstart", (e) => {
        if (correctionLockToggle.checked && isTyping) {
            inputField.setAttribute('readonly', 'readonly'); // Temporarily make input readonly
            setTimeout(() => {
                inputField.removeAttribute('readonly'); // Remove readonly after touch
                inputField.setSelectionRange(inputField.value.length, inputField.value.length); // Move cursor to the end
            }, 0);
        }
    });

    // Prevent cutting text from the textarea
    inputField.addEventListener("cut", (e) => {
        if (correctionLockToggle.checked && isTyping) {
            e.preventDefault(); // Disallow cutting text
        }
    });

    // Save the state of the correction lock toggle to local storage
    correctionLockToggle.addEventListener('change', () => {
        localStorage.setItem('correctionLock', correctionLockToggle.checked);
    });
}

// ----------------------
// 6. Utility Functions
// ----------------------

/**
 * Automatically scrolls the typing text container to keep the active character in view.
 */
function autoScroll() {
    const activeChar = typingText.querySelector("span.active");
    if (!activeChar) return;

    const container = document.querySelector(".typing-text");
    const containerRect = container.getBoundingClientRect();
    const activeRect = activeChar.getBoundingClientRect();

    // Define a threshold to decide when to scroll
    const threshold = containerRect.height * 0.7; // 70% of the container height
    const relativePosition = activeRect.top - containerRect.top;

    if (relativePosition > threshold) {
        container.scrollTop += activeRect.height + 5; // Scroll down to keep the active character visible
    }
}

// ----------------------
// 7. Initialization
// ----------------------

// Load the initial paragraph
loadParagraph();

// Initialize all event listeners
initEventListeners();

// Add click event to the "Try Again" button to reset the game
tryAgainButton.addEventListener("click", resetGame);

// Add click events to time buttons to set the test duration
timeButtons.forEach(btn => {
    btn.addEventListener('click', () => setTime(parseInt(btn.dataset.time)));
});

// Set the default time to 60 seconds
setTime(60);

// Populate the personal best on page load and set the toggle state based on local storage
document.addEventListener('DOMContentLoaded', () => {
    personalBestElement.textContent = personalBest; // Display the personal best WPM
    const savedLockState = localStorage.getItem('correctionLock'); // Retrieve the saved toggle state
    if (savedLockState !== null) {
        correctionLockToggle.checked = savedLockState === 'true'; // Set the toggle based on saved state
    }
});
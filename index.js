const typingText = document.querySelector(".typing-text p");
const inputField = document.querySelector(".input-field");
const resetButton = document.querySelector("#reset-button");
const timeTag = document.querySelector("#time");
const mistakeTag = document.querySelector("#mistakes");
const wpmTag = document.querySelector("#wpm");
const cpmTag = document.querySelector("#cpm");
const liveDisplay = document.querySelector("#live-display");

let timer;
let maxTime = 60;
let timeLeft = maxTime;
let charIndex = 0;
let mistakes = 0;
let totalTyped = 0; // Total characters typed
let isTyping = false;

async function fetchRandomWords() {
    try {
        const response = await fetch("https://random-word-api.herokuapp.com/word?number=20");
        const words = await response.json();
        return words.join(" "); // Combine words into a sentence
    } catch (error) {
        console.error("Error fetching random words:", error);
        return "Error fetching random words. Please check your connection.";
    }
}

async function loadParagraph() {
    const paragraph = await fetchRandomWords();
    typingText.innerHTML = "";
    paragraph.split("").forEach(char => {
        let span = `<span>${char}</span>`;
        typingText.innerHTML += span;
    });
    typingText.querySelector("span").classList.add("active");
    charIndex = 0;
    inputField.value = "";
    liveDisplay.innerHTML = ""; // Clear the live display
}

function updateLiveDisplay(characters) {
    let liveText = "";
    characters.forEach((char, index) => {
        if (index < charIndex) {
            liveText += `<span class="${char.className}">${char.innerText}</span>`;
        } else {
            liveText += `<span>${char.innerText}</span>`;
        }
    });
    liveDisplay.innerHTML = liveText;
}

async function checkCompletion() {
    const characters = typingText.querySelectorAll("span");
    if (charIndex === characters.length) {
        totalTyped += characters.length; // Add current paragraph's characters
        await loadParagraph(); // Load new paragraph
    }
}

function initTyping() {
    const characters = typingText.querySelectorAll("span");
    const typedChar = inputField.value.split("")[charIndex];

    if (timeLeft > 0) {
        if (!isTyping) {
            timer = setInterval(initTimer, 1000);
            isTyping = true;
        }

        if (typedChar == null) { // Backspace
            if (charIndex > 0) {
                charIndex--;
                if (characters[charIndex].classList.contains("incorrect")) {
                    mistakes--;
                }
                characters[charIndex].classList.remove("correct", "incorrect", "red-underline");
            }
        } else {
            if (characters[charIndex].innerText === typedChar) {
                characters[charIndex].classList.add("correct");
                characters[charIndex].classList.remove("red-underline");
            } else {
                mistakes++;
                characters[charIndex].classList.add("incorrect", "red-underline");
            }
            charIndex++;
        }

        updateLiveDisplay(characters); // Update live display

        characters.forEach(span => span.classList.remove("active"));
        if (charIndex < characters.length) {
            characters[charIndex].classList.add("active");
        }

        let wpm = Math.round(((totalTyped + charIndex - mistakes) / 5) / (maxTime - timeLeft) * 60);
        wpmTag.innerText = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
        mistakeTag.innerText = mistakes;
        cpmTag.innerText = totalTyped + charIndex - mistakes;

        checkCompletion(); // Check if the paragraph is completed
    } else {
        clearInterval(timer);
        showResults(); // Show results at the end of the timer
    }
}

function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timeTag.innerText = timeLeft;
    } else {
        clearInterval(timer);
    }
}

function showResults() {
    inputField.value = ""; // Disable further input
    inputField.setAttribute("disabled", true); // Disable input field
    alert(`Time's up! Your results:
    - Words Per Minute (WPM): ${wpmTag.innerText}
    - Characters Per Minute (CPM): ${cpmTag.innerText}
    - Total Mistakes: ${mistakeTag.innerText}`);
}

function resetGame() {
    clearInterval(timer);
    timeLeft = maxTime;
    charIndex = 0;
    mistakes = 0;
    totalTyped = 0;
    timeTag.innerText = timeLeft;
    wpmTag.innerText = 0;
    mistakeTag.innerText = 0;
    cpmTag.innerText = 0;
    inputField.removeAttribute("disabled");
    inputField.value = "";
    isTyping = false;
    loadParagraph();
}

// Load the initial paragraph
loadParagraph();
inputField.addEventListener("input", initTyping);
resetButton.addEventListener("click", resetGame);

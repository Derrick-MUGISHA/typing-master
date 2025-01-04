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
let isTyping = false;

async function fetchRandomWords() {
    try {
        const response = await fetch("https://random-word-api.herokuapp.com/word?number=10");
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
    inputField.value = "";
    inputField.focus();
    liveDisplay.innerHTML = ""; // Clear the live display
    timeLeft = maxTime;
    charIndex = mistakes = 0;
    timeTag.innerText = timeLeft;
    mistakeTag.innerText = mistakes;
    wpmTag.innerText = 0;
    cpmTag.innerText = 0;
    clearInterval(timer);
    isTyping = false;
}

function initTyping() {
    const characters = typingText.querySelectorAll("span");
    const typedChar = inputField.value.split("")[charIndex];
    let liveText = ""; // To build the live display content

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

        characters.forEach((char, index) => {
            if (index < charIndex) {
                liveText += `<span class="${char.className}">${char.innerText}</span>`;
            } else {
                liveText += `<span>${char.innerText}</span>`;
            }
        });

        liveDisplay.innerHTML = liveText; // Update the live display

        characters.forEach(span => span.classList.remove("active"));
        if (charIndex < characters.length) {
            characters[charIndex].classList.add("active");
        }

        let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 60);
        wpmTag.innerText = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
        mistakeTag.innerText = mistakes;
        cpmTag.innerText = charIndex - mistakes;
    } else {
        clearInterval(timer);
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

function resetGame() {
    loadParagraph();
}

loadParagraph();
inputField.addEventListener("input", initTyping);
resetButton.addEventListener("click", resetGame);

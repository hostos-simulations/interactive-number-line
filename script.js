document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const sandboxModeBtn = document.getElementById('sandbox-mode-btn');
    const quizModeBtn = document.getElementById('quiz-mode-btn');
    const sandboxView = document.getElementById('sandbox-mode-view');
    const quizView = document.getElementById('quiz-mode-view');
    
    // Sandbox elements
    const startNumberInput = document.getElementById('start-number');
    const addNumberInput = document.getElementById('add-number');
    const visualizeBtn = document.getElementById('visualize-btn');
    
    // Quiz elements
    const questionTextEl = document.getElementById('quiz-question-text');
    const feedbackEl = document.getElementById('feedback-message');
    const answerInput = document.getElementById('answer-input');
    const checkAnswerBtn = document.getElementById('check-answer-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    
    // Shared elements
    const equationEl = document.getElementById('equation');
    const explanationEl = document.getElementById('explanation-text');
    const numberLineEl = document.getElementById('number-line');
    const numberLineContainer = document.getElementById('number-line-container');

    // --- State Variable ---
    let quizState = { num1: 0, num2: 0, correctAnswer: 0 };

    // --- Mode Switching Logic ---
    sandboxModeBtn.addEventListener('click', () => switchMode('sandbox'));
    quizModeBtn.addEventListener('click', () => switchMode('quiz'));

    function switchMode(mode) {
        if (mode === 'sandbox') {
            sandboxModeBtn.classList.add('active');
            quizModeBtn.classList.remove('active');
            sandboxView.classList.remove('hidden');
            quizView.classList.add('hidden');
            clearDisplays();
            runSandbox();
        } else { // quiz mode
            quizModeBtn.classList.add('active');
            sandboxModeBtn.classList.remove('active');
            quizView.classList.remove('hidden');
            sandboxView.classList.add('hidden');
            clearDisplays();
            startNewQuestion();
        }
    }
    
    function clearDisplays() {
        equationEl.innerHTML = '';
        explanationEl.innerHTML = '';
        explanationEl.classList.add('hidden');
        numberLineEl.innerHTML = '';
        feedbackEl.innerHTML = '';
    }

    // --- Sandbox Mode Logic ---
    function runSandbox() {
        const startNumber = Number(startNumberInput.value);
        const addNumber = Number(addNumberInput.value);
        if (isNaN(startNumber) || isNaN(addNumber)) return;
        
        const result = startNumber + addNumber;
        const formattedAddNumber = addNumber >= 0 ? addNumber.toLocaleString() : `(${addNumber.toLocaleString()})`;
        
        equationEl.innerHTML = `${startNumber.toLocaleString()} + ${formattedAddNumber} = <strong>${result.toLocaleString()}</strong>`;
        generateExplanation(startNumber, addNumber, result);
        updateNumberLine(startNumber, addNumber, result);
    }

    // --- Quiz Mode Logic ---
    function generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function startNewQuestion() {
        quizState.num1 = generateRandomNumber(-75, 75);
        do {
            quizState.num2 = generateRandomNumber(-75, 75);
        } while (quizState.num2 === 0);

        quizState.correctAnswer = quizState.num1 + quizState.num2;
        
        const formattedNum2 = quizState.num2 > 0 ? quizState.num2 : `(${quizState.num2})`;
        questionTextEl.textContent = `What is ${quizState.num1} + ${formattedNum2}?`;
        
        clearDisplays();
        answerInput.value = '';
        answerInput.disabled = false;
        checkAnswerBtn.classList.remove('hidden');
        nextQuestionBtn.classList.add('hidden');
        answerInput.focus();
    }

    function checkAnswer() {
        const userAnswer = Number(answerInput.value);
        if (answerInput.value === '' || isNaN(userAnswer)) {
            feedbackEl.textContent = "Please enter a valid number.";
            feedbackEl.className = 'feedback incorrect';
            return;
        }

        if (userAnswer === quizState.correctAnswer) {
            feedbackEl.textContent = "Correct!";
            feedbackEl.className = 'feedback correct';
            answerInput.disabled = true;
            checkAnswerBtn.classList.add('hidden');
            nextQuestionBtn.classList.remove('hidden');
            
            const formattedAddNumber = quizState.num2 >= 0 ? quizState.num2.toLocaleString() : `(${quizState.num2.toLocaleString()})`;
            equationEl.innerHTML = `${quizState.num1.toLocaleString()} + ${formattedAddNumber} = <strong>${quizState.correctAnswer.toLocaleString()}</strong>`;
            
            generateExplanation(quizState.num1, quizState.num2, quizState.correctAnswer);
            updateNumberLine(quizState.num1, quizState.num2, quizState.correctAnswer);

        } else {
            feedbackEl.textContent = "Not quite, try again!";
            feedbackEl.className = 'feedback incorrect';
        }
    }

    // --- Explanation Generator ---
    function generateExplanation(start, add, res) {
        const direction = add >= 0 ? 'right' : 'left';
        const numberType = add >= 0 ? 'positive' : 'negative';
        
        explanationEl.innerHTML = `
            <p>1. We start at <strong>${start.toLocaleString()}</strong> on the number line.</p>
            <p>2. Because we are adding a <em>${numberType}</em> number, we move <strong>${Math.abs(add).toLocaleString()}</strong> units to the <strong>${direction}</strong>.</p>
            <p>3. This brings us to our final answer, <strong>${res.toLocaleString()}</strong>.</p>
        `;
        explanationEl.classList.remove('hidden');
    }

    // --- Core Number Line Drawing Function ---
    function updateNumberLine(start, add, res) {
        numberLineEl.innerHTML = '';
        numberLineEl.style.opacity = '0';
        
        const rangeBuffer = Math.abs(add) === 0 ? 10 : Math.abs(add) * 0.2;
        const min = Math.min(start, res, 0) - rangeBuffer;
        const max = Math.max(start, res, 0) + rangeBuffer;
        const totalRange = max - min;
        
        const targetTickCount = 15;
        const roughInterval = totalRange / targetTickCount;
        const magnitude = Math.pow(10, Math.floor(Math.log10(roughInterval)));
        const residual = roughInterval / magnitude;
        let interval = residual < 1.5 ? 1 * magnitude : (residual < 3.5 ? 2 * magnitude : (residual < 7.5 ? 5 * magnitude : 10 * magnitude));
        if (interval === 0) interval = 1;

        const lineStart = Math.floor(min / interval) * interval;
        const lineEnd = Math.ceil(max / interval) * interval;
        const lineRange = lineEnd - lineStart;
        
        if(lineRange === 0) return;

        numberLineEl.style.width = `${Math.max(1000, Math.abs(lineRange / interval) * 80)}px`;
        const valueToPercent = (val) => ((val - lineStart) / lineRange) * 100;
        
        for (let i = lineStart; i <= lineEnd; i += interval) {
            const position = valueToPercent(i);
            const tickContainer = document.createElement('div');
            tickContainer.className = 'tick-container';
            tickContainer.style.left = `${position}%`;
            const tick = document.createElement('div');
            const isMajor = (i % (interval * 2) === 0) || (lineRange / interval < 10);
            tick.className = `tick ${isMajor ? 'major' : 'minor'}`;
            if (isMajor) {
                const label = document.createElement('div');
                label.className = 'tick-label';
                label.textContent = i.toLocaleString();
                tickContainer.appendChild(label);
            }
            tickContainer.appendChild(tick);
            numberLineEl.appendChild(tickContainer);
        }

        const arrowContainer = document.createElement('div');
        arrowContainer.id = 'arrow-container';
        const arrow = document.createElement('div');
        arrow.className = `arrow ${add >= 0 ? 'positive' : 'negative'}`;
        const line = document.createElement('div');
        line.className = 'arrow-line';
        const head = document.createElement('div');
        head.className = 'arrow-head';
        const startPercent = valueToPercent(start);
        const resPercent = valueToPercent(res);

        if (add >= 0) {
            arrow.style.left = `${startPercent}%`;
            arrow.style.width = `${resPercent - startPercent}%`;
            line.style.width = 'calc(100% - 15px)';
            head.style.right = '0';
        } else {
            arrow.style.left = `${resPercent}%`;
            arrow.style.width = `${startPercent - resPercent}%`;
            line.style.left = '15px';
            line.style.width = 'calc(100% - 15px)';
            head.style.left = '0';
        }

        arrow.appendChild(line);
        arrow.appendChild(head);
        arrowContainer.appendChild(arrow);
        numberLineEl.appendChild(arrowContainer);
        
        const resultDot = document.createElement('div');
        resultDot.className = 'result-dot';
        resultDot.style.left = `${resPercent}%`;
        numberLineEl.appendChild(resultDot);
        
        setTimeout(() => {
            numberLineEl.style.opacity = '1';
            const lineElWidth = numberLineEl.getBoundingClientRect().width;
            const containerWidth = numberLineContainer.getBoundingClientRect().width;
            numberLineContainer.scrollLeft = (lineElWidth * (resPercent / 100)) - (containerWidth / 2);
        }, 50);
    }

    // --- Initial Setup & Event Listeners ---
    visualizeBtn.addEventListener('click', runSandbox);
    startNumberInput.addEventListener('keyup', (e) => e.key === 'Enter' && runSandbox());
    addNumberInput.addEventListener('keyup', (e) => e.key === 'Enter' && runSandbox());
    
    checkAnswerBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keyup', (e) => e.key === 'Enter' && checkAnswer());
    nextQuestionBtn.addEventListener('click', startNewQuestion);
    
    // Initialize the app in Sandbox mode
    switchMode('sandbox');
});
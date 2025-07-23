document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // =============== !!! EDIT PUZZLE CONTENT BELOW !!! =======================
    // =========================================================================

    const puzzlesData = [
        {
            parts: [
                { type: 'text', value: '"THE' },
                { type: 'space' },
                { type: 'blank', solution: 'NIGHT', emoji: '🌃' },
                { type: 'space' },
                { type: 'text', value: 'IS' },
                { type: 'space' },
                { type: 'blank', solution: 'YOUNG', emoji: '👶' },
                { type: 'text', value: '"' },
            ],
            hint: `"It's too early to go home already!"`
        },
        {
            parts: [
                { type: 'blank', solution: 'PEDAL', emoji: '🦶' },
                { type: 'space' },
                { type: 'text', value: 'TO' },
                { type:e: 'space' },
                { type: 'text', value: 'THE' },
                { type: 'space' },
                { type: 'blank', solution: 'METAL', emoji: '🤘' },
            ],
            hint: 'Accelerating hard and not letting up on the gas'
        },
        {
            parts: [
                { type: 'text', value: 'SEND' },
                { type: 'space' },
                { type: 'blank', solution: 'SHIVERS', emoji: '🥶' },
                { type: 'space' },
                { type: 'text', value: 'DOWN' },
                { type: 'space' },
                { type: 'text', value: 'MY' },
                { type: 'space' },
                { type: 'blank', solution: 'SPINE', emoji: '🦴' },
            ],
            hint: 'To cause a feeling of fear or excitement'
        }
    ];

    // =========================================================================
    // ======================= GAME LOGIC (No need to edit) ====================
    // =========================================================================

    // State
    let moves = 0;
    let solvedBlanks = 0;
    let totalBlanks = 0;

    // DOM Elements
    const screens = {
        tutorial1: document.getElementById('tutorial-screen-1'),
        tutorial2: document.getElementById('tutorial-screen-2'),
        game: document.getElementById('game-screen'),
        win: document.getElementById('win-screen')
    };

    const puzzleContainer = document.getElementById('puzzle-container');
    const emojiTray = document.getElementById('emoji-tray');
    const movesCountEl = document.getElementById('moves-count');

    function init() {
        setupTutorialButtons();
        generatePuzzles();
        generateEmojiTray();
        addDragAndDropListeners();
        updateMovesCounter();
    }

    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.style.display = 'none');
        screens[screenName].style.display = 'flex';
    }

    function setupTutorialButtons() {
        document.getElementById('next-tutorial-btn').addEventListener('click', () => showScreen('tutorial2'));
        document.getElementById('skip-tutorial-btn-1').addEventListener('click', startGame);
        document.getElementById('skip-tutorial-btn-2').addEventListener('click', startGame);
        document.getElementById('close-tutorial-btn-2').addEventListener('click', startGame);
        document.getElementById('start-game-btn').addEventListener('click', startGame);
        document.getElementById('done-btn').addEventListener('click', () => {
             // For simplicity, we'll just reload. A real app might go to a puzzle list.
             location.reload();
        });
    }
    
    function startGame() {
        showScreen('game');
    }

    function generatePuzzles() {
        puzzlesData.forEach((puzzle, puzzleIndex) => {
            const card = document.createElement('div');
            card.className = 'puzzle-card';

            const phraseDiv = document.createElement('div');
            phraseDiv.className = 'puzzle-phrase';

            puzzle.parts.forEach((part, partIndex) => {
                const partEl = document.createElement('span');
                if (part.type === 'text') {
                    partEl.className = 'phrase-text';
                    partEl.textContent = part.value;
                } else if (part.type === 'space') {
                    partEl.className = 'phrase-space';
                } else if (part.type === 'blank') {
                    totalBlanks++;
                    partEl.className = 'emoji-blank';
                    partEl.dataset.correctEmoji = part.emoji;
                    partEl.dataset.solution = part.solution;
                }
                phraseDiv.appendChild(partEl);
            });

            const hintDiv = document.createElement('div');
            hintDiv.className = 'puzzle-hint';
            hintDiv.textContent = puzzle.hint;

            card.appendChild(phraseDiv);
            card.appendChild(hintDiv);
            puzzleContainer.appendChild(card);
        });
    }
    
    function generateEmojiTray() {
        const allEmojis = puzzlesData.flatMap(p => p.parts.filter(part => part.type === 'blank').map(part => part.emoji));
        const uniqueEmojis = [...new Set(allEmojis)];
        
        // Add some distractor emojis
        const distractors = ['🚗', '😭', '🎉', '💡', '🏆', '👑'];
        let finalEmojis = uniqueEmojis;
        for(let i=0; i<3; i++) {
             if(distractors[i] && !finalEmojis.includes(distractors[i])) {
                 finalEmojis.push(distractors[i]);
             }
        }

        shuffleArray(finalEmojis);

        finalEmojis.forEach(emoji => {
            const emojiEl = document.createElement('div');
            emojiEl.className = 'emoji-item';
            emojiEl.textContent = emoji;
            emojiEl.draggable = true;
            emojiEl.dataset.emoji = emoji;
            emojiTray.appendChild(emojiEl);
        });
    }

    function addDragAndDropListeners() {
        const emojis = document.querySelectorAll('.emoji-item');
        const blanks = document.querySelectorAll('.emoji-blank');

        emojis.forEach(emoji => {
            emoji.addEventListener('dragstart', (e) => {
                if(emoji.classList.contains('used')) {
                    e.preventDefault();
                    return;
                }
                e.dataTransfer.setData('text/plain', emoji.dataset.emoji);
                setTimeout(() => emoji.classList.add('dragging'), 0);
            });
            emoji.addEventListener('dragend', () => {
                emoji.classList.remove('dragging');
            });
        });

        blanks.forEach(blank => {
            blank.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!blank.classList.contains('solved')) {
                    blank.classList.add('drop-hover');
                }
            });
            blank.addEventListener('dragleave', () => {
                blank.classList.remove('drop-hover');
            });
            blank.addEventListener('drop', (e) => {
                e.preventDefault();
                blank.classList.remove('drop-hover');
                if (blank.classList.contains('solved')) return;

                const droppedEmoji = e.dataTransfer.getData('text/plain');
                handleDrop(blank, droppedEmoji);
            });
        });
    }

    function handleDrop(blank, droppedEmoji) {
        moves++;
        updateMovesCounter();

        if (blank.dataset.correctEmoji === droppedEmoji) {
            // Correct guess
            blank.classList.add('solved');
            const solutionText = blank.dataset.solution;
            const wrapper = document.createElement('span');
            wrapper.className = 'solved-word-wrapper';
            wrapper.textContent = solutionText;
            blank.innerHTML = '';
            blank.appendChild(wrapper);

            // Mark emoji in tray as used
            const usedEmojiEl = emojiTray.querySelector(`[data-emoji="${droppedEmoji}"]`);
            if (usedEmojiEl) {
                usedEmojiEl.classList.add('used');
            }

            solvedBlanks++;
            checkWinCondition();
        } else {
            // Incorrect guess
            blank.classList.add('shake');
            setTimeout(() => blank.classList.remove('shake'), 500);
        }
    }

    function updateMovesCounter() {
        movesCountEl.textContent = `${moves} moves`;
    }

    function checkWinCondition() {
        if (solvedBlanks === totalBlanks) {
            setTimeout(showWinScreen, 500);
        }
    }

    function showWinScreen() {
        showScreen('win');
        document.getElementById('final-score').textContent = `${moves} moves`;
        document.getElementById('final-date').textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
        launchConfetti();
    }
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // --- Confetti ---
    function launchConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;

        let particles = [];
        const colors = ['#fecb2e', '#ffffff', '#e6a200', '#ffdf7e'];

        function Particle(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 7 + 3;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 5 + 2;
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        function updateParticles() {
            for (let i = 0; i < particles.length; i++) {
                particles[i].y += particles[i].speedY;
                particles[i].x += particles[i].speedX;
                if (particles[i].y > canvas.height) {
                    particles.splice(i, 1);
                    i--;
                }
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                ctx.fillStyle = particles[i].color;
                ctx.beginPath();
                ctx.fillRect(particles[i].x, particles[i].y, particles[i].size, particles[i].size * 1.5);
                ctx.closePath();
            }
        }

        function createParticles() {
            for (let i = 0; i < 25; i++) {
                particles.push(new Particle(Math.random() * canvas.width, -20));
            }
        }

        let confettiInterval = setInterval(createParticles, 200);

        function animate() {
            updateParticles();
            drawParticles();
            if (particles.length > 0) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                clearInterval(confettiInterval);
            }
        }
        
        setTimeout(() => clearInterval(confettiInterval), 2000); // Stop creating new confetti after 2 seconds
        animate();
    }


    // Start the app
    init();
});

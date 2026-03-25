/**
 * main.js - Entry point for the FPS game
 * Handles menu navigation, settings, and game initialization.
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const screens = {
        main: document.getElementById('main-menu'),
        mapSelect: document.getElementById('map-select'),
        lobby: document.getElementById('multiplayer-lobby'),
        settings: document.getElementById('settings-screen'),
        hud: document.getElementById('game-hud'),
        pause: document.getElementById('pause-menu'),
        gameOver: document.getElementById('game-over')
    };

    const buttons = {
        singleplayer: document.getElementById('btn-singleplayer'),
        multiplayer: document.getElementById('btn-multiplayer'),
        settings: document.getElementById('btn-settings'),
        backMap: document.getElementById('btn-back-map'),
        backLobby: document.getElementById('btn-back-lobby'),
        backSettings: document.getElementById('btn-back-settings'),
        startGame: document.getElementById('btn-start-game'),
        resume: document.getElementById('btn-resume'),
        quit: document.getElementById('btn-quit'),
        playAgain: document.getElementById('btn-play-again'),
        menu: document.getElementById('btn-menu')
    };

    // Game Reference
    let gameInstance = null;

    // Show screen helper
    function showScreen(screenId) {
        Object.values(screens).forEach(screen => {
            if (screen) screen.classList.add('hidden');
        });
        if (screens[screenId]) {
            screens[screenId].classList.remove('hidden');
        }
    }

    // Navigation
    buttons.singleplayer.onclick = () => showScreen('mapSelect');
    buttons.multiplayer.onclick = () => showScreen('lobby');
    buttons.settings.onclick = () => showScreen('settings');
    buttons.backMap.onclick = () => showScreen('main');
    buttons.backLobby.onclick = () => showScreen('main');
    buttons.backSettings.onclick = () => showScreen('main');

    // Start Game
    buttons.startGame.onclick = () => {
        const selectedMap = document.querySelector('.map-card.selected')?.dataset.map || 'warehouse';
        const botCount = parseInt(document.getElementById('bot-count').value);
        const difficulty = document.getElementById('bot-difficulty').value;

        initGame({
            mode: 'singleplayer',
            map: selectedMap,
            bots: botCount,
            difficulty: difficulty
        });
    };

    // Map Selection logic
    const mapCards = document.querySelectorAll('.map-card');
    mapCards.forEach(card => {
        card.onclick = () => {
            mapCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        };
    });

    // Pause / Resume
    buttons.resume.onclick = () => {
        if (gameInstance) {
            gameInstance.resume();
            showScreen('hud');
        }
    };

    buttons.quit.onclick = () => {
        if (gameInstance) {
            gameInstance.destroy();
            gameInstance = null;
        }
        showScreen('main');
    };

    buttons.menu.onclick = () => showScreen('main');
    buttons.playAgain.onclick = () => showScreen('mapSelect');

    // Initialize Game
    function initGame(config) {
        showScreen('hud');
        
        // gameInstance = new Game(config);
        // gameInstance.start();
        
        console.log("Starting game with config:", config);
        
        // Temporary placeholder until game.js is implemented
        if (typeof Game !== 'undefined') {
            gameInstance = new Game(config);
            gameInstance.init();
        } else {
            console.error("Game engine not loaded yet!");
            // For now, let's assume it will be loaded
            setTimeout(() => {
                if (typeof Game !== 'undefined') {
                    gameInstance = new Game(config);
                    gameInstance.init();
                }
            }, 1000);
        }
    }

    // Settings listeners
    const sensInput = document.getElementById('sensitivity');
    const sensDisplay = document.getElementById('sens-display');
    sensInput.oninput = () => { sensDisplay.innerText = sensInput.value; };

    const botInput = document.getElementById('bot-count');
    const botDisplay = document.getElementById('bot-count-display');
    botInput.oninput = () => { botDisplay.innerText = botInput.value; };

    // Default map selection
    if (mapCards.length > 0) mapCards[0].classList.add('selected');
});

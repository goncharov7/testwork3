// Constants
const LEFT_MOVEMENT_KEY = 'ArrowLeft';
const RIGHT_MOVEMENT_KEY = 'ArrowRight';
const SHOOT_KEY = ' ';
const SHOOT_DELAY = 200;

const BOSS_MOVEMENT_SPEED = 50;
const BOSS_BULLET_SPEED = 5;
const BOSS_MOVE_CHANCE = 0.75;
const BOSS_SHOOT_COOLDOWN = 2;
const BOSS_THINK_TIME = 1000;

// Screen Elements
let startButtonElement;
let gameplayScreenElement;
let actualBulletsElement;
let startBulletsElement;
let timerElement;

// Game Settings
let lastShootTime = 0;
let initialAsteroidsAmount = 1;
const initialBulletAmount = 10;
let bulletAmount = initialBulletAmount;
const bulletSpeed = 10;
const playerMovementSpeed = 25;
let bossHealthPoints = 4;
const gameDuration = 60;
let remainingSeconds = gameDuration;
let isTimeOver = false;
let isInputActive = false;
let isFirstLevel = true;
let timeoutID;

// Pixi Initialization
const appTicker = PIXI.Ticker.shared;
appTicker.autoStart = false;
appTicker.stop();
appTicker.start();

const mainCanvas = document.getElementById('main__canvas');
const PIXIApplication = PIXI.Application;
const pixiApp = new PIXIApplication({
    width: 1280,
    height: 720,
    view: mainCanvas
});

document.body.appendChild(pixiApp.view);

const backgroundSprite = PIXI.Sprite.from('assets/sprites/background.jpg');
pixiApp.stage.addChild(backgroundSprite);

const playerSprite = PIXI.Sprite.from('assets/sprites/player.png');
playerSprite.anchor.set(0.5);
playerSprite.width = 75;
playerSprite.height = 125;
playerSprite.x = pixiApp.screen.width / 2;
playerSprite.y = pixiApp.screen.height - playerSprite.height / 2;
pixiApp.stage.addChild(playerSprite);

let asteroidsArray = [];

for (let i = 0; i < initialAsteroidsAmount; i++) {
    const asteroidSprite = new PIXI.Sprite(PIXI.Texture.from('assets/sprites/asteroid.png'));
    asteroidSprite.width = 125;
    asteroidSprite.height = 125;
    asteroidSprite.x = 100 + Math.random() * pixiApp.screen.width * .75;
    asteroidSprite.y = Math.random() * pixiApp.screen.height / 2;

    asteroidSprite.rotation = Math.random() * 2;
    
    asteroidsArray.push(asteroidSprite);
    pixiApp.stage.addChild(asteroidSprite);
}

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', function () {
    startButtonElement = document.querySelector("#start__button__element");
    gameplayScreenElement = document.querySelector("#gameplay__screen");
    actualBulletsElement = document.querySelector(".actual__bullets__element");
    startBulletsElement = document.querySelector(".start__bullets__element");
    timerElement = document.querySelector("#timer__element");

    startBulletsElement.textContent = initialBulletAmount;
    actualBulletsElement.textContent = bulletAmount;
    timerElement.textContent = remainingSeconds;

    startButtonElement.addEventListener('click', function (event) {
        event.preventDefault();
        isInputActive = true;
        updateTimer();
        gameplayScreenElement.classList.toggle('hide');
        startButtonElement.classList.add('hide');
    });
});

document.addEventListener('keydown', function (e) {
    if (!isInputActive) return;
    switch (e.key) {
        case LEFT_MOVEMENT_KEY:
            movePlayer(true);
            break;
        case RIGHT_MOVEMENT_KEY:
            movePlayer(false);
            break;
        case SHOOT_KEY:
            createBullet(true);
            break;
        default:
            console.log("Wrong key: " + e.key);
            break;
    }
});

// Timer
/**
 * Updates the game timer element and checks if the game time is over.
 */

function updateTimer() {
    timerElement.textContent = remainingSeconds;
    if (remainingSeconds > 0) {
        remainingSeconds--;
        timeoutID = setTimeout(updateTimer, 1000);
    } else {
        isTimeOver = true;
    }
}

// Game Manager
const gameTicker = new PIXI.Ticker;
let isGameEnded = false;

gameTicker.add(() => {
    if ((bulletAmount <= 0 && !playerBulletsArray.length && (asteroidsArray.length || !isFirstLevel)) || isTimeOver) {
        endGame(false);
    }
    if (initialAsteroidsAmount <= 0 && isFirstLevel) {
        isFirstLevel = false;
        runSecondLevel();
    }
});
gameTicker.start();

/**
 * Ends the game and displays the result message.
 * @param {boolean} playerWon - Indicates whether the player won or lost.
 */

function endGame(playerWon) {
    if (isGameEnded) return;
    if (playerWon === true) {
        if (isFirstLevel) {
            isFirstLevel = false;
            runSecondLevel();
        } else {
            showMessage(playerWon);
        }
    } else {
        if (isFirstLevel) {
            showMessage(playerWon);
        } else {
            showMessage(false);
        }
    }

    if (bossBulletTickersArray.length > 0) {
        bossBulletTickersArray.forEach(ticker => ticker.stop());
        bossBulletTickersArray = [];
    }

    if (hpBarElement) {
        pixiApp.stage.removeChild(hpBarElement);
        hpBarElement = null;
    }

    if (bossSprite) {
        pixiApp.stage.removeChild(bossSprite);
        bossSprite = null;
    }

    gameplayScreenElement.classList.add('hide');
    clearTimeout(timeoutID);
    isInputActive = false;
    isGameEnded = true;
    gameTicker.stop();

    pixiApp.ticker.remove(updateHPBarPosition);
}

/**
 * Displays a message on the screen based on the game result.
 * @param {boolean} playerWon - Indicates whether the player won or lost.
 */

function showMessage(playerWon) {
    let richText;
    const textStyle = new PIXI.TextStyle({
        fontFamily: 'Mono',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
        lineJoin: 'round',
    });

    const messageText = playerWon ? 'YOU WIN!' : 'YOU LOSE!';
    const fillColor = playerWon ? '#00af00' : '#af0000';

    textStyle.fill = fillColor;
    richText = new PIXI.Text(messageText, textStyle);

    richText.x = pixiApp.screen.width / 2 - richText.width / 2;
    richText.y = pixiApp.screen.height / 2;
    pixiApp.stage.addChild(richText);
}

/**
 * Initiates the second level of the game.
 */

function runSecondLevel() {
    bulletAmount = initialBulletAmount;
    actualBulletsElement.textContent = bulletAmount;
    remainingSeconds = gameDuration;
    timerElement.textContent = remainingSeconds;

    spawnBoss();
}

// Bullet Functions
let playerBulletsArray = [];
let bossBulletsArray = [];
let playerBulletTickersArray = [];
let bossBulletTickersArray = [];

/**
 * Creates a bullet and adds it to the game.
 * @param {boolean} playerCall - Indicates whether the bullet is created by the player.
 */

function createBullet(playerCall) {

    const currentTime = Date.now();
    if (currentTime - lastShootTime < SHOOT_DELAY) {
        return;
    }

    lastShootTime = currentTime;
    if (bulletAmount <= 0) {
        return;
    }

    let bulletColor;
    let bulletXPos;
    let bulletYPos;

    const bullet = new PIXI.Graphics();
    let bulletTicker;
    let bossbulletTicker;
    if (playerCall) {
        bulletColor = 0xfffff;
        bulletXPos = playerSprite.x;
        bulletYPos = playerSprite.y * .85;
        bulletAmount--;
        actualBulletsElement.textContent = bulletAmount;
        playerBulletsArray.push(bullet);
        bulletTicker = new PIXI.Ticker;
        playerBulletTickersArray.push(bulletTicker);
    } else {
        bulletColor = 0xDE3249;
        bulletXPos = bossSprite.x;
        bulletYPos = bossSprite.y + bossSprite.height * .5;
        bossBulletsArray.push(bullet);
        bossbulletTicker = new PIXI.Ticker;
        bossBulletTickersArray.push(bossbulletTicker);
    }
    bullet.beginFill(bulletColor);
    bullet.drawRect(bulletXPos, bulletYPos, 5, 30);
    bullet.endFill();
    pixiApp.stage.addChild(bullet);

    if (playerCall) {
        bulletTicker.add((delta) => { moveBullet(delta, bullet, bulletTicker); });
        bulletTicker.start();
    } else {
        bossbulletTicker.add((delta) => { moveBossBullet(delta, bullet, bossbulletTicker); });
        bossbulletTicker.start();
    }
}

let hittedPlayerBullet;
let playerBulletHit = false;

let hittedBossBullet;
let bossBulletHit = false;

/**
 * Moves the player's bullet and checks for collisions with other game elements.
 * @param {number} delta - Time delta for animation.
 * @param {object} bullet - The player's bullet.
 * @param {object} bulletTicker - The ticker for the player's bullet.
 */

function moveBullet(delta, bullet, bulletTicker) {
    bullet.y += (-bulletSpeed * delta);
    let bulletIndex;

    if (bullet.y <= -pixiApp.screen.height || bullet.y >= pixiApp.screen.height) {
        pixiApp.stage.removeChild(bullet);
        bulletIndex = playerBulletsArray.indexOf(bullet);
        if (bulletIndex > -1) {
            playerBulletsArray.splice(bulletIndex, 1);
            const bulletTickerIndex = playerBulletsArray.indexOf(bulletTicker);
            if (bulletTickerIndex > -1) {
                playerBulletTickersArray[bulletTickerIndex].destroy();
                playerBulletTickersArray.splice(bulletTickerIndex, 1);
            }
        }
        bulletTicker.destroy();
        return;
    }

    if (testForHit(bullet, playerSprite)) {
        pixiApp.stage.removeChild(bullet);
        bulletIndex = playerBulletsArray.indexOf(bullet);
        if (bulletIndex > -1) {
            playerBulletsArray.splice(bulletIndex, 1);
        }
        bulletTicker.destroy();
        endGame(false);
    }

    if (isFirstLevel) {
        asteroidsArray.forEach(asteroid => {
            if (testForHit(bullet, asteroid)) {
                pixiApp.stage.removeChild(bullet);
                pixiApp.stage.removeChild(asteroid);
                const asteroidIndex = asteroidsArray.indexOf(asteroid);
                if (asteroidIndex > -1) {
                    asteroidsArray.splice(asteroidIndex, 1);
                }
                bulletIndex = playerBulletsArray.indexOf(bullet);
                if (bulletIndex > -1) {
                    playerBulletsArray.splice(bulletIndex, 1);
                }
                bulletTicker.destroy();
                initialAsteroidsAmount--;
            }
        });
    } else {
        if (testForHit(bullet, bossSprite)) {
            pixiApp.stage.removeChild(bullet);
            bulletIndex = playerBulletsArray.indexOf(bullet);
            if (bulletIndex > -1) {
                playerBulletsArray.splice(bulletIndex, 1);
            }
            bulletTicker.destroy();
            bossTakeDamage();
        }

        if (playerBulletHit && hittedPlayerBullet === bullet) {
            pixiApp.stage.removeChild(bullet);
            bulletIndex = playerBulletsArray.indexOf(bullet);
            if (bulletIndex > -1) {
                playerBulletsArray.splice(bulletIndex, 1);
            }
            hittedPlayerBullet = null;
            bossBulletHit = false;
            bulletTicker.destroy();
        }
        bossBulletsArray.forEach(bossBullet => {
            if (testForHit(bullet, bossBullet)) {
                pixiApp.stage.removeChild(bullet);
                bulletIndex = playerBulletsArray.indexOf(bullet);
                if (bulletIndex > -1) {
                    playerBulletsArray.splice(bulletIndex, 1);
                }
                hittedBossBullet = bossBullet;
                bossBulletHit = true;
                bulletTicker.destroy();
            }
        });
    }
}

/**
 * Moves the boss's bullet and checks for collisions with other game elements.
 * @param {number} delta - Time delta for animation.
 * @param {object} bullet - The boss's bullet.
 * @param {object} bulletTicker - The ticker for the boss's bullet.
 */

function moveBossBullet(delta, bullet, bulletTicker) {
    bullet.y += (BOSS_BULLET_SPEED * delta);

    let bulletIndex;
    if (bullet.y <= -pixiApp.screen.height || bullet.y >= pixiApp.screen.height) {
        pixiApp.stage.removeChild(bullet);
        bulletIndex = bossBulletsArray.indexOf(bullet);
        if (bulletIndex > -1) {
            bossBulletsArray.splice(bulletIndex, 1);
            const bulletTickerIndex = bossBulletsArray.indexOf(bulletTicker);
            if (bulletTickerIndex > -1) {
                bossBulletTickersArray[bulletTickerIndex].destroy();
                bossBulletTickersArray.splice(bulletTickerIndex, 1);
            }
        }
        bulletTicker.destroy();
        return;
    }

    if (testForHit(bullet, playerSprite)) {
        bulletTicker.destroy();
        pixiApp.stage.removeChild(bullet);
        bulletIndex = bossBulletsArray.indexOf(bullet);
        if (bulletIndex > -1) {
            bossBulletsArray.splice(bulletIndex, 1);
        }

        pixiApp.stage.removeChild(playerSprite);
        endGame(false);
    }

    if (bossBulletHit && hittedBossBullet === bullet) {
        pixiApp.stage.removeChild(bullet);
        bulletIndex = bossBulletsArray.indexOf(bullet);
        if (bulletIndex > -1) {
            bossBulletsArray.splice(bulletIndex, 1);
        }
        hittedBossBullet = null;
        bossBulletHit = false;
        bulletTicker.destroy();
    }
    playerBulletsArray.forEach(playerBullet => {
        if (testForHit(bullet, playerBullet)) {
            pixiApp.stage.removeChild(bullet);
            bulletIndex = bossBulletsArray.indexOf(bullet);
            if (bulletIndex > -1) {
                bossBulletsArray.splice(bulletIndex, 1);
            }
            hittedPlayerBullet = playerBullet;
            playerBulletHit = true;
            bulletTicker.destroy();
        }
    });
}

// Utils Functions
/**
 * Checks if two game objects collide.
 * @param {object} object1 - The first game object.
 * @param {object} object2 - The second game object.
 * @returns {boolean} - True if the objects collide, false otherwise.
 */

function testForHit(object1, object2) {
    if (!object1 || !object2) return false;

    const bounds1 = object1.getBounds();
    const bounds2 = object2.getBounds();

    return bounds1.x < bounds2.x + bounds2.width &&
        bounds1.x + bounds1.width > bounds2.x &&
        bounds1.y < bounds2.y + bounds2.height &&
        bounds1.y + bounds1.height > bounds2.y;
}

/**
 * Moves the player's character left or right.
 * @param {boolean} movingLeft - Indicates whether the player is moving left.
 */

function movePlayer(movingLeft) {
    let playerStartPos = playerSprite.x;
    if (movingLeft) {
        playerSprite.x -= playerMovementSpeed;
        if (playerSprite.x < (playerSprite.width / 2)) {
            playerSprite.x = playerStartPos;
        }
    } else {
        playerSprite.x += playerMovementSpeed;
        if (playerSprite.x > (pixiApp.screen.width - playerSprite.width / 2)) {
            playerSprite.x = playerStartPos;
        }
    }
}

let hpBarElement;

/**
 * Displays the boss's health bar on the screen.
 */

function showBossHP() {
    if (hpBarElement) {
        pixiApp.stage.removeChild(hpBarElement);
    }

    const screenWidth = pixiApp.renderer.width;
    const barWidth = 200;
    const startX = (screenWidth - barWidth) / 2;
    const startY = 20;

    hpBarElement = new PIXI.Graphics();
    pixiApp.stage.addChild(hpBarElement);

    updateBossHP();
    hpBarElement.x = startX;
    hpBarElement.y = startY;
}

/**
 * Updates the boss's health bar based on the remaining health points.
 */

function updateBossHP() {
    const maxHP = 4;
    const currentHP = bossHealthPoints;

    const barWidth = 200;
    const barHeight = 20;

    const currentWidth = (currentHP / maxHP) * barWidth;

    hpBarElement.clear();
    hpBarElement.beginFill(0xFF0000);
    hpBarElement.drawRect(0, 0, currentWidth, barHeight);
    hpBarElement.endFill();
}

function updateHPBarPosition(delta) {
    if (hpBarElement && bossSprite) {
        hpBarElement.position.x = bossSprite.x - hpBarElement.width / 2;
        hpBarElement.position.y = bossSprite.y - bossSprite.height / 2 - 40; 
    }
}

/**
 * Initiates the boss's behavior, including movement and shooting.
 */

function runBossBehavior() {
    const bossThink = () => {
        if (bossSprite && Math.random() < BOSS_MOVE_CHANCE) {
            const targetX = Math.random() * (pixiApp.screen.width - bossSprite.width);
            moveBoss(targetX);
        }
        setTimeout(bossThink, BOSS_THINK_TIME);
    };

    const bossShoot = () => {
        if (!isTimeOver && bossSprite) {
            createBullet(false);
            setTimeout(bossShoot, BOSS_SHOOT_COOLDOWN * 1000);
        }
    };

    bossThink();
    bossShoot();
}

// Functions for Boss Movement and Bullets
let bossSprite;

/**
 * Spawns the boss on the screen.
 */

function spawnBoss() {
    const bossTexture = PIXI.Sprite.from('assets/sprites/boss.png');
    bossTexture.anchor.set(0.5);
    bossTexture.width = 250;
    bossTexture.height = 150;
    bossTexture.x = pixiApp.screen.width / 2;
    bossTexture.y = bossTexture.height / 2 + 100;
    pixiApp.stage.addChild(bossTexture);
    bossSprite = bossTexture;
    showBossHP();
    pixiApp.ticker.add(updateHPBarPosition);
    runBossBehavior();
}

/**
 * Moves the boss to a specific target position.
 * @param {number} targetX - The target x-coordinate for the boss's position.
 */

function moveBoss(targetX) {
    const speed = BOSS_MOVEMENT_SPEED / 1000;
    const direction = targetX > bossSprite.x ? 1 : -1;

    const move = () => {
        if (bossSprite) {
            const step = speed * (Date.now() - startTime);
            bossSprite.x += step * direction;

            if (direction === 1 ? bossSprite.x >= targetX : bossSprite.x <= targetX) {
                cancelAnimationFrame(animationFrame);
            } else {
                animationFrame = requestAnimationFrame(move);
            }
        }
    };

    const startTime = Date.now();
    let animationFrame = requestAnimationFrame(move);
}

/**
 * Handles the boss taking damage, updating the health points and ending the game if necessary.
 */

function bossTakeDamage() {
    bossHealthPoints--;
    updateBossHP();

    if (bossHealthPoints <= 0) {
        endGame(true);
    }
}

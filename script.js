var MAX_LEFT_PLAYER_MARGIN = 572;
var MAX_BULLET_TRAVEL = 600;
var MAX_ENEMY_TRAVEL = 600;
var BULLET_ENEMEY_OFFSET = 600;
var LEFT_SHOOTER_OFFSET = 2;
var RIGHT_SHOOTER_OFFSET = 24;
var BULLET_STEP = 1;
var PLAYER_STEP = 1;
var ENEMY_STEP = 1;
var ENEMY_HEIGHT = 18;
var ENEMY_WIDTH = 9;
var BULLET_HEIGHT = 8;
var BULLET_WIDTH = 5;

var gameOverAudio = new Audio('gameOver.mp3');
var pewAudio = new Audio('pew.mp3');
var boomAudio = new Audio('boom.mp3');
var musicAudio = new Audio('music.mp3');

var currentScore = 0;
var currentLife = 100;
var currentLeftPlayerMargin = MAX_LEFT_PLAYER_MARGIN / 2;
var currentMovementSpeed = 1;
var currentFireSpeed = 100;
var currentBulletSpeed = 1;
var currentEnemySpeed = 10;
var currentSpawnSpeed = 500;

var isGameOver = false;
var isGameStarted = false;

var game = document.querySelector('.the-game');

var score = document.querySelector('.the-score');
score.textContent = "SCORE: " + currentScore;

var life = document.querySelector('.the-life');
life.textContent = "HP: " + currentLife;

var player = document.querySelector('.the-player');
player.setAttribute("style", "margin-left:" + currentLeftPlayerMargin + "px");

var rightInterval = undefined;
var isTurningRight = false;

var leftInterval = undefined;
var isTurningLeft = false;

var fireInterval = undefined;
var isFiring = false;
var bulletId = 1;
var bulletInterval = {};
var bulletCoord = {};

var enemyId = 1;
var enemyInterval = {};
var enemyCoord = {};
var spawnInterval = undefined;

function addScore(value) {
    if (value === "0") {
        currentLife += 10;
        life.textContent = "HP: " + currentLife;
    }
    else {
        currentScore += parseInt(value, 10);
        score.textContent = "SCORE: " + currentScore;
    }
}

function updatePosition({ id, x, y }, isBullet) {
    if (isBullet) {
        if (x === undefined || y === undefined) {
            delete bulletCoord[id];
        }
        else {
            bulletCoord[id] = { x, y }
        }
    } else {
        if (x === undefined || y === undefined) {
            delete enemyCoord[id];
        }
        else {
            enemyCoord[id] = { x, y }
        }
    }
}

function checkForHit({ id, x, y }, isBullet) {
    if (isBullet) {
        Object.keys(enemyCoord).find(enemyId => {
            var coord = enemyCoord[enemyId];

            if ((x + BULLET_WIDTH) >= coord.x && x <= (coord.x + ENEMY_WIDTH)) {
                if ((BULLET_ENEMEY_OFFSET - y) <= (coord.y + ENEMY_HEIGHT) && (BULLET_ENEMEY_OFFSET - y + BULLET_HEIGHT) >= coord.y) {
                    addScore(document.querySelector('.the-enemy#'+enemyId).textContent);
                    clearBullet(id);
                    clearEnemy(enemyId);
                    boomAudio.play();
                }
            }
        });
    }
    else {
        Object.keys(bulletCoord).find(bulletId => {
            var coord = bulletCoord[bulletId];

            if ((coord.x + BULLET_WIDTH) >= x && coord.x <= (x + ENEMY_WIDTH)) {
                if ((BULLET_ENEMEY_OFFSET - coord.y) <= (y + ENEMY_HEIGHT) && (BULLET_ENEMEY_OFFSET - coord.y + BULLET_HEIGHT) >= y) {
                    addScore(document.querySelector('.the-enemy#'+id).textContent);
                    clearBullet(bulletId);
                    clearEnemy(id);
                    boomAudio.play();
                }
            }
        });
    }
}

function clearBullet(id) {
    updatePosition({ id }, true);

    clearInterval(bulletInterval[id]);

    game.removeChild(document.querySelector('.the-bullet#'+id));
}

function clearEnemy(id) {
    updatePosition({ id });

    clearInterval(enemyInterval[id]);

    game.removeChild(document.querySelector('.the-enemy#'+id));
}

function gameOver() {
    if (!isGameOver) {
        isGameOver = true;

        musicAudio.pause();
        gameOverAudio.play();

        clearInterval(leftInterval);
        clearInterval(rightInterval);
        clearInterval(fireInterval);
        clearInterval(spawnInterval);

        document.querySelector(".the-game-over").style.opacity = 1;
    }
}

function spawn() {
    var enemy = document.createElement("div");

    enemy.textContent = Math.floor(Math.random() * Math.floor(10));
    enemy.className = 'the-enemy';
    enemy.id = "e" + enemyId;
    enemy.x = Math.floor(Math.random() * Math.floor(MAX_LEFT_PLAYER_MARGIN));

    enemy.setAttribute("style", "top: 0px; margin-left:" + enemy.x + "px");

    game.appendChild(enemy);

    enemyInterval[enemy.id] = setInterval(() => {
        var currentEnemyPosition = parseInt(enemy.style.top.replace('px', ''), 10);

        if (currentEnemyPosition >= MAX_ENEMY_TRAVEL ) {
            currentLife -= parseInt(enemy.textContent, 10);
            life.textContent = "HP: " + (currentLife >= 0 ? currentLife : 0);

            if (currentLife <= 0 ) {
                gameOver();
            }

            clearEnemy(enemy.id);
        } else {
            enemy.y = currentEnemyPosition + ENEMY_STEP;
            enemy.style.top = enemy.y + "px";

            updatePosition({
                id: enemy.id,
                x: enemy.x,
                y: enemy.y,
            });

            checkForHit({ id: enemy.id, x: enemy.x, y: enemy.y });
        }
    }, currentEnemySpeed);

    enemyId++;
}

document.addEventListener('keydown', (e) => {
    if (isGameOver) {
        return;
    }

    if (!isGameStarted) {
        isGameStarted = true;

        spawnInterval = setInterval(spawn, currentSpawnSpeed);

        musicAudio.play();
        musicAudio.addEventListener('ended', () => {
            musicAudio.currentTime = 0;
            musicAudio.play();
        });
    }

    if (e.key === 'ArrowRight') {
        if (!isTurningRight) {
            isTurningRight = true;

            function moveRight() {
                currentLeftPlayerMargin = currentLeftPlayerMargin >= MAX_LEFT_PLAYER_MARGIN ? MAX_LEFT_PLAYER_MARGIN : currentLeftPlayerMargin + PLAYER_STEP;

                player.style.marginLeft = currentLeftPlayerMargin + "px";
            }

            rightInterval = setInterval(moveRight, currentMovementSpeed);
        }
    }

    if (e.key === 'ArrowLeft') {
        if (!isTurningLeft) {
            isTurningLeft = true;

            function moveLeft() {
                currentLeftPlayerMargin = currentLeftPlayerMargin <= 0 ? 0 : currentLeftPlayerMargin - PLAYER_STEP;

                player.style.marginLeft = currentLeftPlayerMargin + "px";
            }

            leftInterval = setInterval(moveLeft, currentMovementSpeed);
        }
    }

    if (e.key === ' ') {
        if (!isFiring) {
            isFiring = true;

            function shoot() {
                var bullet = document.createElement("div");

                bullet.textContent = '.';
                bullet.className = 'the-bullet';
                bullet.id = "b" + bulletId;
                bullet.y = 7;
                bullet.x = currentLeftPlayerMargin + (bulletId % 2 ? LEFT_SHOOTER_OFFSET : RIGHT_SHOOTER_OFFSET);

                bullet.setAttribute("style", "bottom: " + bullet.y + "px; margin-left:" + bullet.x + "px");

                game.appendChild(bullet);

                pewAudio.play();

                bulletInterval[bullet.id] = setInterval(() => {
                    var currentBulletPosition = parseInt(bullet.style.bottom.replace('px', ''), 10);

                    if (currentBulletPosition >= MAX_BULLET_TRAVEL) {
                        clearBullet(bullet.id);
                    } else {
                        bullet.y = currentBulletPosition + BULLET_STEP;
                        bullet.style.bottom = bullet.y + "px";

                        updatePosition({
                            id: bullet.id,
                            x: bullet.x,
                            y: bullet.y,
                        }, true);

                        checkForHit({ id: bullet.id, x: bullet.x, y: bullet.y }, true);
                    }
                }, currentBulletSpeed);

                bulletId = bulletId > 100 ? 0 : bulletId + 1;
            }
            shoot();

            fireInterval = setInterval(shoot, currentFireSpeed);
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') {
        isTurningRight = false;

        clearInterval(rightInterval);
    }

    if (e.key === 'ArrowLeft') {
        isTurningLeft = false;

        clearInterval(leftInterval);
    }

    if (e.key === ' ') {
        isFiring = false;

        clearInterval(fireInterval);
    }
});

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = { x: 0, y: 0, width: 40, height: 40 }; // 玩家尺寸增大
        this.obstacles = [];
        this.score = 0;
        this.gameLoop = null;
        this.boundary = { x: 0, y: 0, width: 0, height: 0 }; // 新增边界
        this.exitButton = document.getElementById('exit-to-menu');
        this.gameTime = 0; // 游戏时间（秒）
        this.difficultyInterval = null; // 难度调整计时器
        this.obstacleSpeed = 3; // 初始障碍物速度
        this.maxObstacleSpeed = 5; // 最大障碍物基础速度
        this.obstacleFrequency = 300; // 初始障碍物生成频率
        this.obstacleCount = 1; // 初始同时出现的障碍物数量
        this.hasMovingObstacle = false; // 是否已经添加了移动的障碍物
        this.splitObstacleEnabled = false; // 是否启用分裂障碍物
        this.splitMovingObstacleEnabled = false; // 是否启用移动障碍物分裂
        this.resizeTimeout = null;
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', this.handleResize.bind(this));
        this.addEventListeners();
        this.exitButton.style.display = 'block';
        this.exitButton.addEventListener('click', this.exitToMenu.bind(this));
        this.gameTime = 0;
        this.obstacleSpeed = 3;
        this.obstacleFrequency = 300;
        this.obstacleCount = 1;
        this.hasMovingObstacle = false;
        this.splitObstacleEnabled = false;
        this.splitMovingObstacleEnabled = false;
    }

    start() {
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 1000 / 60); // 60 FPS

        // 每秒更新游戏时间和难度
        this.difficultyInterval = setInterval(() => {
            this.gameTime++;
            this.updateDifficulty();
        }, 1000);
    }

    update() {
        this.moveObstacles();
        this.checkCollisions();
        this.score++;
        if (this.score % this.obstacleFrequency === 0) {
            let obstaclesAdded = 0;
            while (obstaclesAdded < this.obstacleCount) {
                if (this.hasMovingObstacle && Math.random() < 0.5) { // 50% 的概率添加移动障碍物
                    this.addMovingObstacle();
                } else {
                    this.addObstacle();
                }
                obstaclesAdded++;
            }
        }
    }

    updateDifficulty() {
        // 每5秒增加障碍物速度，但不超过最大值
        if (this.gameTime % 5 === 0) {
            this.obstacleSpeed = Math.min(this.obstacleSpeed + 0.5, this.maxObstacleSpeed);
        }

        // 30秒后增加障碍物数量到2个
        if (this.gameTime === 30) {
            this.obstacleCount = 2;
            this.obstacleFrequency = Math.floor(this.obstacleFrequency * 1.2); // 稍微增加生成间隔
        }

        // 40秒后增加障碍物数量到3个
        if (this.gameTime === 40) {
            this.obstacleCount = 3;
            this.obstacleFrequency = Math.floor(this.obstacleFrequency * 1.2); // 再次稍微增加生成间隔
        }

        // 50秒后，添加一个左右移动的障碍物
        if (this.gameTime === 50 && !this.hasMovingObstacle) {
            this.addMovingObstacle();
            this.hasMovingObstacle = true;
        }

        // 60秒后，启用分裂障碍物
        if (this.gameTime === 60) {
            this.splitObstacleEnabled = true;
        }

        // 50秒后，启用移动障碍物分裂
        if (this.gameTime === 50) {
            this.splitMovingObstacleEnabled = true;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 添加调试信息
        console.log('Drawing game...');
        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
        console.log('Boundary:', this.boundary);

        this.drawBoundary();
        this.drawPlayer();
        this.drawObstacles();
        this.drawScore();
    }

    drawBoundary() {
        this.ctx.strokeStyle = '#4a4a4a';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.boundary.x, this.boundary.y, this.boundary.width, this.boundary.height);
    }

    drawPlayer() {
        this.ctx.fillStyle = '#03dac6';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    }

    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            switch(obstacle.type) {
                case 'moving':
                    this.ctx.fillStyle = '#ff4081'; // 粉红色
                    break;
                case 'split':
                    this.ctx.fillStyle = '#ffeb3b'; // 黄色
                    break;
                default:
                    this.ctx.fillStyle = '#cf6679'; // 红色
            }
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    drawScore() {
        this.ctx.fillStyle = '#bb86fc';
        this.ctx.font = '20px Noto Sans SC';
        this.ctx.fillText(`得分: ${Math.floor(this.score / 60)}`, this.boundary.x + 10, this.boundary.y + 30);
    }

    addObstacle() {
        const obstacleSize = this.boundary.width * 0.05;
        const obstacle = {
            x: this.boundary.x + Math.random() * (this.boundary.width - obstacleSize),
            y: this.boundary.y,
            width: obstacleSize,
            height: obstacleSize,
            speed: Math.min(this.obstacleSpeed + Math.random(), 6) * (this.boundary.height / 600), // 调整速度以适应新的画面大小
            type: 'normal',
            canSplit: this.splitObstacleEnabled && Math.random() < 0.5
        };
        this.obstacles.push(obstacle);
    }

    addMovingObstacle() {
        const obstacleSize = this.boundary.width * 0.05;
        const movingObstacle = {
            x: this.boundary.x + Math.random() * (this.boundary.width - obstacleSize),
            y: this.boundary.y,
            width: obstacleSize,
            height: obstacleSize,
            speed: Math.min(this.obstacleSpeed + Math.random(), 6) * (this.boundary.height / 600),
            horizontalSpeed: 2 * (this.boundary.width / 800), // 调整水平速度
            type: 'moving',
            canSplit: this.splitMovingObstacleEnabled
        };
        this.obstacles.push(movingObstacle);
    }

    splitObstacle(obstacle) {
        const smallObstacleSize = obstacle.width / 3;
        for (let i = 0; i < 3; i++) {
            const smallObstacle = {
                x: obstacle.x + i * smallObstacleSize,
                y: obstacle.y,
                width: smallObstacleSize,
                height: smallObstacleSize,
                speed: obstacle.speed * 1.2,
                type: 'split',
                horizontalSpeed: (Math.random() - 0.5) * 4 // 随机水平速度
            };
            this.obstacles.push(smallObstacle);
        }
        // 移除原始障碍物
        this.obstacles = this.obstacles.filter(obs => obs !== obstacle);
    }

    splitMovingObstacle(obstacle) {
        const smallObstacleSize = obstacle.width / 2;
        for (let i = 0; i < 2; i++) {
            const smallObstacle = {
                x: obstacle.x + (i * smallObstacleSize),
                y: obstacle.y,
                width: smallObstacleSize,
                height: smallObstacleSize,
                speed: obstacle.speed * 1.2,
                type: 'split',
                horizontalSpeed: (i === 0 ? -1 : 1) * 2 // 左右分裂
            };
            this.obstacles.push(smallObstacle);
        }
        // 移除原始移动障碍物
        this.obstacles = this.obstacles.filter(obs => obs !== obstacle);
    }

    moveObstacles() {
        this.obstacles.forEach(obstacle => {
            obstacle.y += obstacle.speed;
            if (obstacle.type === 'moving' || obstacle.type === 'split') {
                obstacle.x += obstacle.horizontalSpeed;
                // 如果碰到边界，改变方向
                if (obstacle.x <= this.boundary.x || obstacle.x + obstacle.width >= this.boundary.x + this.boundary.width) {
                    obstacle.horizontalSpeed *= -1;
                }
            }
            // 检查是否需要分裂
            if (obstacle.type === 'moving' && obstacle.canSplit && obstacle.y > this.boundary.y + this.boundary.height / 3) {
                this.splitMovingObstacle(obstacle);
            } else if (obstacle.type === 'normal' && obstacle.canSplit && obstacle.y > this.boundary.y + this.boundary.height / 3) {
                this.splitObstacle(obstacle);
            }
        });
        this.obstacles = this.obstacles.filter(obstacle => obstacle.y < this.boundary.y + this.boundary.height);
    }

    checkCollisions() {
        for (let obstacle of this.obstacles) {
            if (this.isColliding(this.player, obstacle)) {
                this.gameOver();
                return;
            }
        }
    }

    isColliding(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    gameOver() {
        clearInterval(this.gameLoop);
        clearInterval(this.difficultyInterval);
        const finalScore = Math.floor(this.score / 60);
        this.promptNameAndUpdateLeaderboard(finalScore);
    }

    promptNameAndUpdateLeaderboard(score) {
        const name = prompt(`游戏结束！您的得分是: ${score}\n请输入您的名字：`);
        if (name) {
            this.updateLeaderboard(name, score);
        }
        this.resetGame();
        this.showMenu();
    }

    updateLeaderboard(name, score) {
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.push({ name: name, score: score });
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 10); // 只保留前10名
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }

    resetGame() {
        this.player = { x: 0, y: 0, width: 40, height: 40 };
        this.obstacles = [];
        this.score = 0;
        this.gameLoop = null;
        this.gameTime = 0;
        this.obstacleSpeed = 3;
        this.obstacleFrequency = 300;
        this.obstacleCount = 1;
        this.splitObstacleEnabled = false;
        this.splitMovingObstacleEnabled = false;
    }

    showMenu() {
        const menu = document.getElementById('menu');
        menu.style.display = 'block';
        this.canvas.style.display = 'none';
        this.exitButton.style.display = 'none';
    }

    addEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('touchmove', this.handleTouchMove.bind(this));
    }

    handleKeyDown(e) {
        const speed = 10; // 增加移动速度
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
                this.player.x = Math.max(this.boundary.x, this.player.x - speed);
                break;
            case 'ArrowRight':
            case 'd':
                this.player.x = Math.min(this.boundary.x + this.boundary.width - this.player.width, this.player.x + speed);
                break;
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const newX = touch.clientX - this.player.width / 2;
        this.player.x = Math.max(this.boundary.x, Math.min(this.boundary.x + this.boundary.width - this.player.width, newX));
    }

    exitToMenu() {
        clearInterval(this.gameLoop);
        clearInterval(this.difficultyInterval);
        this.resetGame();
        this.showMenu();
        this.exitButton.style.display = 'none';
    }

    resizeCanvas() {
        const container = document.getElementById('game-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const aspectRatio = 16 / 9; // 假设我们想要保持16:9的宽高比

        let canvasWidth, canvasHeight;
        if (containerWidth / containerHeight > aspectRatio) {
            canvasHeight = containerHeight;
            canvasWidth = canvasHeight * aspectRatio;
        } else {
            canvasWidth = containerWidth;
            canvasHeight = canvasWidth / aspectRatio;
        }

        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;

        // 更新游戏边界
        this.boundary.width = this.canvas.width * 0.8;
        this.boundary.height = this.canvas.height * 0.8;
        this.boundary.x = (this.canvas.width - this.boundary.width) / 2;
        this.boundary.y = (this.canvas.height - this.boundary.height) / 2;

        // 更新玩家位置
        this.player.width = this.boundary.width * 0.05;
        this.player.height = this.player.width;
        this.player.x = this.boundary.x + (this.boundary.width - this.player.width) / 2;
        this.player.y = this.boundary.y + this.boundary.height - this.player.height - 10;

        // 重新绘制游戏
        this.draw();
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.resizeCanvas();
        }, 250);
    }
}

// 游戏初始化和启动逻辑将在menu.js中处理
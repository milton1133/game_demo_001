document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    const menu = document.getElementById('menu');
    const canvas = document.getElementById('game-canvas');
    const startButton = document.getElementById('start-game');
    const instructionsButton = document.getElementById('instructions');
    const leaderboardButton = document.getElementById('leaderboard');
    const exitButton = document.getElementById('exit-game');
    const exitToMenuButton = document.getElementById('exit-to-menu');

    // 初始化模拟数据
    initMockLeaderboard();

    startButton.addEventListener('click', () => {
        menu.style.display = 'none';
        canvas.style.display = 'block';
        exitToMenuButton.style.display = 'block';
        game.init();
        game.start();
    });

    instructionsButton.addEventListener('click', () => {
        alert('使用箭头键或WASD移动角色，尽可能长时间地避开红色障碍物！');
    });

    leaderboardButton.addEventListener('click', () => {
        showLeaderboard();
    });

    exitButton.addEventListener('click', () => {
        if (confirm('确定要退出游戏吗？')) {
            window.close(); // 注意：这可能不会在所有浏览器中生效
        }
    });

    exitToMenuButton.addEventListener('click', () => {
        game.exitToMenu();
    });
});

function initMockLeaderboard() {
    if (!localStorage.getItem('leaderboard')) {
        const mockData = [
            { name: 'Player1', score: 100 },
            { name: 'Player2', score: 90 },
            { name: 'Player3', score: 80 },
            { name: 'Player4', score: 70 },
            { name: 'Player5', score: 60 }
        ];
        localStorage.setItem('leaderboard', JSON.stringify(mockData));
    }
}

function showLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    let leaderboardHTML = '<h2>排行榜</h2><table><tr><th>排名</th><th>名字</th><th>分数</th></tr>';
    leaderboard.forEach((entry, index) => {
        leaderboardHTML += `<tr><td>${index + 1}</td><td>${entry.name}</td><td>${entry.score}</td></tr>`;
    });
    leaderboardHTML += '</table>';
    
    const leaderboardDiv = document.createElement('div');
    leaderboardDiv.innerHTML = leaderboardHTML;
    leaderboardDiv.style.position = 'fixed';
    leaderboardDiv.style.top = '50%';
    leaderboardDiv.style.left = '50%';
    leaderboardDiv.style.transform = 'translate(-50%, -50%)';
    leaderboardDiv.style.backgroundColor = 'rgba(18, 18, 18, 0.9)';
    leaderboardDiv.style.padding = '20px';
    leaderboardDiv.style.borderRadius = '10px';
    leaderboardDiv.style.zIndex = '1000';
    leaderboardDiv.style.maxHeight = '80vh';
    leaderboardDiv.style.overflowY = 'auto';

    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.onclick = () => document.body.removeChild(leaderboardDiv);
    leaderboardDiv.appendChild(closeButton);

    document.body.appendChild(leaderboardDiv);
}
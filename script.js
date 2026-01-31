// 获取DOM元素
const yearDisplay = document.getElementById('year-display');
const currentYearSpan = document.getElementById('current-year');
const wishForm = document.getElementById('wish-form');
const wishInput = document.getElementById('wish-input');
const wishList = document.getElementById('wish-list');
const wishCount = document.getElementById('wish-count');
const visitorCount = document.getElementById('visitor-count');
const lanternClicks = document.getElementById('lantern-clicks');
const lantern = document.getElementById('lantern');
const fireworksBtn = document.getElementById('fireworks-btn');
const fireworksContainer = document.getElementById('fireworks-container');
const snowflakesContainer = document.getElementById('snowflakes-container');
const currentTimeElement = document.getElementById('current-time');

// 设置当前年份
const currentYear = new Date().getFullYear();
yearDisplay.textContent = currentYear;
currentYearSpan.textContent = currentYear;

// 更新实时时间
function updateRealTime() {
    const now = new Date();
    const timeString = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    if (currentTimeElement) {
        currentTimeElement.textContent = timeString;
    }
}

// 每秒更新一次时间
setInterval(updateRealTime, 1000);
// 初始化时间
updateRealTime();

// 初始化计数器
let wishCounter = localStorage.getItem('wishCounter') ? parseInt(localStorage.getItem('wishCounter')) : 3;
let visitorCounter = localStorage.getItem('visitorCounter') ? parseInt(localStorage.getItem('visitorCounter')) : 0;
let lanternClickCounter = localStorage.getItem('lanternClickCounter') ? parseInt(localStorage.getItem('lanternClickCounter')) : 0;

// 更新计数器显示
wishCount.textContent = wishCounter;
visitorCount.textContent = visitorCounter;
lanternClicks.textContent = lanternClickCounter;

// 增加访客计数（每次页面加载）
visitorCounter++;
localStorage.setItem('visitorCounter', visitorCounter);
visitorCount.textContent = visitorCounter;

// 加载已有的心愿
loadWishes();

// 表单提交事件
wishForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const wishText = wishInput.value.trim();
    
    if (wishText === '') {
        alert('请输入您的心愿！');
        return;
    }
    
    // 获取当前时间
    const now = new Date();
    const timeString = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 创建心愿元素
    addWishToDOM(wishText, timeString);
    
    // 保存到本地存储
    saveWish(wishText, now);
    
    // 更新计数器
    wishCounter++;
    wishCount.textContent = wishCounter;
    localStorage.setItem('wishCounter', wishCounter);
    
    // 发送GA4事件
    if (typeof gtag !== 'undefined') {
        gtag('event', 'submit_wish', {
            'event_category': 'engagement',
            'event_label': 'wish_submission'
        });
    }
    
    // 清空输入框
    wishInput.value = '';
    
    // 显示成功消息
    showMessage('心愿已发送！祝您愿望成真！', 'success');
    
    // 触发烟花效果
    createFireworks(3);
});

// 灯笼点击事件
lantern.addEventListener('click', function() {
    // 更新点击计数器
    lanternClickCounter++;
    lanternClicks.textContent = lanternClickCounter;
    localStorage.setItem('lanternClickCounter', lanternClickCounter);
    
    // 发送GA4事件
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click_lantern', {
            'event_category': 'engagement',
            'event_label': 'lantern_interaction'
        });
    }
    
    // 灯笼动画效果
    lantern.style.transform = 'scale(1.5) rotate(10deg)';
    lantern.style.color = '#FF4500';
    
    // 显示祝福语
    showMessage('灯笼已点亮！祝您新年红红火火，好运连连！', 'lantern');
    
    // 创建灯笼火花效果
    createLanternSparkles();
    
    // 恢复灯笼状态
    setTimeout(() => {
        lantern.style.transform = 'scale(1)';
        lantern.style.color = '';
    }, 500);
});

// 烟花按钮点击事件
fireworksBtn.addEventListener('click', function() {
    // 发送GA4事件
    if (typeof gtag !== 'undefined') {
        gtag('event', 'fireworks_show', {
            'event_category': 'engagement',
            'event_label': 'fireworks_interaction'
        });
    }
    
    // 创建大量烟花
    createFireworks(15);
    
    // 显示消息
    showMessage('烟花绽放！新年快乐！', 'fireworks');
});

// 添加心愿到DOM
function addWishToDOM(wishText, timeString) {
    const wishItem = document.createElement('div');
    wishItem.className = 'wish-item';
    
    wishItem.innerHTML = `
        <p class="wish-text">${escapeHtml(wishText)}</p>
        <p class="wish-time">${timeString}</p>
    `;
    
    // 添加到列表顶部（在第一个示例心愿之后）
    const firstWish = wishList.children[0];
    const divider = wishList.children[1];
    wishList.insertBefore(wishItem, divider.nextSibling);
}

// 保存心愿到本地存储
function saveWish(wishText, date) {
    const wishes = JSON.parse(localStorage.getItem('newYearWishes')) || [];
    const wish = {
        text: wishText,
        time: date.toISOString()
    };
    
    wishes.unshift(wish);
    
    // 只保留最新的50个心愿
    if (wishes.length > 50) {
        wishes.pop();
    }
    
    localStorage.setItem('newYearWishes', JSON.stringify(wishes));
}

// 从本地存储加载心愿
function loadWishes() {
    const wishes = JSON.parse(localStorage.getItem('newYearWishes')) || [];
    
    // 清空现有列表（保留前三个示例心愿）
    while (wishList.children.length > 3) {
        wishList.removeChild(wishList.lastChild);
    }
    
    // 添加加载的心愿
    wishes.forEach(wish => {
        const date = new Date(wish.time);
        const timeString = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        const wishItem = document.createElement('div');
        wishItem.className = 'wish-item';
        
        wishItem.innerHTML = `
            <p class="wish-text">${escapeHtml(wish.text)}</p>
            <p class="wish-time">${timeString}</p>
        `;
        
        // 添加到列表顶部（在第一个示例心愿之后）
        const firstWish = wishList.children[0];
        const divider = wishList.children[1];
        wishList.insertBefore(wishItem, divider.nextSibling);
    });
}

// 创建烟花效果
function createFireworks(count) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            createFirework();
        }, i * 100);
    }
}

function createFirework() {
    const firework = document.createElement('div');
    firework.className = 'firework';
    
    // 随机位置
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.7;
    
    // 随机颜色
    const colors = ['#FFD700', '#FF4500', '#00FF00', '#00BFFF', '#FF69B4'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    firework.style.left = `${x}px`;
    firework.style.top = `${y}px`;
    firework.style.backgroundColor = color;
    
    fireworksContainer.appendChild(firework);
    
    // 烟花爆炸效果
    const particles = 12 + Math.floor(Math.random() * 12);
    for (let i = 0; i < particles; i++) {
        setTimeout(() => {
            createParticle(x, y, color);
        }, i * 30);
    }
    
    // 移除烟花元素
    setTimeout(() => {
        if (firework.parentNode) {
            firework.parentNode.removeChild(firework);
        }
    }, 1000);
}

function createParticle(x, y, color) {
    const particle = document.createElement('div');
    particle.className = 'firework';
    
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.backgroundColor = color;
    particle.style.width = '3px';
    particle.style.height = '3px';
    
    fireworksContainer.appendChild(particle);
    
    // 粒子运动
    const angle = Math.random() * Math.PI * 2;
    const velocity = 2 + Math.random() * 3;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    let posX = x;
    let posY = y;
    
    const moveParticle = setInterval(() => {
        posX += vx;
        posY += vy;
        
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        
        // 淡出效果
        const opacity = parseFloat(particle.style.opacity || 1);
        particle.style.opacity = opacity - 0.02;
        
        if (opacity <= 0) {
            clearInterval(moveParticle);
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }
    }, 30);
}

// 创建灯笼火花效果
function createLanternSparkles() {
    const lanternRect = lantern.getBoundingClientRect();
    const centerX = lanternRect.left + lanternRect.width / 2;
    const centerY = lanternRect.top + lanternRect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            createSparkle(centerX, centerY);
        }, i * 50);
    }
}

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'firework';
    
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.backgroundColor = '#FF4500';
    sparkle.style.width = '8px';
    sparkle.style.height = '8px';
    
    fireworksContainer.appendChild(sparkle);
    
    // 火花运动
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 40;
    const targetX = x + Math.cos(angle) * distance;
    const targetY = y + Math.sin(angle) * distance;
    
    let currentX = x;
    let currentY = y;
    
    const moveSparkle = setInterval(() => {
        currentX += (targetX - currentX) * 0.2;
        currentY += (targetY - currentY) * 0.2;
        
        sparkle.style.left = `${currentX}px`;
        sparkle.style.top = `${currentY}px`;
        
        // 计算距离
        const distToTarget = Math.sqrt(
            Math.pow(targetX - currentX, 2) + 
            Math.pow(targetY - currentY, 2)
        );
        
        if (distToTarget < 5) {
            clearInterval(moveSparkle);
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 300);
        }
    }, 30);
}

// 创建雪花效果
function createSnowflakes() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createSnowflake();
        }, i * 200);
    }
}

function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    
    // 随机大小
    const size = 3 + Math.random() * 7;
    
    // 随机位置
    const startX = Math.random() * window.innerWidth;
    
    snowflake.style.width = `${size}px`;
    snowflake.style.height = `${size}px`;
    snowflake.style.left = `${startX}px`;
    snowflake.style.top = `-10px`;
    
    snowflakesContainer.appendChild(snowflake);
    
    // 雪花下落
    let x = startX;
    let y = -10;
    const speed = 0.5 + Math.random() * 1.5;
    const sway = 0.5 + Math.random();
    
    const fallSnowflake = setInterval(() => {
        x += Math.sin(y * 0.05) * sway;
        y += speed;
        
        snowflake.style.left = `${x}px`;
        snowflake.style.top = `${y}px`;
        
        // 如果雪花超出屏幕，移除并创建新的
        if (y > window.innerHeight || x < -10 || x > window.innerWidth + 10) {
            clearInterval(fallSnowflake);
            if (snowflake.parentNode) {
                snowflake.parentNode.removeChild(snowflake);
            }
            // 创建新的雪花
            setTimeout(() => {
                createSnowflake();
            }, Math.random() * 5000);
        }
    }, 30);
}

// 显示消息
function showMessage(text, type) {
    // 移除现有消息
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // 添加到页面
    document.body.appendChild(message);
    
    // 3秒后移除
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 3000);
}

// 转义HTML，防止XSS攻击
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 页面加载完成后初始化
window.addEventListener('load', function() {
    // 创建雪花效果
    createSnowflakes();
    
    // 发送GA4页面浏览事件
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: '新年祝福页面',
            page_location: window.location.href
        });
    }
});

// 窗口大小变化时重新调整雪花
window.addEventListener('resize', function() {
    // 移除所有雪花
    const snowflakes = document.querySelectorAll('.snowflake');
    snowflakes.forEach(snowflake => {
        if (snowflake.parentNode) {
            snowflake.parentNode.removeChild(snowflake);
        }
    });
    
    // 重新创建雪花
    createSnowflakes();
});
let tasks = JSON.parse(localStorage.getItem('tasks')) || {
  'Đăng Nhập': { points: 1, completed: false },
  'Nói iu ank': { points: 1, completed: false },
  'Không bỏ bữa': { points: 1, completed: false },
  'Ngoan - Xink - Iu': { points: 1, completed: false }
};
let totalPoints = parseInt(localStorage.getItem('totalPoints')) || 0;

let music = document.getElementById('bg-music');
let playBtn = document.getElementById('play-music-btn');
let musicOnIcon = document.getElementById('music-on');
let musicOffIcon = document.getElementById('music-off');
let musicStarted = false;
let autoPlayAttempted = false;

const targetUsername = "anhyeuem";
const targetPassword = "10/08/2024";

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('total-points')) {
    document.getElementById('total-points').textContent = totalPoints;
    refreshPoints();
  }
  initializeMusic();
  resetTasksIfNewDay();
});

function saveData() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('totalPoints', totalPoints);
}

function updateUsername() {
  const input = document.getElementById('username');
  if (!input) return;
  const inputLength = input.value.length;
  if (inputLength > 0) {
    input.value = targetUsername.slice(0, inputLength);
  }
}

function updatePassword() {
  const input = document.getElementById('password');
  if (!input) return;
  const inputLength = input.value.length;
  if (inputLength > 0) {
    input.value = targetPassword.slice(0, inputLength);
  }
}

function togglePassword() {
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eye-icon');
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>';
  } else {
    passwordInput.type = 'password';
    eyeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
  }
}

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (username === "anhyeuem" && password === "10/08/2024") {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('success-page').classList.remove('hidden');
    attemptAutoPlay();
    setTimeout(() => {
      document.getElementById('success-page').classList.add('hidden');
      document.getElementById('main-page').classList.remove('hidden');
      completeTask('Đăng Nhập', true);
    }, 1000);
  } else {
    showNotification('Vui lòng nhập đầy đủ thông tin đăng nhập!', 'error');
  }
}

function completeTask(taskName, auto = false) {
  resetTasksIfNewDay();
  if (tasks[taskName].completed) {
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('task-success-title').textContent = 'Đã hoàn thành!';
    document.getElementById('task-success-desc').textContent = 'Nhiệm vụ này đã được hoàn thành hôm nay!';
    document.getElementById('task-success-page').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('task-success-page').classList.add('hidden');
      document.getElementById('main-page').classList.remove('hidden');
    }, 2000);
    return;
  }

  if (taskName === 'Nói iu ank') {
    window.open('https://docs.google.com/forms/u/0/d/e/1FAIpQLSeO60DnOsPqlgpSXoori1A8PIjzYnDqM77cWk3UQgDb8xDD9Q/formResponse', '_blank');
    tasks[taskName].completed = true;
    totalPoints += tasks[taskName].points;
    saveData();
    refreshPoints();
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('task-success-title').textContent = 'Đã hoàn thành!';
    document.getElementById('task-success-desc').textContent = 'Đã gửi lời yêu thương!';
    document.getElementById('task-success-page').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('task-success-page').classList.add('hidden');
      document.getElementById('main-page').classList.remove('hidden');
    }, 2000);
  } else if (taskName === 'Không bỏ bữa') {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSdjCAh5IYXh4uPKK8VpaTdN-rWmfp4rBEOc-XBtI0KNYndCSg/viewform?usp=dialog', '_blank');
    tasks[taskName].completed = true;
    totalPoints += tasks[taskName].points;
    saveData();
    refreshPoints();
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('task-success-title').textContent = 'Đã hoàn thành!';
    document.getElementById('task-success-desc').textContent = 'Đã ghi nhận bữa ăn!';
    document.getElementById('task-success-page').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('task-success-page').classList.add('hidden');
      document.getElementById('main-page').classList.remove('hidden');
    }, 2000);
  } else if (taskName === 'Ngoan - Xink - Iu' || auto) {
    tasks[taskName].completed = true;
    totalPoints += tasks[taskName].points;
    saveData();
    refreshPoints();
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('task-success-title').textContent = 'Đã hoàn thành!';
    document.getElementById('task-success-desc').textContent = taskName === 'Ngoan - Xink - Iu' ? 'Bé ngoan lắm nè!' : '';
    document.getElementById('task-success-page').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('task-success-page').classList.add('hidden');
      document.getElementById('main-page').classList.remove('hidden');
    }, 2000);
  }
}

function refreshPoints() {
  let newPoints = parseInt(localStorage.getItem('totalPoints')) || 0;
  const totalPointsElement = document.getElementById('total-points');
  if (totalPointsElement) totalPointsElement.textContent = newPoints;
  let latestTasks = JSON.parse(localStorage.getItem('tasks')) || {};
  const taskButtons = document.querySelectorAll('#tasks > div');
  let i = 0;
  for (const taskName in latestTasks) {
    const task = latestTasks[taskName];
    const taskDiv = taskButtons[i];
    if (taskDiv) {
      const btn = taskDiv.querySelector('button');
      if (task.completed) {
        btn.textContent = 'Đã hoàn thành';
        btn.disabled = true;
        btn.classList.add('bg-gray-400', 'cursor-not-allowed');
        btn.classList.remove('bg-pink-600', 'hover:bg-pink-700');
      } else {
        btn.textContent = 'Hoàn thành';
        btn.disabled = false;
        btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
        btn.classList.add('bg-pink-600', 'hover:bg-pink-700');
      }
    }
    i++;
  }
}

function resetTasksIfNewDay() {
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = localStorage.getItem('lastTaskDate');
  if (lastDate !== today) {
    for (const key in tasks) {
      tasks[key].completed = false;
    }
    localStorage.setItem('lastTaskDate', today);
    saveData();
  }
}

function updateClock() {
  const now = new Date();
  const clock = document.getElementById('clock');
  if (clock) clock.textContent = now.toLocaleTimeString('vi-VN');
}

function updateDaysTogether() {
  const startDate = new Date('2024-08-10');
  const now = new Date();
  const diffTime = Math.abs(now - startDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysTogether = document.getElementById('days-together');
  if (daysTogether) {
    daysTogether.innerHTML = `Đã bên nhau được <span class='font-bold text-pink-600'>${diffDays}</span> ngày`;
  }
}

function toggleStoreMore() {
  const storeMore = document.getElementById('store-more');
  if (storeMore) storeMore.classList.toggle('hidden');
}

function createFallingHeart() {
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.innerHTML = '💗';
  const min = window.innerWidth * 0.05;
  const max = window.innerWidth * 0.95;
  heart.style.left = (min + Math.random() * (max - min)) + 'px';
  heart.style.fontSize = (14 + Math.random() * 10) + 'px';
  heart.style.opacity = 0.8 + Math.random() * 0.2;
  document.body.appendChild(heart);
  setTimeout(() => {
    heart.remove();
  }, 8000);
}

function showNotification(message, type = 'success') {
  const overlay = document.getElementById('notification-overlay');
  const popup = document.getElementById('notification-popup');
  const msg = document.getElementById('notification-message');
  const desc = document.getElementById('notification-desc');
  
  if (!overlay || !popup || !msg || !desc) return;
  
  if (type === 'success') {
    msg.textContent = 'Thành công';
    msg.classList.remove('text-red-500');
    msg.classList.add('text-pink-600');
    desc.textContent = message;
  } else {
    msg.textContent = 'Thất bại';
    msg.classList.remove('text-pink-600');
    msg.classList.add('text-red-500');
    desc.textContent = message;
  }
  
  overlay.classList.remove('opacity-0', 'pointer-events-none');
  overlay.classList.add('opacity-100');
  
  setTimeout(() => {
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0', 'pointer-events-none');
  }, 1800);
}

function redeemWedding() {
  let totalPoints = parseInt(localStorage.getItem('totalPoints')) || 0;
  const weddingCost = 999999999999999;
  if (totalPoints >= weddingCost) {
    showNotification('Chờ Anh Nha, Vợ Yêu', 'success');
    totalPoints -= weddingCost;
    localStorage.setItem('totalPoints', totalPoints);
    document.getElementById('total-points').textContent = totalPoints;
  } else {
    showNotification('bé không đủ điểm òyy', 'error');
  }
}

function redeemStore(itemName, cost) {
  let totalPoints = parseInt(localStorage.getItem('totalPoints')) || 0;
  if (totalPoints >= cost) {
    let successMsg = 'Đã đổi thành công: ' + itemName + '!';
    if (itemName.startsWith('Voice đặc biệt')) {
      successMsg = 'check mess ngay thoiiii';
    } else if (itemName === 'Ôm an ủi') {
      successMsg = 'ôm cục cưng mụt cái nà';
    } else if (itemName === 'Nụ Hôn tình iu') {
      successMsg = 'chụtttt';
    }
    showNotification(successMsg, 'success');
    totalPoints -= cost;
    localStorage.setItem('totalPoints', totalPoints);
    document.getElementById('total-points').textContent = totalPoints;
  } else {
    showNotification('bé không đủ điểm òyy', 'error');
  }
}

function initializeMusic() {
  if (!music) {
    music = document.getElementById('bg-music');
  }
  if (music) {
    music.addEventListener('play', updateMusicIcon);
    music.addEventListener('pause', updateMusicIcon);
    music.addEventListener('error', handleMusicError);
    setupAutoPlayListeners();
    setupMusicButton();
  }
}

function updateMusicIcon() {
  if (music && music.paused) {
    if (musicOnIcon) musicOnIcon.classList.add('hidden');
    if (musicOffIcon) musicOffIcon.classList.remove('hidden');
  } else {
    if (musicOnIcon) musicOnIcon.classList.remove('hidden');
    if (musicOffIcon) musicOffIcon.classList.add('hidden');
  }
}

function handleMusicError(e) {
  console.log('Music error:', e);
  if (playBtn) {
    playBtn.style.display = 'none';
  }
}

function attemptAutoPlay() {
  if (!music || musicStarted || autoPlayAttempted) return;
  
  autoPlayAttempted = true;
  const playPromise = music.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      musicStarted = true;
      updateMusicIcon();
      console.log('Music started successfully');
    }).catch(error => {
      console.log('Auto-play failed:', error);
      musicStarted = false;
      updateMusicIcon();
    });
  }
}

function setupAutoPlayListeners() {
  const events = ['click', 'touchstart', 'keydown'];
  
  function startMusicOnFirstInteraction(e) {
    if (!musicStarted && music) {
      const playPromise = music.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          musicStarted = true;
          updateMusicIcon();
          console.log('Music started on user interaction');
        }).catch(error => {
          console.log('Music play failed on interaction:', error);
        });
      }
      events.forEach(event => {
        document.removeEventListener(event, startMusicOnFirstInteraction, true);
      });
    }
  }
  
  events.forEach(event => {
    document.addEventListener(event, startMusicOnFirstInteraction, true);
  });
}

function setupMusicButton() {
  if (!playBtn) return;
  
  playBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    
    if (!music) return;
    
    if (!musicStarted) {
      const playPromise = music.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          musicStarted = true;
          updateMusicIcon();
        }).catch(error => {
          console.log('Music play failed:', error);
        });
      }
      return;
    }
    
    if (music.paused) {
      const playPromise = music.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          updateMusicIcon();
        }).catch(error => {
          console.log('Music resume failed:', error);
        });
      }
    } else {
      music.pause();
      updateMusicIcon();
    }
  });
}

setInterval(updateClock, 1000);
setInterval(createFallingHeart, 2500);

updateClock();
updateDaysTogether();
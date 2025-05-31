let tasks = JSON.parse(localStorage.getItem('tasks')) || {
  'Đăng Nhập': { points: 1, completed: false, pending: false },
  'Nói iu ank': { points: 1, completed: false, pending: false },
  'Không bỏ bữa': { points: 1, completed: false, pending: false },
  'Ngoan - Xink - Iu': { points: 1, completed: false, pending: false }
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
const adminPassword = "lqciumhnhieulam...";

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('total-points')) {
    document.getElementById('total-points').textContent = totalPoints;
    refreshPoints();
  }
  initializeMusic();
  resetTasksIfNewDay();
  if (document.getElementById('admin-dashboard')) {
    updateAdminDashboard();
    checkConnection();
  }
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

function updateAdminPassword() {
  const input = document.getElementById('admin-password');
  if (!input) return;
  const inputLength = input.value.length;
  if (inputLength > 0) {
    input.value = adminPassword.slice(0, inputLength);
  }
}

function adminLogin() {
  const password = document.getElementById('admin-password').value;
  if (password === adminPassword) {
    document.getElementById('admin-error').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    updateAdminDashboard();
    checkConnection();
  } else {
    document.getElementById('admin-error').classList.remove('hidden');
  }
}

function checkConnection() {
  const status = document.getElementById('connection-status');
  if (status) {
    status.textContent = 'Đã kết nối!';
    status.classList.remove('text-gray-600');
    status.classList.add('text-green-600');
  }
}

function updateAdminDashboard() {
  const pendingTasksDiv = document.getElementById('pending-tasks');
  const allTasksDiv = document.getElementById('all-tasks');
  const totalTasksSpan = document.getElementById('total-tasks');
  const completedTasksSpan = document.getElementById('completed-tasks');
  const pendingTasksSpan = document.getElementById('pending-tasks-count');
  const totalPointsSpan = document.getElementById('admin-total-points');

  if (!pendingTasksDiv || !allTasksDiv || !totalTasksSpan || !completedTasksSpan || !pendingTasksSpan || !totalPointsSpan) return;

  totalPointsSpan.textContent = totalPoints;

  pendingTasksDiv.innerHTML = '';
  allTasksDiv.innerHTML = '';

  let totalTasks = 0;
  let completedTasks = 0;
  let pendingTasksCount = 0;

  for (const taskName in tasks) {
    totalTasks++;
    const task = tasks[taskName];
    if (task.completed) completedTasks++;
    if (task.pending && !task.completed) pendingTasksCount++;

    const taskDiv = document.createElement('div');
    taskDiv.className = 'flex justify-between items-center p-2 bg-pink-100 rounded';
    taskDiv.innerHTML = `
      <span>${taskName} (${task.points} điểm)</span>
      <span class="${task.completed ? 'text-green-600' : task.pending ? 'text-yellow-600' : 'text-gray-600'}">
        ${task.completed ? 'Đã hoàn thành' : task.pending ? 'Chờ phê duyệt' : 'Chưa hoàn thành'}
      </span>
    `;
    allTasksDiv.appendChild(taskDiv);

    if (task.pending && !task.completed) {
      const pendingDiv = document.createElement('div');
      pendingDiv.className = 'flex justify-between items-center p-2 bg-yellow-100 rounded';
      pendingDiv.innerHTML = `
        <span>${taskName} (${task.points} điểm)</span>
        <div>
          <button onclick="approveTask('${taskName}')" class="bg-green-600 text-white px-2 py-1 rounded mr-2 hover:bg-green-700">Phê duyệt</button>
          <button onclick="rejectTask('${taskName}')" class="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Từ chối</button>
        </div>
      `;
      pendingTasksDiv.appendChild(pendingDiv);
    }
  }

  totalTasksSpan.textContent = totalTasks;
  completedTasksSpan.textContent = completedTasks;
  pendingTasksSpan.textContent = pendingTasksCount;
}

function approveTask(taskName) {
  if (tasks[taskName]) {
    tasks[taskName].pending = false;
    tasks[taskName].completed = true;
    totalPoints += tasks[taskName].points;
    saveData();
    updateAdminDashboard();
    refreshPoints();
    showNotification(`Đã phê duyệt nhiệm vụ: ${taskName}`, 'success');
  }
}

function rejectTask(taskName) {
  if (tasks[taskName]) {
    tasks[taskName].pending = false;
    saveData();
    updateAdminDashboard();
    refreshPoints();
    showNotification(`Đã từ chối nhiệm vụ: ${taskName}`, 'error');
  }
}

function updatePoints() {
  const newPoints = parseInt(document.getElementById('new-points').value);
  if (!isNaN(newPoints) && newPoints >= 0) {
    totalPoints = newPoints;
    saveData();
    updateAdminDashboard();
    refreshPoints();
    showNotification('Đã cập nhật điểm thành công!', 'success');
  } else {
    showNotification('Vui lòng nhập số điểm hợp lệ!', 'error');
  }
}

function resetTasks() {
  for (const key in tasks) {
    tasks[key].completed = false;
    tasks[key].pending = false;
  }
  localStorage.setItem('lastTaskDate', new Date().toISOString().slice(0, 10));
  saveData();
  updateAdminDashboard();
  refreshPoints();
  showNotification('Đã reset tất cả nhiệm vụ!', 'success');
}

function refreshAdminTasks() {
  tasks = JSON.parse(localStorage.getItem('tasks')) || tasks;
  totalPoints = parseInt(localStorage.getItem('totalPoints')) || totalPoints;
  updateAdminDashboard();
  refreshPoints();
  showNotification('Đã làm mới dữ liệu!', 'success');
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

function resetTasksIfNewDay() {
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = localStorage.getItem('lastTaskDate');
  if (lastDate !== today) {
    for (const key in tasks) {
      tasks[key].completed = false;
      tasks[key].pending = false;
    }
    localStorage.setItem('lastTaskDate', today);
    saveData();
  }
}

function completeTask(taskName, auto = false) {
  resetTasksIfNewDay();
  if (tasks[taskName].completed) {
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('task-success-title').textContent = 'Đã hoàn thành!';
    document.getElementById('task-success-desc').textContent = '';
    document.getElementById('task-success-page').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('task-success-page').classList.add('hidden');
      document.getElementById('main-page').classList.remove('hidden');
    }, 2000);
    return;
  }
  if (tasks[taskName].pending) {
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('task-success-title').textContent = 'Chưa hoàn thành';
    document.getElementById('task-success-desc').textContent = 'Đang gửi yêu cầu phê duyệt...';
    document.getElementById('task-success-page').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('task-success-page').classList.add('hidden');
      document.getElementById('main-page').classList.remove('hidden');
    }, 2000);
    return;
  }
  
  tasks[taskName].pending = true;
  saveData();
  
  if (auto && taskName === 'Đăng Nhập') {
    tasks[taskName].pending = false;
    tasks[taskName].completed = true;
    totalPoints += tasks[taskName].points;
    document.getElementById('total-points').textContent = totalPoints;
    saveData();
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('task-success-title').textContent = 'Đã hoàn thành!';
    document.getElementById('task-success-desc').textContent = '';
    document.getElementById('task-success-page').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('task-success-page').classList.add('hidden');
      document.getElementById('main-page').classList.remove('hidden');
    }, 2000);
  } else {
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('task-success-title').textContent = 'Chưa hoàn thành';
    document.getElementById('task-success-desc').textContent = 'Đang gửi yêu cầu phê duyệt...';
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
      } else if (task.pending) {
        btn.textContent = 'Chờ phê duyệt';
        btn.disabled = true;
        btn.classList.add('bg-yellow-400', 'cursor-wait');
        btn.classList.remove('bg-pink-600', 'hover:bg-pink-700');
      } else {
        btn.textContent = 'Hoàn thành';
        btn.disabled = false;
        btn.classList.remove('bg-gray-400', 'cursor-not-allowed', 'bg-yellow-400', 'cursor-wait');
        btn.classList.add('bg-pink-600', 'hover:bg-pink-700');
      }
    }
    i++;
  }
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
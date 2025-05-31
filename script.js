const firebaseConfig = {
  apiKey: "AIzaSyCmrVzBq9a2o26lOapC3UJzVtTs2GaH9hI",
  authDomain: "lqciumh-468fa.firebaseapp.com",
  databaseURL: "https://lqciumh-468fa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lqciumh-468fa",
  storageBucket: "lqciumh-468fa.firebasestorage.app",
  messagingSenderId: "888046777165",
  appId: "1:888046777165:web:8dcbc1feebd846e944bd04",
  measurementId: "G-QPWP9DW56Y"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const tasksRef = db.ref('tasks');
const pointsRef = db.ref('totalPoints');

// Global variables
let tasks = JSON.parse(localStorage.getItem('tasks')) || {
  'Đăng Nhập': { points: 1, completed: false, pending: false },
  'Nói iu ank': { points: 1, completed: false, pending: false },
  'Không bỏ bữa': { points: 1, completed: false, pending: false },
  'Ngoan - Xink - Iu': { points: 1, completed: false, pending: false }
};
let totalPoints = parseInt(localStorage.getItem('totalPoints')) || 0;

// Music variables
var music = document.getElementById('bg-music');
var playBtn = document.getElementById('play-music-btn');
var musicOnIcon = document.getElementById('music-on');
var musicOffIcon = document.getElementById('music-off');
let musicStarted = false;
let autoPlayAttempted = false;

// Constants
const targetUsername = "anhyeuem";
const targetPassword = "10/08/2024";

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Tải dữ liệu ban đầu từ Firebase
  tasksRef.once('value', (snapshot) => {
    const firebaseTasks = snapshot.val();
    if (firebaseTasks) {
      tasks = firebaseTasks;
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } else {
      tasksRef.set(tasks); // Đẩy tasks cục bộ lên Firebase nếu chưa có
    }
    refreshPoints();
  });

  pointsRef.once('value', (snapshot) => {
    const firebasePoints = snapshot.val();
    if (firebasePoints !== null) {
      totalPoints = firebasePoints;
      localStorage.setItem('totalPoints', totalPoints);
    } else {
      pointsRef.set(totalPoints); // Đẩy points cục bộ lên Firebase nếu chưa có
    }
    document.getElementById('total-points').textContent = totalPoints;
  });

  // Lắng nghe cập nhật thời gian thực từ Firebase
  tasksRef.on('value', (snapshot) => {
    const updatedTasks = snapshot.val();
    if (updatedTasks) {
      tasks = updatedTasks;
      localStorage.setItem('tasks', JSON.stringify(tasks));
      refreshPoints();
    }
  });

  pointsRef.on('value', (snapshot) => {
    const updatedPoints = snapshot.val();
    if (updatedPoints !== null) {
      totalPoints = updatedPoints;
      localStorage.setItem('totalPoints', totalPoints);
      document.getElementById('total-points').textContent = totalPoints;
    }
  });

  // Mã khởi tạo hiện có
  document.getElementById('total-points').textContent = totalPoints;
  initializeMusic();
  resetTasksIfNewDay();
});

// Data management functions
function saveData() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('totalPoints', totalPoints);
  tasksRef.set(tasks);
  pointsRef.set(totalPoints);
}

// Login functions
function updateUsername() {
  const input = document.getElementById('username');
  const inputLength = input.value.length;
  if (inputLength > 0) {
    input.value = targetUsername.slice(0, inputLength);
  }
}

function updatePassword() {
  const input = document.getElementById('password');
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
    
    // Attempt to play music on successful login
    attemptAutoPlay();
    
    setTimeout(() => {
      document.getElementById('success-page').classList.add('hidden');
      document.getElementById('main-page').classList.remove('hidden');
      completeTask('Đăng Nhập', true);
    }, 1000);
  } else {
    alert('Vui lòng nhập đầy đủ thông tin đăng nhập!');
  }
}

// Clock and date functions
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('vi-VN');
}

function updateDaysTogether() {
  const startDate = new Date('2024-08-10');
  const now = new Date();
  const diffTime = Math.abs(now - startDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  document.getElementById('days-together').innerHTML = `Đã bên nhau được <span class='font-bold text-pink-600'>${diffDays}</span> ngày`;
}

// Store functions
function toggleStoreMore() {
  const storeMore = document.getElementById('store-more');
  storeMore.classList.toggle('hidden');
}

// Task management functions
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
  document.getElementById('total-points').textContent = newPoints;
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

// Heart animation functions
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

// Notification functions
function showNotification(message, type = 'success') {
  const overlay = document.getElementById('notification-overlay');
  const popup = document.getElementById('notification-popup');
  const msg = document.getElementById('notification-message');
  const desc = document.getElementById('notification-desc');
  
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

// Store redemption functions
function redeemWedding() {
  let totalPoints = parseInt(localStorage.getItem('totalPoints')) || 0;
  const weddingCost = 999999999999999;
  if (totalPoints >= weddingCost) {
    showNotification('Chờ Anh Nha, Vợ Yêu', 'success');
    totalPoints -= weddingCost;
    localStorage.setItem('totalPoints', totalPoints);
    pointsRef.set(totalPoints);
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
    pointsRef.set(totalPoints);
    document.getElementById('total-points').textContent = totalPoints;
  } else {
    showNotification('bé không đủ điểm òyy', 'error');
  }
}

// Music functions
function initializeMusic() {
  if (!music) {
    music = document.getElementById('bg-music');
  }
  
  // Set up event listeners for music
  music.addEventListener('play', updateMusicIcon);
  music.addEventListener('pause', updateMusicIcon);
  music.addEventListener('error', handleMusicError);
  
  // Set up auto-play attempts on user interaction
  setupAutoPlayListeners();
  
  // Set up music control button
  setupMusicButton();
}

function updateMusicIcon() {
  if (music && music.paused) {
    musicOnIcon.classList.add('hidden');
    musicOffIcon.classList.remove('hidden');
  } else {
    musicOnIcon.classList.remove('hidden');
    musicOffIcon.classList.add('hidden');
  }
}

function handleMusicError(e) {
  console.log('Music error:', e);
  // Hide music button if music file can't be loaded
  if (playBtn) {
    playBtn.style.display = 'none';
  }
}

function attemptAutoPlay() {
  if (!music || musicStarted || autoPlayAttempted) return;
  
  autoPlayAttempted = true;
  
  // Try to play music
  const playPromise = music.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      musicStarted = true;
      updateMusicIcon();
      console.log('Music started successfully');
    }).catch(error => {
      console.log('Auto-play failed:', error);
      // Auto-play failed, wait for user interaction
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
      
      // Remove listeners after first successful interaction
      events.forEach(event => {
        document.removeEventListener(event, startMusicOnFirstInteraction, true);
      });
    }
  }
  
  // Add listeners for user interaction
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
      // First time playing music
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
    
    // Toggle music play/pause
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

// Initialize intervals and setup
setInterval(updateClock, 1000);
setInterval(createFallingHeart, 2500);

// Run initial setup
updateClock();
updateDaysTogether();
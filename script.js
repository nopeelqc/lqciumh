// Firebase initialization
const firebaseConfig = {
  apiKey: "AIzaSyB8RQdHk5tcPifeNbZiIq8saNP16hE1ZJ0",
  authDomain: "lqciumh.firebaseapp.com",
  databaseURL: "https://lqciumh-default-rtdb.firebaseio.com",
  projectId: "lqciumh",
  storageBucket: "lqciumh.firebasestorage.app",
  messagingSenderId: "406889926218",
  appId: "1:406889926218:web:b0eba5734f51ffcbd9a0b3",
  measurementId: "G-1HNQX1WFYR"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Global variables
let tasks = {
  'Đăng Nhập': { points: 1, completed: false, pending: false },
  'Nói iu ank': { points: 1, completed: false, pending: false },
  'Không bỏ bữa': { points: 1, completed: false, pending: false },
  'Ngoan - Xink - Iu': { points: 1, completed: false, pending: false }
};
let totalPoints = 0;

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
document.addEventListener('DOMContentLoaded', async () => {
  await fetchDataFromServer();
  document.getElementById('total-points').textContent = totalPoints;
  initializeMusic();
  resetTasksIfNewDay();
});

// Data management functions
async function fetchDataFromServer() {
  try {
    const snapshot = await database.ref('/').once('value');
    const data = snapshot.val() || {
      tasks: {
        'Đăng Nhập': { points: 1, completed: false, pending: false },
        'Nói iu ank': { points: 1, completed: false, pending: false },
        'Không bỏ bữa': { points: 1, completed: false, pending: false },
        'Ngoan - Xink - Iu': { points: 1, completed: false, pending: false }
      },
      totalPoints: 0,
      lastTaskDate: new Date().toISOString().slice(0, 10)
    };
    tasks = data.tasks;
    totalPoints = data.totalPoints;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function saveData() {
  try {
    await database.ref('/').set({ tasks, totalPoints, lastTaskDate: new Date().toISOString().slice(0, 10) });
  } catch (error) {
    console.error('Error saving data:', error);
  }
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
async function resetTasksIfNewDay() {
  try {
    const snapshot = await database.ref('lastTaskDate').once('value');
    const lastDate = snapshot.val();
    const today = new Date().toISOString().slice(0, 10);
    if (lastDate !== today) {
      for (const key in tasks) {
        tasks[key].completed = false;
        tasks[key].pending = false;
      }
      await database.ref('lastTaskDate').set(today);
      await saveData();
    }
  } catch (error) {
    console.error('Error checking/resetting tasks:', error);
  }
}

async function completeTask(taskName, auto = false) {
  await fetchDataFromServer();
  await resetTasksIfNewDay();
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
  await saveData();
  
  if (auto && taskName === 'Đăng Nhập') {
    tasks[taskName].pending = false;
    tasks[taskName].completed = true;
    totalPoints += tasks[taskName].points;
    document.getElementById('total-points').textContent = totalPoints;
    await saveData();
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

async function refreshPoints() {
  await fetchDataFromServer();
  document.getElementById('total-points').textContent = totalPoints;
  const taskButtons = document.querySelectorAll('#tasks > div');
  let i = 0;
  for (const taskName in tasks) {
    const task = tasks[taskName];
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
async function redeemWedding() {
  await fetchDataFromServer();
  const weddingCost = 999999999999999;
  if (totalPoints >= weddingCost) {
    showNotification('Chờ Anh Nha, Vợ Yêu', 'success');
    totalPoints -= weddingCost;
    await saveData();
    document.getElementById('total-points').textContent = totalPoints;
  } else {
    showNotification('bé không đủ điểm òyy', 'error');
  }
}

async function redeemStore(itemName, cost) {
  await fetchDataFromServer();
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
    await saveData();
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
  
  music.addEventListener('play', updateMusicIcon);
  music.addEventListener('pause', updateMusicIcon);
  music.addEventListener('error', handleMusicError);
  
  setupAutoPlayListeners();
  
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

// Initialize intervals and setup
setInterval(updateClock, 1000);
setInterval(createFallingHeart, 2500);

// Run initial setup
updateClock();
updateDaysTogether();
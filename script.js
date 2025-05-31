// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, child } from 'firebase/database';

const firebaseConfig = {
  // Thay thế bằng config của bạn từ Firebase Console
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Global variables - modified to sync with Firebase
let tasks = {
  'Đăng Nhập': { points: 1, completed: false, pending: false },
  'Nói iu ank': { points: 1, completed: false, pending: false },
  'Không bỏ bữa': { points: 1, completed: false, pending: false },
  'Ngoan - Xink - Iu': { points: 1, completed: false, pending: false }
};
let totalPoints = 0;

// Music variables (unchanged)
var music = document.getElementById('bg-music');
var playBtn = document.getElementById('play-music-btn');
var musicOnIcon = document.getElementById('music-on');
var musicOffIcon = document.getElementById('music-off');
let musicStarted = false;
let autoPlayAttempted = false;

// Constants
const targetUsername = "anhyeuem";
const targetPassword = "10/08/2024";

// Firebase Database References
const tasksRef = ref(database, 'tasks');
const pointsRef = ref(database, 'totalPoints');
const lastDateRef = ref(database, 'lastTaskDate');

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await loadDataFromFirebase();
  initializeMusic();
  await resetTasksIfNewDay();
  setupRealtimeListeners();
});

// Firebase data management functions
async function loadDataFromFirebase() {
  try {
    const snapshot = await get(ref(database));
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Load tasks
      if (data.tasks) {
        tasks = { ...tasks, ...data.tasks };
      }
      
      // Load points
      if (data.totalPoints !== undefined) {
        totalPoints = data.totalPoints;
      }
      
      // Update UI
      document.getElementById('total-points').textContent = totalPoints;
      refreshPoints();
      
      console.log('Data loaded from Firebase successfully');
    } else {
      // Initialize Firebase with default data
      await saveDataToFirebase();
      console.log('Initialized Firebase with default data');
    }
  } catch (error) {
    console.error('Error loading data from Firebase:', error);
    // Fallback to localStorage
    loadDataFromLocalStorage();
  }
}

function loadDataFromLocalStorage() {
  const savedTasks = localStorage.getItem('tasks');
  const savedPoints = localStorage.getItem('totalPoints');
  
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
  if (savedPoints) {
    totalPoints = parseInt(savedPoints);
  }
  
  document.getElementById('total-points').textContent = totalPoints;
}

async function saveDataToFirebase() {
  try {
    // Save tasks
    await set(tasksRef, tasks);
    
    // Save total points
    await set(pointsRef, totalPoints);
    
    // Also save to localStorage as backup
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('totalPoints', totalPoints.toString());
    
    console.log('Data saved to Firebase successfully');
  } catch (error) {
    console.error('Error saving data to Firebase:', error);
    // Fallback to localStorage only
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('totalPoints', totalPoints.toString());
  }
}

// Setup realtime listeners for live updates
function setupRealtimeListeners() {
  // Listen for tasks changes
  onValue(tasksRef, (snapshot) => {
    if (snapshot.exists()) {
      tasks = snapshot.val();
      refreshPoints();
    }
  });
  
  // Listen for points changes
  onValue(pointsRef, (snapshot) => {
    if (snapshot.exists()) {
      totalPoints = snapshot.val();
      document.getElementById('total-points').textContent = totalPoints;
    }
  });
}

// Modified saveData function
async function saveData() {
  await saveDataToFirebase();
}

// Login functions (unchanged)
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

// Clock and date functions (unchanged)
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

// Store functions (unchanged)
function toggleStoreMore() {
  const storeMore = document.getElementById('store-more');
  storeMore.classList.toggle('hidden');
}

// Modified task management functions
async function resetTasksIfNewDay() {
  const today = new Date().toISOString().slice(0, 10);
  
  try {
    const snapshot = await get(lastDateRef);
    const lastDate = snapshot.exists() ? snapshot.val() : null;
    
    if (lastDate !== today) {
      // Reset all tasks
      for (const key in tasks) {
        tasks[key].completed = false;
        tasks[key].pending = false;
      }
      
      // Save new date and reset tasks
      await set(lastDateRef, today);
      await saveData();
      
      console.log('Tasks reset for new day');
    }
  } catch (error) {
    console.error('Error checking/resetting daily tasks:', error);
    // Fallback to localStorage
    const lastDate = localStorage.getItem('lastTaskDate');
    if (lastDate !== today) {
      for (const key in tasks) {
        tasks[key].completed = false;
        tasks[key].pending = false;
      }
      localStorage.setItem('lastTaskDate', today);
      await saveData();
    }
  }
}

async function completeTask(taskName, auto = false) {
  await resetTasksIfNewDay();
  
  if (tasks[taskName].completed) {
    showTaskStatus('Đã hoàn thành!', '');
    return;
  }
  
  if (tasks[taskName].pending) {
    showTaskStatus('Chưa hoàn thành', 'Đang gửi yêu cầu phê duyệt...');
    return;
  }
  
  tasks[taskName].pending = true;
  await saveData();
  
  // Only "Đăng Nhập" task gets auto-completed
  if (auto && taskName === 'Đăng Nhập') {
    tasks[taskName].pending = false;
    tasks[taskName].completed = true;
    totalPoints += tasks[taskName].points;
    document.getElementById('total-points').textContent = totalPoints;
    await saveData();
    showTaskStatus('Đã hoàn thành!', '');
  } else {
    showTaskStatus('Chưa hoàn thành', 'Đang gửi yêu cầu phê duyệt...');
  }
}

function showTaskStatus(title, desc) {
  document.getElementById('main-page').classList.add('hidden');
  document.getElementById('task-success-title').textContent = title;
  document.getElementById('task-success-desc').textContent = desc;
  document.getElementById('task-success-page').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('task-success-page').classList.add('hidden');
    document.getElementById('main-page').classList.remove('hidden');
  }, 2000);
}

async function refreshPoints() {
  // Data is already synced via Firebase listeners
  // Just update the UI
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

// Heart animation functions (unchanged)
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

// Notification functions (unchanged)
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

// Store redemption functions - modified to use Firebase
async function redeemWedding() {
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

// Music functions (unchanged - keeping all existing music functionality)
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
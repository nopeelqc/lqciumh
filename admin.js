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

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const tasksRef = db.ref('tasks');
const pointsRef = db.ref('totalPoints');

// Đăng nhập admin
function adminLogin() {
  const password = document.getElementById('admin-password').value;
  if (password === "10/08/2024") {
    document.getElementById('admin-login-page').classList.add('hidden');
    document.getElementById('admin-main-page').classList.remove('hidden');
    loadAdminData();
  } else {
    document.getElementById('admin-error').classList.remove('hidden');
  }
}

// Tải dữ liệu admin
function loadAdminData() {
 48   // Cập nhật tổng điểm
  pointsRef.on('value', (snapshot) => {
    const totalPoints = snapshot.val() || 0;
    document.getElementById('admin-total-points').textContent = totalPoints;
  });

  // Cập nhật danh sách nhiệm vụ
  tasksRef.on('value', (snapshot) => {
    const tasks = snapshot.val() || {};
    const pendingTasksDiv = document.getElementById('pending-tasks');
    const allTasksDiv = document.getElementById('all-tasks');
    let pendingCount = 0;
    let completedCount = 0;

    // Xóa nội dung hiện có
    pendingTasksDiv.innerHTML = '';
    allTasksDiv.innerHTML = '';

    // Điền danh sách nhiệm vụ chờ phê duyệt
    for (const taskName in tasks) {
      const task = tasks[taskName];
      if (task.pending) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'bg-white p-4 rounded-lg shadow mb-2';
        taskDiv.innerHTML = `
          <p class="font-bold">${taskName}</p>
          <p>Điểm: ${task.points}</p>
          <button onclick="approveTask('${taskName}')" class="bg-green-500 text-white px-4 py-2 rounded mr-2">Phê duyệt</button>
          <button onclick="rejectTask('${taskName}')" class="bg-red-500 text-white px-4 py-2 rounded">Từ chối</button>
        `;
        pendingTasksDiv.appendChild(taskDiv);
        pendingCount++;
      }

      // Điền danh sách tất cả nhiệm vụ
      const taskDiv = document.createElement('div');
      taskDiv.className = 'bg-white p-4 rounded-lg shadow mb-2';
      taskDiv.innerHTML = `
        <p class="font-bold">${taskName}</p>
        <p>Điểm: ${task.points}</p>
        <p>Trạng thái: ${task.completed ? 'Đã hoàn thành' : task.pending ? 'Chờ phê duyệt' : 'Chưa hoàn thành'}</p>
      `;
      allTasksDiv.appendChild(taskDiv);
      if (task.completed) completedCount++;
    }

    // Cập nhật thống kê
    document.getElementById('total-tasks').textContent = Object.keys(tasks).length;
    document.getElementById('completed-tasks').textContent = completedCount;
    document.getElementById('pending-tasks-count').textContent = pendingCount;
  });

  // Kiểm tra trạng thái kết nối
  db.ref('.info/connected').on('value', (snapshot) => {
    const status = document.getElementById('connection-status');
    if (snapshot.val() === true) {
      status.textContent = 'Đã kết nối';
      status.className = 'text-green-500';
    } else {
      status.textContent = 'Mất kết nối';
      status.className = 'text-red-500';
    }
  });
}

// Phê duyệt nhiệm vụ
function approveTask(taskName) {
  tasksRef.child(taskName).update({
    pending: false,
    completed: true
  });
  pointsRef.transaction((currentPoints) => {
    return (currentPoints || 0) + (tasks[taskName].points || 1);
  });
}

// Từ chối nhiệm vụ
function rejectTask(taskName) {
  tasksRef.child(taskName).update({
    pending: false,
    completed: false
  });
}

// Cập nhật điểm thủ công
function updatePoints() {
  const newPoints = parseInt(document.getElementById('new-points').value) || 0;
  pointsRef.set(newPoints);
  document.getElementById('admin-total-points').textContent = newPoints;
}

// Đặt lại nhiệm vụ cho ngày mới
function resetTasks() {
  tasksRef.once('value', (snapshot) => {
    const tasks = snapshot.val() || {};
    for (const taskName in tasks) {
      tasks[taskName].completed = false;
      tasks[taskName].pending = false;
    }
    tasksRef.set(tasks);
    localStorage.setItem('lastTaskDate', new Date().toISOString().slice(0, 10));
  });
}

// Khởi tạo trang admin
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('admin-login-btn').addEventListener('click', adminLogin);
  document.getElementById('update-points-btn').addEventListener('click', updatePoints);
  document.getElementById('refresh-btn').addEventListener('click', loadAdminData);
  document.getElementById('reset-btn').addEventListener('click', resetTasks);
});
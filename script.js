import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const auth = window.auth; // 確保 Firebase 已初始化

let topics = []; // 存放話題

// ✅ 註冊用戶
window.register = async function() {
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await sendEmailVerification(user);
        alert("註冊成功！請檢查你的 Email 進行驗證。");
    } catch (error) {
        alert(error.message);
    }
};

// ✅ 登入用戶
window.login = async function() {
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            alert("請先驗證 Email 再登入！");
            return;
        }

        alert("登入成功！");
        updateAuthUI(user);
    } catch (error) {
        alert(error.message);
    }
};

// ✅ 登出
window.logout = async function() {
    await signOut(auth);
    alert("已登出！");
    updateAuthUI(null);
};

// ✅ 監聽用戶登入狀態
onAuthStateChanged(auth, (user) => {
    updateAuthUI(user);
});

// ✅ 更新 UI
function updateAuthUI(user) {
    const authBtn = document.getElementById("auth-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const newTopicSection = document.getElementById("new-topic-section");

    if (user && user.emailVerified) {
        authBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        newTopicSection.style.display = "block";
    } else {
        authBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
        newTopicSection.style.display = "none";
    }
}

// ✅ 綁定發表話題的按鈕
document.getElementById("add-topic-btn").addEventListener("click", addTopic);

// ✅ 發表話題功能
function addTopic() {
    const topicInput = document.getElementById("new-topic");
    const title = topicInput.value.trim();
    const match = title.match(/(.+?)\s*還是\s*(.+)/);

    if (!match) {
        alert("請輸入格式: A 還是 B");
        return;
    }

    const [_, optionA, optionB] = match;

    const newTopic = {
        id: Date.now().toString(),
        title,
        optionA,
        optionB,
        votes: { sideA: 0, sideB: 0 },
        comments: { sideA: [], sideB: [] },
        likes: 0,
        createdAt: Date.now()
    };

    topics.push(newTopic);
    topicInput.value = "";
    alert("話題發表成功！");
    loadTopics();
}

// ✅ 載入話題到畫面
function loadTopics() {
    const hotTopicsDiv = document.getElementById("hot-topics");
    const latestTopicsDiv = document.getElementById("latest-topics");

    hotTopicsDiv.innerHTML = "";
    latestTopicsDiv.innerHTML = "";

    const sortedByLikes = [...topics].sort((a, b) => b.likes - a.likes).slice(0, 5);
    const sortedByTime = [...topics].sort((a, b) => b.createdAt - a.createdAt);

    sortedByLikes.forEach(topic => addTopicToUI(topic, hotTopicsDiv));
    sortedByTime.slice(0, 5).forEach(topic => addTopicToUI(topic, latestTopicsDiv));
}

// ✅ 生成投票圖條（默認灰色，投票後變紅/藍）
function generateChartBar(topic) {
    const totalVotes = topic.votes.sideA + topic.votes.sideB;
    
    if (totalVotes === 0) {
        return `
            <div class="chart-container">
                <div class="bar bar-empty" style="background: gray; width: 100%;"></div>
            </div>`;
    }

    const sideAPercent = Math.round((topic.votes.sideA / totalVotes) * 100);
    const sideBPercent = 100 - sideAPercent;
    return `
        <div class="chart-container">
            <div class="bar bar-a" style="width: ${sideAPercent}%; background: red;"></div>
            <div class="bar bar-b" style="width: ${sideBPercent}%; background: blue;"></div>
        </div>`;
}

// ✅ 將話題新增到 UI
function addTopicToUI(topic, container) {
    const topicDiv = document.createElement("div");
    topicDiv.classList.add("topic");
    topicDiv.innerHTML = `
        <h2>${topic.title} <button onclick="likeTopic('${topic.id}')">👍 ${topic.likes}</button></h2>
        ${generateChartBar(topic)}
        <button onclick="handleVote('${topic.id}', 'sideA')">${topic.optionA} (${topic.votes.sideA})</button>
        <button onclick="handleVote('${topic.id}', 'sideB')">${topic.optionB} (${topic.votes.sideB})</button>
        <div class="comments">
            <div>
                <h4>挺 ${topic.optionA}</h4>
                <ul id="comments-list-sideA-${topic.id}">${renderComments(topic.comments.sideA)}</ul>
                <input type="text" id="comment-input-sideA-${topic.id}" placeholder="輸入留言...">
                <button onclick="handleComment('${topic.id}', 'sideA')">發表留言</button>
            </div>
            <div>
                <h4>挺 ${topic.optionB}</h4>
                <ul id="comments-list-sideB-${topic.id}">${renderComments(topic.comments.sideB)}</ul>
                <input type="text" id="comment-input-sideB-${topic.id}" placeholder="輸入留言...">
                <button onclick="handleComment('${topic.id}', 'sideB')">發表留言</button>
            </div>
        </div>
    `;
    container.appendChild(topicDiv);
}

// ✅ 修正 handleVote 的全域定義
window.handleVote = function(id, side) {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;
    topic.votes[side] += 1;
    loadTopics();
};

// ✅ 顯示留言
function renderComments(comments) {
    return comments.map(comment => `<li>${comment.text} 👍 ${comment.likes}</li>`).join('');
}

// ✅ 處理留言
window.handleComment = function(id, side) {
    const commentInput = document.getElementById(`comment-input-${side}-${id}`);
    if (!commentInput) return;

    const comment = commentInput.value.trim();
    if (comment === "") {
        alert("留言內容不能為空！");
        return;
    }

    const topic = topics.find(t => t.id === id);
    if (!topic) return;

    topic.comments[side].push({ text: comment, likes: 0 });
    commentInput.value = "";
    loadTopics();
};

// ✅ 按讚功能
window.likeTopic = function(id) {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;
    topic.likes += 1;
    loadTopics();
};

// ✅ 初始化
loadTopics();

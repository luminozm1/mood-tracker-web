import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
    getFirestore, collection, addDoc, getDocs, query, orderBy, where, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {
    getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// ================== Firebase Config ==================
const firebaseConfig = {
    apiKey: "AIzaSyBd2jdbHUFZPLw3RA4_KR3IlXJl9tgDT2s",
    authDomain: "moodtrack11.firebaseapp.com",
    projectId: "moodtrack11",
    storageBucket: "moodtrack11.firebasestorage.app",
    messagingSenderId: "204332687967",
    appId: "1:204332687967:web:76f711af0b163a76bcb1ea"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

// ================== Auth ==================
signInAnonymously(auth).catch((error) => {
    console.error("Auth error:", error);
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("Signed in as:", user.uid);
        loadStatusChart();
        loadHistory();
    }
});

// ================== Scales ==================
const scales = {
    mood: { map: { "Very Bad": 1, "Bad": 2, "Neutral": 3, "Good": 4, "Very Good": 5 } },
    anxiety: { map: { "Severe": 1, "Moderate": 2, "Mild": 4, "None": 5 } },
    sleep: { map: { "Very Bad": 1, "Bad": 2, "Neutral": 3, "Good": 4, "Very Good": 5 } }
};

let answers = { mood: null, anxiety: null, sleep: null };

// ================== Answer Selection ==================
window.selectAnswer = function (question, value) {
    answers[question] = value;
    const buttons = document.querySelectorAll(`.card button`);
    buttons.forEach(btn => {
        if (btn.getAttribute("onclick")?.includes(`'${question}',`)) {
            btn.classList.remove("selected");
        }
    });
    event.target.classList.add("selected");
};

// ================== Save Entry ==================
window.saveEntry = async function () {
    if (!currentUser) return;

    document.getElementById("errorMsg").style.display = "none";
    if (!answers.mood || !answers.anxiety || !answers.sleep) {
        document.getElementById("errorMsg").style.display = "block";
        return;
    }

    const today = new Date().toISOString().split("T")[0];
    try {
        const q = query(
            collection(db, "entries"),
            where("uid", "==", currentUser.uid),
            where("date", "==", today)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const existingDoc = snapshot.docs[0];
            await updateDoc(doc(db, "entries", existingDoc.id), { 
                uid: currentUser.uid,
                ...answers, 
                timestamp: new Date() 
            });
        } else {
            await addDoc(collection(db, "entries"), { 
                uid: currentUser.uid,
                date: today, 
                ...answers, 
                timestamp: new Date() 
            });
        }

        answers = { mood: null, anxiety: null, sleep: null };
        document.querySelectorAll("button").forEach(btn => btn.classList.remove("selected"));
        loadStatusChart();
        loadHistory();
    } catch (e) {
        console.error("Error saving entry: ", e);
    }
};

// ================== Chart ==================
const ctx = document.getElementById("statusChart").getContext("2d");
let statusChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["Mood", "Anxiety", "Sleep"],
        datasets: [{
            data: [0, 0, 0],
            backgroundColor: ["#4caf50", "#2196f3", "#ff9800"]
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                min: 1,
                max: 5,
                ticks: {
                    stepSize: 1,
                    callback: v => ["Very Bad", "Bad", "Neutral", "Good", "Very Good"][v - 1] || ""
                }
            }
        }
    }
});

// ================== Load Data ==================
async function loadStatusChart() {
    if (!currentUser) return;

    const q = query(
        collection(db, "entries"),
        where("uid", "==", currentUser.uid),
        orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);

    let moodVals = [], anxietyVals = [], sleepVals = [];
    snapshot.forEach(doc => {
        const d = doc.data();
        if (d.mood) moodVals.push(scales.mood.map[d.mood]);
        if (d.anxiety) anxietyVals.push(scales.anxiety.map[d.anxiety]);
        if (d.sleep) sleepVals.push(scales.sleep.map[d.sleep]);
    });

    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const moodAvg = avg(moodVals);
    const anxietyAvg = avg(anxietyVals);
    const sleepAvg = avg(sleepVals);

    statusChart.data.datasets[0].data = [moodAvg, anxietyAvg, sleepAvg];
    statusChart.update();

    showTips(moodAvg, anxietyAvg, sleepAvg);
}

function showTips(mood, anxiety, sleep) {
    let tips = "💡 Keep tracking to see useful tips.";

    const overall = (mood + anxiety + sleep) / 3;

    if (mood >= 4 && anxiety >= 4 && sleep >= 4) {
        tips = "🌞 You're doing great overall! Keep maintaining your healthy routine.";
    } else if (mood <= 2 && anxiety <= 2 && sleep <= 2) {
        tips = "🌧️ You’ve had a rough patch. Try small steps: light exercise, journaling, or reaching out to a friend.";
    } else {
        const minVal = Math.min(mood, anxiety, sleep);
        if (minVal === mood && mood < overall - 1) {
            tips = "💙 Mood seems lower than the rest. Try doing something enjoyable today or talking with someone you trust.";
        } else if (minVal === anxiety && anxiety < overall - 1) {
            tips = "😟 Anxiety looks higher compared to mood and sleep. Try a short breathing exercise or mindfulness break.";
        } else if (minVal === sleep && sleep < overall - 1) {
            tips = "😴 Sleep is falling behind. Try setting a consistent bedtime or reducing screen time before bed.";
        } else {
            tips = "✨ Mixed signals, but you're managing. Keep focusing on balance across mood, anxiety, and sleep.";
        }
    }

    document.getElementById("tips").innerText = tips;
}

async function loadHistory() {
    if (!currentUser) return;

    const q = query(
        collection(db, "entries"),
        where("uid", "==", currentUser.uid),
        orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    const tbody = document.getElementById("historyTable");
    tbody.innerHTML = "";
    snapshot.forEach(doc => {
        const d = doc.data();
        tbody.innerHTML += `<tr>
          <td>${d.date}</td>
          <td>${d.mood}</td>
          <td>${d.anxiety}</td>
          <td>${d.sleep}</td>
        </tr>`;
    });
}

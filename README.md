# Mood tracker website

Mood Oasis

A simple and beautiful mood tracking web app that helps you log your mood, anxiety, and sleep daily.
It provides insights, trends, and personalized tips to improve wellbeing.

you can visit the website here: https://moodoasis.netlify.app/


✨ Features

  📊 Daily Tracking – Log your mood, anxiety, and sleep with one click.

  📈 Visual Insights – See average scores displayed on a live Chart.js graph.

  💡 Personalized Tips – Get helpful suggestions based on your patterns.

  📖 History Log – Review past entries in a clean table.

  🔥 Firebase Integration – Data stored securely with Firestore.

  🎨 Responsive Design – Works across desktops, tablets, and mobiles.

🛠️ Tech Stack

  Frontend: HTML, CSS, JavaScript

  Database & Auth: Firebase Firestore + Anonymous Authentication

  Styling: Custom CSS (with responsive layouts)
  🚀 Getting Started
      Clone the repo
         git clone https://github.com/your-username/mood-oasis.git
         cd mood-oasis
      2. Set up Firebase

        Create a project at Firebase Console.

        Enable Firestore Database and Anonymous Authentication.

        Replace the Firebase config in main.js with your own:
        const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
        };

  Project structure
├── index.html        # Landing page
├── track.html        # Mood tracking dashboard
├── main.js           # Firebase logic & chart rendering
├── styles.css        # Landing page styles
├── track.css         # Tracker page styles
├── favicon.png       # App favicon


🙌 Contributing

Pull requests are welcome! If you’d like to suggest new features, open an issue first.

📜 License

This project is licensed under the MIT License.



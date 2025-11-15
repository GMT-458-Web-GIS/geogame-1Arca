[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/BhShQpq1)

GeoGame – NYC Taxi Pickup–Dropoff Matching Game
🎯 Aim

This interactive geo-memory game challenges players to match taxi pickup and dropoff points in New York City using spatial memory and quick thinking. It is designed as part of the GMT458 Web GIS course to explore HTML, CSS, JS, and mapping libraries.

🕹️ How to Play

The game shows 6 markers on a Leaflet.js map:

3 Pickup points (green)

3 Dropoff points (red)

Click a pickup point, then click the correct dropoff location to make a match.

Each correct match gives you +1 point.

Each wrong attempt uses 1 life.

You have:

45 seconds total time

3 lives

🔄 Game Mechanics
Feature	Description
Total Markers	6 (3 pickup – 3 dropoff)
Time Limit	45 seconds
Lives	3 lives
Match Logic	Pickup + Dropoff = Correct Pair
End Conditions	Time runs out OR Lives reach 0 OR All matched
📦 Technologies Used

Main JS Library:

Leaflet.js – for mapping and marker interaction

Optional (Bonus):

Chart.js – to visualize score/time progress (may be added later)

📊 Dataset

This game uses coordinates derived from the NYC Taxi Trip dataset, specifically using:

pickup_longitude, pickup_latitude

dropoff_longitude, dropoff_latitude

Markers are randomly sampled from the dataset at the start of each game.

/project-root
|-- index.html
|-- style.css
|-- app.js
|-- data.js  (optional for storing taxi trip data)
|-- assets
|   |-- wireframe.png
|-- README.md

UI Layout (Wireframe)

🧠 Future Enhancements

Add difficulty modes (easy: 3 pairs, hard: 5 pairs)

Animate marker interactions

Display a detailed results screen at the end

To get started, clone this repo, open index.html, and start customizing the game flow.

Good luck and enjoy developing your GeoGame! 🌍

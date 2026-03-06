ARCCO – Aztec Recreational Center Crowd Optimizer
📌 Project Overview

ARCCO is a mobile application built using React Native and FastAPI that helps SDSU students identify the least crowded times to visit the Aztec Recreation Center (ARC).

The app analyzes historical crowd data and recommends the top 3 least crowded time slots based on user-selected days and time windows.

🏗 Architecture Overview
Mobile App

Built with React Native (Expo)

Collects user input (days + time range)

Sends request to backend API

Displays recommended time slots

Backend API

Built with FastAPI (Python)

Processes crowd dataset

Filters by selected time window

Returns top 3 least crowded time slots

Data Layer

CSV dataset (Sprint 1)

May transition to SQLite later

🛠 Tech Stack

React Native (Expo)

FastAPI

Python 3

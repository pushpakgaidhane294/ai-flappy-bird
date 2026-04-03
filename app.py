from flask import Flask, render_template, jsonify, request
import numpy as np
import os
import random

app = Flask(__name__)

# Q-table
if os.path.exists("q_table.npy"):
    Q = np.load("q_table.npy")
else:
    Q = np.zeros((500, 500, 2))

alpha = 0.1
gamma = 0.9
epsilon = 0.1

def get_state(y, dist):
    y = int(min(max(y, 0), 499))
    dist = int(min(max(dist, 0), 499))
    return y, dist

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get_action", methods=["POST"])
def get_action():
    data = request.json
    y, dist = get_state(data["y"], data["dist"])

    if random.random() < epsilon:
        action = random.randint(0, 1)
    else:
        action = int(np.argmax(Q[y, dist]))

    return jsonify({"action": action})

@app.route("/update_q", methods=["POST"])
def update_q():
    data = request.json
    y, dist = get_state(data["y"], data["dist"])
    ny, ndist = get_state(data["ny"], data["ndist"])
    action = data["action"]
    reward = data["reward"]

    Q[y, dist, action] += alpha * (
        reward + gamma * np.max(Q[ny, ndist]) - Q[y, dist, action]
    )

    np.save("q_table.npy", Q)

    return jsonify({"status": "updated"})

if __name__ == "__main__":
    app.run(debug=True)

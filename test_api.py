"""
Test scripts for Sheep Tracker API

Run these scripts to test the integration
"""

import requests
import time
import math
import threading
from typing import Generator

# Configuration
API_BASE = "http://localhost:3000/api"
UPDATE_ENDPOINT = f"{API_BASE}/animals/update"
STREAM_ENDPOINT = f"{API_BASE}/animals/stream"

# Animal IDs and starting positions
ANIMALS = {
    "101": {"name": "Барашек", "lat": 43.2220, "lng": 76.8512},
    "102": {"name": "Кудряш", "lat": 43.2225, "lng": 76.8515},
    "103": {"name": "Белый", "lat": 43.2218, "lng": 76.8510},
}

print("=" * 60)
print("Sheep Tracker - API Test Suite")
print("=" * 60)


def send_update(
    animal_id: str, lat: float, lng: float, satellites: int = 8, battery: int = 85
) -> dict:
    """Send a single update to the API"""
    data = f"{animal_id};{lat:.6f};{lng:.6f};{satellites};{battery}"

    try:
        response = requests.post(
            UPDATE_ENDPOINT,
            data=data,
            headers={"Content-Type": "text/plain"},
            timeout=5,
        )
        result = response.json()
        print(f"[SEND] {animal_id}: ({lat:.4f}, {lng:.4f}) -> {result['message']}")
        return result
    except Exception as e:
        print(f"[ERROR] Failed to send update: {e}")
        return None


def stream_updates():
    """Listen to SSE stream"""
    print("[STREAM] Connecting to stream...")

    try:
        with requests.get(STREAM_ENDPOINT, stream=True, timeout=None) as response:
            print(f"[STREAM] Connected (status: {response.status_code})")

            for line in response.iter_lines():
                if line:
                    line = line.decode("utf-8")
                    if line.startswith("data: "):
                        data_str = line[6:]  # Remove 'data: ' prefix
                        print(f"[STREAM] Received: {data_str}")
    except Exception as e:
        print(f"[STREAM] Error: {e}")


def circular_movement(
    animal_id: str, radius: float = 0.001, duration: int = 60, interval: int = 5
):
    """Move animal in a circle"""
    animal = ANIMALS[animal_id]
    center_lat = animal["lat"]
    center_lng = animal["lng"]

    start_time = time.time()
    steps = duration // interval

    for i in range(steps):
        angle = (2 * math.pi * i) / steps
        lat = center_lat + radius * math.cos(angle)
        lng = center_lng + radius * math.sin(angle)

        send_update(animal_id, lat, lng)
        time.sleep(interval)


def straight_movement(
    animal_id: str, direction: str = "north", distance: float = 0.01, interval: int = 5
):
    """Move animal in a straight line"""
    animal = ANIMALS[animal_id]
    lat = animal["lat"]
    lng = animal["lng"]

    # Direction vectors (approximation for small distances)
    directions = {
        "north": (0.001, 0),
        "south": (-0.001, 0),
        "east": (0, 0.001),
        "west": (0, -0.001),
    }

    if direction not in directions:
        print(f"[ERROR] Unknown direction: {direction}")
        return

    dlat, dlng = directions[direction]
    steps = int(distance / abs(dlat or dlng or 0.001))

    for i in range(steps):
        lat += dlat
        lng += dlng
        send_update(animal_id, lat, lng)
        time.sleep(interval)


def random_walk(animal_id: str, duration: int = 120, interval: int = 5):
    """Move animal randomly"""
    import random

    animal = ANIMALS[animal_id]
    lat = animal["lat"]
    lng = animal["lng"]

    start_time = time.time()

    while time.time() - start_time < duration:
        # Random walk with small steps
        dlat = random.uniform(-0.0005, 0.0005)
        dlng = random.uniform(-0.0005, 0.0005)

        lat += dlat
        lng += dlng

        send_update(animal_id, lat, lng)
        time.sleep(interval)


def test_single_update():
    """Test 1: Send a single update"""
    print("\n" + "=" * 60)
    print("TEST 1: Single Update")
    print("=" * 60)

    result = send_update("101", 43.2220, 76.8512)
    if result and result.get("success"):
        print("[SUCCESS] Single update sent")
    else:
        print("[FAILED] Could not send update")


def test_multiple_animals():
    """Test 2: Send updates from multiple animals"""
    print("\n" + "=" * 60)
    print("TEST 2: Multiple Animals")
    print("=" * 60)

    for animal_id in ANIMALS:
        animal = ANIMALS[animal_id]
        send_update(animal_id, animal["lat"], animal["lng"])
        time.sleep(1)


def test_stream_listening():
    """Test 3: Listen to SSE stream while sending updates"""
    print("\n" + "=" * 60)
    print("TEST 3: Stream Listening")
    print("=" * 60)

    # Start stream listener in background
    stream_thread = threading.Thread(target=stream_updates, daemon=True)
    stream_thread.start()

    # Give it time to connect
    time.sleep(2)

    # Send some updates
    print("[TEST] Sending updates...")
    for i in range(5):
        send_update("101", 43.2220 + (i * 0.0001), 76.8512)
        time.sleep(2)

    # Let stream thread finish
    time.sleep(2)


def test_circular_movement():
    """Test 4: Move animal in a circle"""
    print("\n" + "=" * 60)
    print("TEST 4: Circular Movement (60 seconds)")
    print("=" * 60)

    # Start stream listener in background
    stream_thread = threading.Thread(target=stream_updates, daemon=True)
    stream_thread.start()

    time.sleep(2)

    # Move animal in circle
    circular_movement("101", radius=0.001, duration=30, interval=3)

    time.sleep(2)


def test_straight_movement():
    """Test 5: Move animal in a straight line"""
    print("\n" + "=" * 60)
    print("TEST 5: Straight Movement (North)")
    print("=" * 60)

    straight_movement("102", direction="north", distance=0.01, interval=3)


def test_invalid_format():
    """Test 6: Send invalid data format"""
    print("\n" + "=" * 60)
    print("TEST 6: Invalid Data Format")
    print("=" * 60)

    # Missing coordinates
    try:
        response = requests.post(
            UPDATE_ENDPOINT,
            data="101;43.2220",
            headers={"Content-Type": "text/plain"},
            timeout=5,
        )
        print(f"[RESPONSE] {response.status_code}: {response.json()}")
    except Exception as e:
        print(f"[ERROR] {e}")


def continuous_updates(duration: int = 300, interval: int = 10):
    """Send continuous updates from all animals"""
    print("\n" + "=" * 60)
    print(f"TEST: Continuous Updates ({duration}s)")
    print("=" * 60)

    # Start stream listener
    stream_thread = threading.Thread(target=stream_updates, daemon=True)
    stream_thread.start()

    time.sleep(2)

    start_time = time.time()
    update_count = 0

    while time.time() - start_time < duration:
        for animal_id in ANIMALS:
            animal = ANIMALS[animal_id]
            # Add small random offset
            import random

            lat = animal["lat"] + random.uniform(-0.0001, 0.0001)
            lng = animal["lng"] + random.uniform(-0.0001, 0.0001)

            send_update(animal_id, lat, lng)
            update_count += 1

        time.sleep(interval)

    print(f"\n[SUMMARY] Sent {update_count} updates in {duration}s")


def menu():
    """Interactive menu"""
    while True:
        print("\n" + "=" * 60)
        print("Sheep Tracker - Test Menu")
        print("=" * 60)
        print("1. Single update")
        print("2. Multiple animals")
        print("3. Listen to stream")
        print("4. Circular movement")
        print("5. Straight movement")
        print("6. Invalid format test")
        print("7. Continuous updates (5 min)")
        print("8. Custom duration continuous updates")
        print("0. Exit")
        print("=" * 60)

        choice = input("Select test (0-8): ").strip()

        try:
            if choice == "1":
                test_single_update()
            elif choice == "2":
                test_multiple_animals()
            elif choice == "3":
                test_stream_listening()
            elif choice == "4":
                test_circular_movement()
            elif choice == "5":
                test_straight_movement()
            elif choice == "6":
                test_invalid_format()
            elif choice == "7":
                continuous_updates(duration=300, interval=10)
            elif choice == "8":
                duration = int(input("Duration (seconds): "))
                interval = int(input("Interval (seconds): "))
                continuous_updates(duration=duration, interval=interval)
            elif choice == "0":
                print("Exiting...")
                break
            else:
                print("Invalid choice")
        except KeyboardInterrupt:
            print("\n[INTERRUPTED] Test stopped")
        except Exception as e:
            print(f"[ERROR] {e}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        test_name = sys.argv[1]

        if test_name == "single":
            test_single_update()
        elif test_name == "multiple":
            test_multiple_animals()
        elif test_name == "stream":
            test_stream_listening()
        elif test_name == "circle":
            test_circular_movement()
        elif test_name == "straight":
            test_straight_movement()
        elif test_name == "invalid":
            test_invalid_format()
        elif test_name == "continuous":
            duration = int(sys.argv[2]) if len(sys.argv) > 2 else 300
            continuous_updates(duration=duration, interval=10)
        else:
            print(f"Unknown test: {test_name}")
    else:
        menu()

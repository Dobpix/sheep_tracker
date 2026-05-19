"""
Скрипт для приема данных с микроконтроллера и отправки их в Next.js приложение
"""

import threading
import requests
from flask import Flask, request
import logging

# Логирование
logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Конфигурация
ESP_URL = "http://192.168.1.170/msg"  # адрес ESP для отправки команд
HOST_IP = "0.0.0.0"
LOG_PORT = 5000
NEXTJS_API_URL = "http://192.168.1.230:3000/api/animals/update"  # адрес Next.js API

app = Flask(__name__)


@app.route("/log", methods=["POST"])
def receive_log():
    """Получает логи/данные с микроконтроллера и отправляет их в Next.js"""
    try:
        log = request.data.decode("utf-8")
        logger.info(f"[ESP] Received: {log}")

        # Отправляем данные в Next.js приложение
        try:
            response = requests.post(
                NEXTJS_API_URL,
                data=log,
                timeout=5,
                headers={"Content-Type": "text/plain"},
            )

            if response.status_code == 200:
                logger.info(f"[API] Data sent successfully")
                result = response.json()
                logger.info(f"[API] Response: {result}")
            else:
                logger.error(f"[API] Error: {response.status_code} - {response.text}")

        except requests.exceptions.RequestException as e:
            logger.error(f"[API] Failed to send to Next.js: {e}")

        return "OK"

    except Exception as e:
        logger.error(f"[ERROR] {e}")
        return "ERROR", 500


def run_server():
    """Запускает Flask сервер"""
    app.run(host=HOST_IP, port=LOG_PORT, debug=False, use_reloader=False)


def send_commands():
    """Интерактивная отправка команд на ESP"""
    while True:
        try:
            msg = input("\nВведите команду (или 'exit' для выхода): ")

            if msg.lower() == "exit":
                logger.info("[CMD] Exiting...")
                break

            if not msg.strip():
                continue

            try:
                response = requests.post(ESP_URL, data=msg, timeout=5)
                logger.info(f"[CMD] Sent: {msg}")
                logger.info(f"[CMD] Response: {response.text}")
            except requests.exceptions.RequestException as e:
                logger.error(f"[CMD] Failed to send command: {e}")

        except KeyboardInterrupt:
            logger.info("\n[CMD] Interrupted by user")
            break
        except Exception as e:
            logger.error(f"[CMD] Error: {e}")


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("Sheep Tracker - Base Station Server")
    logger.info("=" * 60)
    logger.info(f"Listening for ESP logs on: http://{HOST_IP}:{LOG_PORT}/log")
    logger.info(f"Forwarding data to Next.js: {NEXTJS_API_URL}")
    logger.info(f"ESP command endpoint: {ESP_URL}")
    logger.info("=" * 60)

    # Запуск Flask-сервера в фоновом потоке
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    logger.info("Server started successfully!")
    logger.info("You can now send commands to ESP...\n")

    # Основной поток для отправки команд
    send_commands()

    logger.info("Shutting down...")

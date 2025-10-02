import cv2
import time
from datetime import datetime
import json
import requests
import os
import threading
from tkinter import messagebox
from recognizer import get_instance
from win10toast import ToastNotifier
import tkinter as tk

toaster = ToastNotifier()

# ========= Configuración de thresholds =======
#El numero de la izquierda son segundos, se multiplica por 60 para volverlo minutos, asi de esta manera por si se necesita para pruebas
# solo quita o comenta el multiplicar
WORK_DURATION = 10 * 60 
BREAK_DURATION = 10 * 60
JSON_LOG = "logs.json"

# ========= Control de parada =========
stop_event = threading.Event()
monitor_thread = None


def enviar_log_a_backend(log):
    try:
        print("[DEBUG] Enviando este JSON al backend:")
        print(json.dumps(log, indent=2, ensure_ascii=False))

        url = "https://pausasactivas.onrender.com/api/sesiones"
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, json=log, headers=headers)

        if response.status_code in (200, 201):
            print("[OK] Log enviado correctamente al backend.")
        else:
            print(f"[ERROR] Fallo al enviar el log. Código: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"[EXCEPTION] Error al enviar al backend: {e}")
        
def guardar_log(data):
    if os.path.exists(JSON_LOG):
        with open(JSON_LOG, 'r') as f:
            try:
                logs = json.load(f)
            except json.JSONDecodeError:
                logs = []
    else:
        logs = []

    logs.append(data)

    with open(JSON_LOG, 'w') as f:
        json.dump(logs, f, indent=4)


def monitorear_usuario(nombre_usuario, work_duration=10, break_duration=10):
    global monitor_thread, stop_event, WORK_DURATION, BREAK_DURATION
    WORK_DURATION = work_duration
    BREAK_DURATION = break_duration

    if monitor_thread and monitor_thread.is_alive():
        messagebox.showwarning("Monitoreo", "El monitoreo ya está en ejecución.")
        return

    stop_event.clear()
    monitor_thread = threading.Thread(target=_monitorear_bucle, args=(nombre_usuario,))
    monitor_thread.start()

def mostrar_alerta(titulo, mensaje):
    root = tk.Tk()
    root.title(titulo)
    root.attributes("-topmost", True)  # Siempre encima
    root.geometry("400x200")  # Tamaño fijo
    root.eval('tk::PlaceWindow . center')  # Centrar pantalla
    root.configure(bg="white")

    label = tk.Label(root, text=mensaje, font=("Arial", 14), bg="white", wraplength=350)
    label.pack(pady=30)

    btn = tk.Button(root, text="Aceptar", command=root.destroy, font=("Arial", 12))
    btn.pack(pady=20)

    root.mainloop()


def _monitorear_bucle(nombre_usuario):
    recognizer = get_instance()

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        messagebox.showerror("Error", "No se pudo abrir la cámara.")
        return

    work_counter = 0
    break_counter = 0
    work_cycles = 0
    break_cycles = 0
    state = "WORKING"

    start_time = datetime.now()

    print(f"[MONITOREO INICIADO] Usuario: {nombre_usuario}")
    print(f"[START TIME] {start_time}")
    print("----------------------------")

    try:
        while not stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                print("[ERROR] Fallo en la cámara.")
                continue

            embedding = recognizer.get_embedding(frame)
            recognized_name, distance = recognizer.recognize(embedding)
            recognized = recognized_name == nombre_usuario
            
            print(f"[STATE] Actual: {state}")
            print(f"[DEBUG] Reconocido={recognized} | Distancia={distance}")

            # Dibujar rectángulo en el rostro detectado
            faces = recognizer.detect_faces(frame)
            for (bbox, _) in faces:
                x1, y1, x2, y2 = bbox
                color = (0, 255, 0) if recognized else (0, 0, 255)  # Verde si es el usuario, rojo si no
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, recognized_name if recognized_name else "Desconocido",
                            (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

            # Mostrar ventana con la cámara
            frame_resized = cv2.resize(frame, (340, 220))
            cv2.imshow("Monitoreo - Camara en vivo", frame_resized)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                stop_event.set()
                break

            # === Lógica de estados (WORKING / BREAK) ===
            if state == "WORKING":
                if recognized:
                    work_counter += 1
                    print(f"[COUNTER] Trabajo={work_counter} s | Descanso={break_counter} s")
                    print(f"[INFO] {nombre_usuario} TRABAJANDO (+1 segundo). Total: {work_counter} s")
                else:
                    print(f"[INFO] {nombre_usuario} NO DETECTADO en trabajo. Pausado.")

                if work_counter >= WORK_DURATION:
                    work_cycles += 1
                    print(f"[ACTION] {nombre_usuario} completó un ciclo de TRABAJO.")
                    toaster.show_toast(
                        "Descanso",
                        f"{nombre_usuario}, es hora de tomar un descanso.",
                        duration=10,
                        threaded=True
                    )
                    mostrar_alerta("Descanso", f"{nombre_usuario}, es hora de tomar un descanso.")
                    state = "BREAK"
                    work_counter = 0

            elif state == "BREAK":
                if not recognized:
                    break_counter += 1
                    print(f"[COUNTER] Trabajo={work_counter} s | Descanso={break_counter} s")
                    print(f"[INFO] {nombre_usuario} DESCANSANDO (+1 segundo válido). Total: {break_counter} s")
                else:
                    print(f"[ALERTA] {nombre_usuario} sigue frente a la pantalla. Descanso no válido.")
                    toaster.show_toast(
                        "Alerta de no descanso",
                        f"{nombre_usuario}, porfavor levantate, para que el descanso cuente debes levantarte de tu puesto.",
                        duration=10,
                        threaded=True
                    )
                    mostrar_alerta(
                        "Descanso no válido",
                        f"{nombre_usuario}, para que el descanso cuente debes levantarte de tu puesto."
                    )
                    
                if break_counter >= BREAK_DURATION:
                    break_cycles += 1
                    print(f"[ACTION] {nombre_usuario} completó un ciclo de DESCANSO válido.")
                    toaster.show_toast(
                        "Trabajo",
                        f"{nombre_usuario}, descanso finalizado. ¡Volvamos al trabajo!",
                        duration=10,
                        threaded=True
                    )
                    mostrar_alerta("Trabajo", f"{nombre_usuario}, descanso finalizado. ¡Volvamos al trabajo!")

                    state = "WORKING"
                    break_counter = 0

            if stop_event.is_set():
                print("[INFO] Monitoreo detenido desde la app.")
                break

            time.sleep(1)

    finally:
        cap.release()
        cv2.destroyAllWindows()
        end_time = datetime.now()

        log_data = {
            "usuario": nombre_usuario,
            "inicio_sesion": start_time.strftime("%Y-%m-%d %H:%M:%S"),
            "fin_sesion": end_time.strftime("%Y-%m-%d %H:%M:%S"),
            "trabajo_total_segundos": work_cycles * WORK_DURATION,
            "descanso_total_segundos": break_cycles * BREAK_DURATION,
            "ciclos_trabajo": work_cycles,
            "ciclos_descanso": break_cycles
        }
        guardar_log(log_data)
        enviar_log_a_backend(log_data)
        print("[INFO] Sesión guardada en logs.json")
        print("[INFO] Monitoreo finalizado.")


def detener_monitoreo():
    global stop_event
    print("[INFO] Botón Detener Monitoreo presionado.")
    stop_event.set()

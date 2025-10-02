import cv2
import tkinter as tk
from tkinter import simpledialog, messagebox
from recognizer import FaceRecognizer
from datetime import datetime
import requests
import numpy as np
import json

BACKEND_URL = "https://pausasactivas.onrender.com/api/usuarioend"

def pedir_nombre_empleado():
    root = tk.Tk()
    root.withdraw()
    nombre = simpledialog.askstring("Registro de Usuario", "Ingresa el nombre del nuevo empleado:")
    root.destroy()
    return nombre

def usuario_existe(nombre):
    try:
        response = requests.get(BACKEND_URL)
        if response.status_code == 200:
            usuarios = response.json()
            for usuario in usuarios:
                if usuario.get("nombre", "").strip().lower() == nombre.strip().lower():
                    return True
        else:
            print(f"[ERROR] No se pudo verificar duplicados. Código: {response.status_code}")
    except Exception as e:
        print(f"[EXCEPTION] Error al verificar duplicados: {e}")
    return False

def capturar_foto_etiquetada(cap, recognizer, instruccion):
    print(f"[INFO] Abriendo cámara para capturar foto: {instruccion}")
    cv2.namedWindow("Registro - Presiona 'a' para guardar o ESC para cancelar")

    embedding = None
    while True:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] No se pudo acceder a la cámara.")
            break

        cv2.putText(frame, instruccion, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        cv2.imshow("Registro - Presiona 'a' para guardar o ESC para cancelar", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('a'):
            embedding = recognizer.get_embedding(frame)
            if embedding is not None:
                print("[INFO] Foto capturada con éxito.")
                break
            else:
                print("[WARN] No se detectó cara. Intenta de nuevo.")
        elif key == 27:  # ESC
            print("[INFO] Registro cancelado por el usuario.")
            break

    cv2.destroyWindow("Registro - Presiona 'a' para guardar o ESC para cancelar")
    return embedding

def enviar_embeddings_backend(nombre_usuario, embeddings):
    try:
        data = {
            "nombre": nombre_usuario,
            "embedding": [emb.tolist() for emb in embeddings],
            "FechaRegistro": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        print("[DEBUG] JSON a enviar al backend:")
        print(json.dumps(data, indent=4))

        headers = {"Content-Type": "application/json"}
        response = requests.post(BACKEND_URL, json=data, headers=headers)

        if response.status_code in [200, 201]:
            print("[OK] Embeddings enviados al backend correctamente.")
        else:
            print(f"[ERROR] Fallo al enviar embeddings. Código: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"[EXCEPTION] Error al enviar embeddings: {e}")

def register_employee():
    recognizer = FaceRecognizer()
    nombre = pedir_nombre_empleado()
    if not nombre:
        print("[INFO] Registro cancelado (nombre vacío).")
        return

    if usuario_existe(nombre):
        messagebox.showwarning("Usuario duplicado", f"El nombre '{nombre}' ya está registrado. Usa otro nombre.")
        return

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        messagebox.showerror("Error", "No se pudo abrir la cámara.")
        return

    instrucciones = [
        "Mira al FRENTE",
        "Gira ligeramente a la IZQUIERDA",
        "Gira ligeramente a la DERECHA",
        "Gira LIGERAMENTE ARRIBA",
        "Gira LIGERAMENTE ABAJO"
    ]

    embeddings_usuario = []

    for idx, instruccion in enumerate(instrucciones, 1):
        messagebox.showinfo("Registro", f"Foto {idx}/5: {instruccion}\nPresiona 'a' para tomar la foto.")
        embedding = capturar_foto_etiquetada(cap, recognizer, instruccion)
        if embedding is None:
            messagebox.showwarning("Registro Incompleto", "No se pudo capturar la foto. Registro cancelado.")
            cap.release()
            return
        embeddings_usuario.append(embedding)

    enviar_embeddings_backend(nombre, embeddings_usuario)

    cap.release()
    messagebox.showinfo("Registro Exitoso", f"¡Empleado '{nombre}' registrado con éxito!")
    print(f"[INFO] Usuario '{nombre}' registrado con 5 fotos.")

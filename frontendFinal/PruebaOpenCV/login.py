import cv2
import tkinter as tk
from tkinter import messagebox
import requests
import numpy as np
from recognizer import FaceRecognizer

BACKEND_URL = "https://pausasactivas.onrender.com/api/usuarioEND"

def obtener_usuarios_backend():
    try:
        response = requests.get(BACKEND_URL)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"[ERROR] Error al obtener usuarios del backend: {e}")
        return []

def login_user():
    recognizer = FaceRecognizer()

    messagebox.showinfo("Inicio de Sesión", "Se abrirá la cámara. Presione 's' para capturar la foto o ESC para cancelar.")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        messagebox.showerror("Error", "No se pudo abrir la cámara.")
        return

    authenticated_user = None

    usuarios = obtener_usuarios_backend()
    if not usuarios:
        messagebox.showerror("Error", "No se pudieron obtener usuarios desde el backend.")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            messagebox.showerror("Error", "Fallo al capturar imagen.")
            break

        cv2.imshow("Inicio de Sesión - Presione 's' para capturar", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord('s'):
            print("[INFO] Foto capturada.")
            embedding = recognizer.get_embedding(frame)
            if embedding is not None:
                nombre_reconocido = "Desconocido"
                menor_distancia = float("inf")

                for usuario in usuarios:
                    nombre = usuario.get("nombre")
                    embeddings_lista = usuario.get("embedding", [])

                    # Asegura que sea lista de listas
                    if isinstance(embeddings_lista[0], (list, np.ndarray)):
                        embeddings_np = [np.array(emb) for emb in embeddings_lista]
                    else:
                        embeddings_np = [np.array(embeddings_lista)]  # caso: solo 1 embedding

                    for emb in embeddings_np:
                        dist = np.linalg.norm(embedding - emb)
                        if dist < recognizer.threshold and dist < menor_distancia:
                            menor_distancia = dist
                            nombre_reconocido = nombre

                if nombre_reconocido != "Desconocido":
                    authenticated_user = nombre_reconocido
                    messagebox.showinfo("Bienvenido", f"¡Bienvenido, {authenticated_user}!")
                else:
                    messagebox.showwarning("No reconocido", "No se pudo reconocer el rostro. Intente nuevamente o regístrese si no lo ha hecho.")
            else:
                messagebox.showerror("Error", "No se detectó rostro. Intenta nuevamente.")
            break

        elif key == 27:  # ESC
            print("[INFO] Login cancelado por el usuario.")
            break

    cap.release()
    cv2.destroyAllWindows()

    return authenticated_user

if __name__ == "__main__":
    login_user()

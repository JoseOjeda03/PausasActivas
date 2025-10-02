import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk
import register
import login
import monitor
import os

# Estado global del usuario
current_user = {"name": None}
ventana_login = None  # Mantendremos referencia global para esconder/mostrar

def iniciar_monitoreo_con_tiempos(entry_work, entry_break):
    try:
        work_min = int(entry_work.get())
        break_min = int(entry_break.get())

        if work_min <= 0 or break_min <= 0:
            messagebox.showerror("Error", "Los tiempos deben ser mayores a 0.")
            return

        # Convertir minutos a segundos
        work_duration = work_min * 60
        break_duration = break_min * 60

        monitor.monitorear_usuario(current_user["name"], work_duration, break_duration)

    except ValueError:
        messagebox.showerror("Error", "Por favor ingrese valores numéricos en los campos de tiempo.")


# ============ PRIMERA VENTANA: LOGIN / REGISTRO ============

def abrir_ventana_principal():
    global ventana_login
    ventana_login = tk.Tk()
    ventana_login.title("Inicio de Sesión o Registro")
    ventana_login.geometry("400x420")
    ventana_login.resizable(False, False)

    # Logo con verificación y referencia persistente
    if os.path.exists("img/Logo-empresa.jpg"):
        try:
            image = Image.open("img/Logo-empresa.jpg")
            image = image.resize((150, 150))
            photo = ImageTk.PhotoImage(image, master=ventana_login)  # <- clave: especificar master
            logo_label = tk.Label(ventana_login, image=photo)
            logo_label.image = photo  # <- mantener la referencia viva
            logo_label.pack(pady=10)
        except Exception as e:
            print(f"[ERROR] No se pudo cargar el logo: {e}")
            tk.Label(ventana_login, text="[Error cargando logo]", font=("Helvetica", 12)).pack(pady=20)
    else:
        tk.Label(ventana_login, text="[Logo-empresa.jpg no encontrado]", font=("Helvetica", 12)).pack(pady=20)

    tk.Label(ventana_login, text="Bienvenido", font=("Helvetica", 18, "bold")).pack(pady=10)

    btn_frame = tk.Frame(ventana_login)
    btn_frame.pack(pady=20)

    tk.Button(btn_frame, text="Registrar Usuario", width=20, command=register.register_employee).pack(pady=10)
    tk.Button(btn_frame, text="Iniciar Sesión", width=20, command=handle_login).pack(pady=10)
    tk.Button(btn_frame, text="Salir", width=20, command=ventana_login.quit).pack(pady=10)

    ventana_login.mainloop()


# ============ SEGUNDA VENTANA: MONITOREO / CERRAR SESIÓN ============

def abrir_ventana_monitoreo():
    ventana_monitoreo = tk.Toplevel()
    ventana_monitoreo.title("Monitoreo")
    ventana_monitoreo.geometry("400x400")
    ventana_monitoreo.resizable(False, False)

    tk.Label(ventana_monitoreo, text=f"Sesión activa: {current_user['name']}", font=("Helvetica", 14)).pack(pady=20)

    # === Entrada de tiempos configurables ===
    tk.Label(ventana_monitoreo, text="Duración de trabajo (min):", font=("Helvetica", 12)).pack(pady=5)
    entry_work = tk.Entry(ventana_monitoreo, width=10)
    entry_work.insert(0, "25")  # Valor por defecto (25 min)
    entry_work.pack(pady=5)

    tk.Label(ventana_monitoreo, text="Duración de descanso (min):", font=("Helvetica", 12)).pack(pady=5)
    entry_break = tk.Entry(ventana_monitoreo, width=10)
    entry_break.insert(0, "5")  # Valor por defecto (5 min)
    entry_break.pack(pady=5)

    # === Botones ===
    tk.Button(
        ventana_monitoreo,
        text="Iniciar Monitoreo",
        width=25,
        command=lambda: iniciar_monitoreo_con_tiempos(entry_work, entry_break)
    ).pack(pady=10)

    tk.Button(
        ventana_monitoreo,
        text="Detener Monitoreo",
        width=25,
        command=monitor.detener_monitoreo
    ).pack(pady=10)

    tk.Button(
        ventana_monitoreo,
        text="Cerrar Sesión",
        width=25,
        command=lambda: cerrar_sesion(ventana_monitoreo)
    ).pack(pady=10)



def cerrar_sesion(ventana):
    monitor.detener_monitoreo()
    current_user["name"] = None
    ventana.destroy()
    messagebox.showinfo("Sesión cerrada", "Has cerrado sesión correctamente.")
    abrir_ventana_principal()


# ============ MANEJADORES ============

def handle_login():
    global ventana_login
    user = login.login_user()
    if user:
        current_user["name"] = user
        messagebox.showinfo("Login exitoso", f"¡Bienvenido {user}!")
        ventana_login.withdraw()            # Solo la escondemos
        abrir_ventana_monitoreo()
    else:
        messagebox.showerror("Login fallido", "No se pudo identificar al usuario.")


# ============ EJECUCIÓN PRINCIPAL ============

if __name__ == "__main__":
    abrir_ventana_principal()

import numpy as np
import requests
from insightface.app import FaceAnalysis

# URL de el backend
BACKEND_URL = 'https://pausasactivas.onrender.com/api/usuarioend'
DISTANCE_THRESHOLD = 25  # Ajusta si necesitas

class FaceRecognizer:
    def __init__(self):
        self.embeddings = self.load_embeddings()
        self.threshold = DISTANCE_THRESHOLD
        self.app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        print("[INFO] InsightFace listo.")

    def load_embeddings(self):
        try:
            response = requests.get(BACKEND_URL)
            if response.status_code == 200:
                data = response.json()
                embeddings_dict = {}
                for usuario in data:
                    nombre = usuario["nombre"]
                    lista_embeddings = usuario["embedding"]
                    # Convertimos cada embedding a np.array individual
                    if isinstance(lista_embeddings[0], list):
                        embeddings_np = [np.array(emb) for emb in lista_embeddings]
                    else:
                        embeddings_np = [np.array(lista_embeddings)]  # caso: solo un embedding
                    embeddings_dict[nombre] = embeddings_np
                print(f"[INFO] Embeddings cargados para {len(embeddings_dict)} usuario(s).")
                return embeddings_dict
            else:
                print(f"[ERROR] Fallo al obtener embeddings desde backend. Código: {response.status_code}")
                return {}
        except Exception as e:
            print(f"[ERROR] Excepción al cargar embeddings: {e}")
            return {}

    def detect_faces(self, image):
        faces = self.app.get(image)
        results = []
        for face in faces:
            embedding = face.embedding
            bbox = [int(x) for x in face.bbox]
            results.append((bbox, embedding))
        return results

    def get_embedding(self, image):
        faces = self.app.get(image)
        if faces:
            return faces[0].embedding
        return None

    def recognize(self, embedding):
        if embedding is None:
            return None, None

        min_distance = float('inf')
        recognized_name = None

        for name, list_of_embeddings in self.embeddings.items():
            for stored_embedding in list_of_embeddings:
                distance = np.linalg.norm(embedding - stored_embedding)
                if distance < min_distance:
                    min_distance = distance
                    recognized_name = name

        if min_distance > self.threshold:
            return None, min_distance  # Devuelve distancia para debug

        return recognized_name, min_distance

# === SINGLETON IMPLEMENTATION ===
_instance = None

def get_instance():
    global _instance
    if _instance is None:
        _instance = FaceRecognizer()
    return _instance

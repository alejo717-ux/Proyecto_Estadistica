# src/app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI(title="API Encuesta Estadística UTP", version="2.0")

# Habilitar CORS para permitir la comunicación entre el frontend y la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Obtener la URL de la base de datos desde las variables de entorno de Render
DATABASE_URL = os.environ.get("DATABASE_URL")

def get_db_connection():
    # Conexión a PostgreSQL en la nube
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    # Sintaxis SERIAL para autoincremento en PostgreSQL
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS respuestas (
            id SERIAL PRIMARY KEY,
            carrera TEXT,
            anio TEXT,
            gpa REAL,
            idePrincipal TEXT,
            cant_ides INTEGER,
            horas_prog TEXT,
            lenguaje TEXT,
            usaTerminal TEXT,
            nivelTerminal TEXT,
            frecuenciaGit INTEGER,
            scriptBash TEXT,
            numRepositorio INTEGER,
            escalaOptima INTEGER,
            porcErrores TEXT,
            perdidaCodigo TEXT,
            influenciaCali INTEGER,
            horasAhorradas TEXT,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

# Inicializar la base de datos al arrancar
init_db()

# Estructura de datos validada con Pydantic
class EncuestaItem(BaseModel):
    carrera: str
    anio: str
    gpa: float
    idePrincipal: str
    cant_ides: int
    horas_prog: str
    lenguaje: str
    usaTerminal: str
    nivelTerminal: str
    frecuenciaGit: int
    scriptBash: str
    numRepositorio: int
    escalaOptima: int
    porcErrores: str
    perdidaCodigo: str
    influenciaCali: int
    horasAhorradas: str

@app.post("/api/respuestas")
def guardar_respuesta(item: EncuestaItem):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO respuestas (
                carrera, anio, gpa, idePrincipal, cant_ides, horas_prog, lenguaje,
                usaTerminal, nivelTerminal, frecuenciaGit, scriptBash, numRepositorio,
                escalaOptima, porcErrores, perdidaCodigo, influenciaCali, horasAhorradas
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            item.carrera, item.anio, item.gpa, item.idePrincipal, item.cant_ides,
            item.horas_prog, item.lenguaje, item.usaTerminal, item.nivelTerminal,
            item.frecuenciaGit, item.scriptBash, item.numRepositorio, item.escalaOptima,
            item.porcErrores, item.perdidaCodigo, item.influenciaCali, item.horasAhorradas
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "success", "message": "Datos almacenados en PostgreSQL correctamente."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/respuestas")
def obtener_respuestas():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM respuestas ORDER BY id ASC")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    # Como usamos RealDictCursor, los rows ya son diccionarios listos para JSON
    return [dict(row) for row in rows]

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("src.app:app", host="0.0.0.0", port=port, reload=True)